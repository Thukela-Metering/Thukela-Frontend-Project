import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, UntypedFormGroup, UntypedFormArray, AbstractControl, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReplaySubject, Subject, Subscription, last, takeUntil } from 'rxjs';
import { BuildingAccountDTO } from 'src/app/DTOs/BuildingAccountDTO';
import { InvoiceDTO } from 'src/app/DTOs/InvoiceDTO';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { TransactionDTO } from 'src/app/DTOs/transactionDTO';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppInvoiceListComponent } from './invoice.component';
import { LineItemDTO } from 'src/app/DTOs/LineItemDTO';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html'
})
export class AppAddInvoiceComponent implements OnInit, OnChanges {
  @Input() localDataFromComponent: InvoiceDTO;
  @Output() saveClicked: EventEmitter<void> = new EventEmitter<void>();
  action: string;
  addForm: UntypedFormGroup | any;
  local_data: InvoiceDTO;
  retrievedBuildings: BuildingDTO[] = [];
  filteredBuildings: ReplaySubject<BuildingDTO[]> = new ReplaySubject<BuildingDTO[]>(1);
  buildingFilterCtrl: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  retrievedOwner: BuildingOwnerDTO[] = [];
  retrievedAccount: BuildingAccountDTO[] = [];
  filteredBuildingsArray: BuildingDTO[] = [];
  private formChangesSubscription: Subscription;
  rows: UntypedFormArray;
  transaction: TransactionDTO = new TransactionDTO();
  invoice: InvoiceDTO = new InvoiceDTO();
  selectedBuilding: BuildingDTO | null = null;
  selectedOwner: BuildingOwnerDTO | null = null;
  selectedAccount: BuildingAccountDTO | null = null;
  invoiceItemList: LineItemDTO[] = [];
  selectedBuildingNum: string | null = null;
  displayedColumns: string[] = ['index', 'itemName', 'description', 'unitPrice', 'units', 'lineDiscount', 'itemTotal', 'actions'];
  minDate: Date;

  subTotal = 0;
  vat = 0.0; 
  grandTotal = 0;
  newNote: string = "";
  dueDateOptions: { label: string, value: Date }[] = [];
  selectedDueDate: Date;
  paymentMethods: {label: string, value: string} []= [];
  selectedPaymentMethod: string;

  constructor(
    private fb: FormBuilder,
    private _invoiceService: InvoiceService,
    private _buildingService: BuildingService,
    private _buildingOwnerService: BuildingOwnerService,
    private _buildingAccountService: BuildingAccountService,
    private snackbarService: SnackbarService,
    public dialogRef: MatDialogRef<AppAddInvoiceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.addForm = this.fb.group({});
    this.rows = this.fb.array([]);
    this.addForm.addControl('rows', this.rows);
    this.rows.push(this.createItemFormGroup());
    this.minDate = new Date();
    this.selectedDueDate = this.minDate;
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    this.addForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      invoiceDate: [this.minDate, Validators.required],
      dueDate: ['', Validators.required],
      billTo: ['', Validators.required],
      note: ['Note: *please contact us if no invoice received, non-receipt does not constitute grounds for non-payment!'],
      rows: this.fb.array([this.createItemFormGroup()])
    });
    this.rows = this.addForm.get('rows') as FormArray;
    this.dialogRef.updateSize('95vw', '95vh');  // Adjusting width and height

    this.rows.valueChanges.subscribe(() => this.itemsChanged());

    this.loadBuildingData();
    this.generatePaymentMethod();
    this.generateDueDateOptions(this.minDate);

    // Listen for changes in the invoiceDate form control and update dueDateOptions
    this.addForm.get('invoiceDate').valueChanges.subscribe((invoiceDate: Date) => {
      this.onInvoiceDateChange(invoiceDate);
    });

    // Listen for changes in the billTo form control and update selectedOwnerAccountNumber
    this.addForm.get('billTo').valueChanges.subscribe((building: BuildingDTO) => {
      this.onBuildingSelectionChange(building);
    });

    // Filter buildings
    this.buildingFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBuildings();
      });

    // Subscribe to filteredBuildings and update filteredBuildingsArray
    this.filteredBuildings
      .pipe(takeUntil(this._onDestroy))
      .subscribe((buildings) => {
        this.filteredBuildingsArray = buildings;
      });

  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterBuildings(): void {
    if (!this.retrievedBuildings) {
      return;
    }
    let search = this.buildingFilterCtrl.value;
    if (!search) {
      this.filteredBuildings.next(this.retrievedBuildings.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredBuildings.next(
      this.retrievedBuildings.filter(building => building.name!.toLowerCase().indexOf(search) > -1)
    );
  }

  onInvoiceDateChange(invoiceDate: Date): void {
    if (invoiceDate) {
      this.generateDueDateOptions(invoiceDate);
      this.addForm.get('dueDate').reset(); // Reset due date when invoice date changes
    }
  }

  generateDueDateOptions(invoiceDate: Date): void {
    const baseDate = invoiceDate || new Date();
    this.dueDateOptions = [
      { label: '7 Days from Invoice Date', value: this.addDays(baseDate, 7) },
      { label: '14 Days from Invoice Date', value: this.addDays(baseDate, 14) },
      { label: '30 Days from Invoice Date', value: this.addDays(baseDate, 30) },
      { label: 'End of This Month', value: this.endOfMonth(baseDate) }
    ];
  }

  generatePaymentMethod(): void {
    this.paymentMethods = [
      { label: 'Cash', value: 'Cash' },
      { label: 'Cheque', value: 'Cheque' },
      { label: 'Credit Card', value: 'Credit Card' },
      { label: 'EFT', value: 'EFT' }
    ];
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  onAddRow(): void {
    if (this.validateLastRow()) {
      this.rows.push(this.createItemFormGroup());
      console.log('Row added:', this.rows.value);
    } else {
      this.snackbarService.openSnackBar('Please fill in all required fields before adding a new row.', 'Close');
    }
  }

  validateLastRow(): boolean {
    const lastRow = this.rows.at(this.rows.length - 1);
    return lastRow && lastRow.valid;
  }

  private loadBuildingData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: any) => {
        this.retrievedBuildings = response.data?.buildingDTOs ?? [];
        this.filteredBuildings.next(this.retrievedBuildings.slice());
        this.filteredBuildingsArray = this.retrievedBuildings.slice();
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  getBuildingOwner(buildingId: number): void {
    this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(buildingId, true).subscribe({
      next: (response: any) => {
        this.retrievedOwner = response.data?.buildingOwnerAccountDTOs ?? [];
        const selectedOwner = this.retrievedOwner.find(owner => owner.buildingId === buildingId);
        if (selectedOwner) {
          const accountNumber = selectedOwner.accountNumber;
          this.generateReferenceNumber(accountNumber || "");
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  getBuildingAccount(): void {
    this._buildingAccountService.getBuildingAccountByBuildingId(this.selectedBuilding?.id || 0).subscribe({
      next: (response: any) => {
        this.retrievedAccount = response.data?.buildingAccountDTOs ?? [];
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  onBuildingSelectionChange(building: BuildingDTO): void {
    if (building) {
      this.selectedBuilding = building;
      this.getBuildingOwner(building.id || 0);
    } else {
      this.selectedBuilding = null;
      this.selectedBuildingNum = null;
    }
  }

  async generateReferenceNumber(accountNumber: string): Promise<void> {
    try {
      const response = await this._invoiceService.getLastInvoiceReference(accountNumber).toPromise();
      if (response && response.data) {
        const lastReference = response.data;
        const parts = lastReference.split('/');
        const lastNumber = parseInt(parts[parts.length - 1], 10);
        this.selectedBuildingNum = `${accountNumber}/${lastNumber}`;
        console.log(`Generated Reference Number: ${this.selectedBuildingNum}`);
      } else {
        this.selectedBuildingNum = `${accountNumber}/1`;
      }
    } catch (error) {
      console.error('Error fetching last invoice reference:', error);
      this.selectedBuildingNum = `${accountNumber}/1`;
    }
  }

  onRemoveRow(rowIndex: number): void {
    const unitPriceControl = this.rows.at(rowIndex).get('unitPrice');
    const unitsControl = this.rows.at(rowIndex).get('units');

    if (unitPriceControl && unitsControl) {
      const totalCostOfItem = (unitPriceControl.value ?? 0) * (unitsControl.value ?? 0);

      this.subTotal -= totalCostOfItem;
      this.grandTotal = this.subTotal + (this.subTotal * this.vat);
    }

    this.rows.removeAt(rowIndex);
    console.log('Row removed:', this.rows.value);
    this.itemsChanged();
  }

  createItemFormGroup(): UntypedFormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      description: ['', Validators.required],
      units: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      lineDiscount: [0, [Validators.min(0)]],
      itemTotal: ['',{ value: 0, disabled: true }]
    });
  }

  itemsChanged(): void {
    let total: number = 0;
    let discountTotal: number = 0;
    const rowsArray = this.addForm.get('rows') as FormArray;

    for (let t = 0; t < rowsArray.length; t++) {
      const row = rowsArray.at(t) as FormGroup;
      const unitPrice = row.get('unitPrice')?.value;
      const units = row.get('units')?.value;
      const discount = row.get('lineDiscount')?.value;

      discountTotal = discount + discountTotal;

      if (unitPrice !== '' && units) {
        const itemTotal = (unitPrice * units);
        row.get('itemTotal')?.setValue(itemTotal, { emitEvent: false }); 
        total += itemTotal;
      }
    }

    this.invoice.discount = discountTotal;
    this.subTotal = total;
    this.vat = this.subTotal * 0.15;
    this.grandTotal = (this.subTotal - discountTotal) + this.vat;
  }

  onLineDiscountBlur(control: AbstractControl): void {
    const row = control as FormGroup;
    if (row.get('lineDiscount')?.value === null || row.get('lineDiscount')?.value === '') {
      row.get('lineDiscount')?.setValue(0);
    }
  }

  async saveDetail(): Promise<void> {
    const formData = this.addForm.value;
    const selectedBuilding = formData.billTo;
    this.invoice.buildingId = selectedBuilding?.id;
    this.invoice.grandTotal = this.grandTotal;
    this.invoice.subTotal = this.subTotal;
    this.invoice.invoiceDate = formData.invoiceDate;
    this.invoice.items = this.rows.value;
    this.invoice.dueDate = formData.dueDate;
    this.invoice.note = formData.note || "Note: *please contact us if no invoice received, non-receipt does not constitute grounds for non-payment!";
    this.invoice.paymentMethod = this.selectedPaymentMethod;
    this.invoice.vat = this.vat;

    const accountNumber = this.retrievedOwner.find(owner => owner.buildingId === selectedBuilding?.id)?.accountNumber;

    if (accountNumber) {
      await this.generateReferenceNumber(accountNumber);
      this.invoice.referenceNumber = this.selectedBuildingNum || '';
      this.invoice.items!.forEach(element => {
        element.invoiceRef = this.selectedBuildingNum!;
      });

      this.saveInvoice();
    } else {
      this.snackbarService.openSnackBar('Error generating reference number', "dismiss");
    }
  }

  saveInvoice(): void {
    this.transaction.invoicesDTOs = [];
    this.transaction.invoicesDTOs.push(this.invoice);

    this._invoiceService.createInvoice(this.transaction).subscribe(
      response => {
        if (response.success) {
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.saveClicked.emit();
          this.dialogRef.close();
        }
      },
      error => {
        console.error('Error adding invoice:', error);
        this.snackbarService.openSnackBar(error.message, "dismiss");
      }
    );
  }
}
