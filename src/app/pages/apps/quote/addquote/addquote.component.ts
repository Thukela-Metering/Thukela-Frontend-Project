import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ReplaySubject, Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, switchMap } from 'rxjs/operators';
import { BuildingAccountDTO } from 'src/app/DTOs/BuildingAccountDTO';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { QuotesDTO } from 'src/app/DTOs/QuotesDTO';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { AddQuoteCustomerDetailsComponent } from '../add-quote-customer-details/add-quote-customer-details.component';
import { QuoteService } from 'src/app/services/quotes.service';
import { TempClientDTO } from 'src/app/DTOs/tempClientDTO';
import { BuildingOwnerDTO, ProductDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { SearchService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-addquote',
  templateUrl: './addquote.component.html',
})
export class AddquoteComponent implements OnInit {
  @Input() localDataFromComponent: QuotesDTO;
  @Output() saveClicked: EventEmitter<void> = new EventEmitter<void>();
  addForm: FormGroup;
  quoteDetails: QuotesDTO;
  isUpdateMode: boolean = false;
  retrievedBuildings: BuildingDTO[] = [];
  filteredBuildings: ReplaySubject<BuildingDTO[]> = new ReplaySubject<BuildingDTO[]>(1);
  buildingFilterCtrl: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  retrievedOwner: BuildingOwnerDTO[] = [];
  retrievedAccount: BuildingAccountDTO[] = [];
  selectedBuilding: BuildingDTO | null = null;
  selectedOwner: BuildingOwnerDTO | null = null;
  selectedAccount: BuildingAccountDTO | null = null;
  rows: FormArray;
  quote: QuotesDTO = new QuotesDTO();
  minDate: Date = new Date();
  subTotal = 0;
  vat = 0.0;
  grandTotal = 0;
  filteredProducts: Observable<ProductDTO[]>; // For product autocomplete

  constructor(
    private fb: FormBuilder,
    private _quoteService: QuoteService,
    private _buildingService: BuildingService,
    private _buildingOwnerService: BuildingOwnerService,
    private _buildingAccountService: BuildingAccountService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AddquoteComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _searchService: SearchService // For product search
  ) {
    this.addForm = this.fb.group({
      quoteDate: [this.minDate, Validators.required],
      billTo: [{ value: '', disabled: false }, Validators.required],
      note: ['Price basis: The prices are fixed and firm for the validity period and include VAT. Validity: 30 Days.'],
      useExistingCustomer: [true], // Default to true (existing customer)
      rows: this.fb.array([this.createItemFormGroup()])
    });

    this.rows = this.addForm.get('rows') as FormArray;
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('95vw', '95vh');
    this.rows.valueChanges.subscribe(() => this.itemsChanged());

    this.loadBuildingData();

    if (this.data && this.data.quote) {
      this.isUpdateMode = true;
      this.populateFormWithQuoteData(this.data.quote);
    }

    const quoteDateControl = this.addForm.get('quoteDate');
    const billToControl = this.addForm.get('billTo');

    if (quoteDateControl) {
      quoteDateControl.valueChanges.subscribe((quoteDate: Date) => {
        this.onQuoteDateChange(quoteDate);
      });
    }

    if (billToControl) {
      billToControl.valueChanges.subscribe((building: BuildingDTO) => {
        this.onBuildingSelectionChange(building);
      });
    }

    this.buildingFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBuildings();
      });

    this.addForm.get('useExistingCustomer')?.valueChanges.subscribe(() => {
      this.onUseExistingCustomerChange();
    });

    this.onUseExistingCustomerChange();
  }

  onUseExistingCustomerChange(): void {
    const useExistingCustomer = this.addForm.get('useExistingCustomer')?.value;
    const billToControl = this.addForm.get('billTo');

    if (useExistingCustomer) {
        billToControl?.enable();
    } else {
        billToControl?.disable();
    }
}

  async populateFormWithQuoteData(quote: QuotesDTO): Promise<void> {
    this.quoteDetails = quote;

    if (quote.buildingId) {
        await this.getBuildingOwner(quote.buildingId);
    }

    this.addForm.patchValue({
        quoteDate: quote.dateCreated,
        billTo: this.retrievedOwner[0]?.name || quote.tempClient?.name || '',
        note: quote.note,
    });

    const rowsArray = this.addForm.get('rows') as FormArray;
    rowsArray.clear();
    quote.items?.forEach(item => {
        rowsArray.push(this.fb.group({
            itemName: [item.itemName, Validators.required],
            description: [item.description, Validators.required],
            units: [item.units, [Validators.required, Validators.min(1)]],
            unitPrice: [item.unitPrice, [Validators.required, Validators.min(0.01)]],
            lineDiscount: [item.lineDiscount, [Validators.min(0)]],
            itemTotal: [item.itemTotal, { disabled: true }]
        }));
    });

    this.itemsChanged();
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
      this.retrievedBuildings.filter(building => building.name!.toLowerCase().includes(search))
    );
  }

  onQuoteDateChange(quoteDate: Date): void {}

  onAddRow(): void {
    if (this.validateLastRow()) {
      this.rows.push(this.createItemFormGroup());
    } else {
      this.snackbarService.openSnackBar('Please fill in all required fields before adding a new row.', 'Close');
    }
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AddQuoteCustomerDetailsComponent, {
      width: '600px',
      data: obj,
    });
  
    dialogRef.afterClosed().subscribe((clientDetails: TempClientDTO) => {
      if (clientDetails) {
        // Bind the returned client details to the quote's tempClient
        this.quote.tempClient = clientDetails;
  
        // Update the billTo field with the TempClient's name
        this.addForm.patchValue({ billTo: clientDetails.name });
      }
    });
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
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  private async getBuildingOwner(buildingId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(buildingId, true).subscribe({
        next: (response: any) => {
          this.retrievedOwner = response.data?.buildingOwnerAccountDTOs ?? [];
          resolve();
        },
        error: (error) => {
          console.error('There was an error!', error);
          reject(error);
        }
      });
    });
  }

  getBuildingAccount(buildingId: number): void {
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
      this.getBuildingAccount(building.id || 0);
      this.getBuildingOwner(building.id || 0);
    } else {
      this.selectedBuilding = null;
    }
  }

  onRemoveRow(rowIndex: number): void {
    this.rows.removeAt(rowIndex);
    this.itemsChanged();
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      description: ['', Validators.required],
      units: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      lineDiscount: [0, [Validators.min(0)]],
      itemTotal: ['', { value: 0, disabled: true }]
    });
  }

  itemsChanged(): void {
    let total: number = 0;
    let discountTotal: number = 0;

    this.rows.controls.forEach((row) => {
      const item = row.value;
      discountTotal += item.lineDiscount;
      const itemTotal = (item.unitPrice * item.units);
      row.get('itemTotal')?.setValue(itemTotal, { emitEvent: false });
      total += itemTotal;
    });

    this.quote.discount = discountTotal;
    this.subTotal = total;
    this.vat = this.subTotal * 0.15;
    this.grandTotal = (this.subTotal - discountTotal) + this.vat;
  }

  // This method is used for product search functionality
  onItemNameInput(row: AbstractControl, event: Event): void {
    const input = (event.target as HTMLInputElement).value;
  
    if (input.length >= 2) {
      this.filteredProducts = this._searchService.searchProduct(input).pipe(
        debounceTime(300),
        switchMap(() => this._searchService.searchProduct(input))
      );
    } else {
      this.filteredProducts = new Observable<ProductDTO[]>();  // Clear previous results if input is too short
    }
  }

  // Method to handle product selection from autocomplete
  onProductSelected(row: AbstractControl, selectedProduct: ProductDTO): void {
    row.patchValue({
      itemName: selectedProduct.name,
      description: selectedProduct.description,
      unitPrice: selectedProduct.sellingPrice,
      units: 1
    });
    this.itemsChanged();  // Recalculate totals
  }

  onLineDiscountBlur(control: AbstractControl): void {
    const row = control as FormGroup;
    if (row.get('lineDiscount')?.value === null || row.get('lineDiscount')?.value === '') {
      row.get('lineDiscount')?.setValue(0);
    }
  }

  private convertToSAST(date: Date): Date {
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const sastOffset = 2 * 60 * 60000;
    const sastTime = utcTime + sastOffset;
    return new Date(sastTime);
  }

  async saveDetail(): Promise<void> {
    const formData = this.addForm.value;
  
    // Initialize the quote object correctly
    const quote = this.quoteDetails || new QuotesDTO();
  
    // Bind data to the QuotesDTO object
    const selectedBuilding = formData.billTo;
    const accountId = this.retrievedAccount.find(x => x.id);
    const ownerId = this.retrievedOwner.find(i => i.id);
  
    // Update the quote details
    quote.buildingId = selectedBuilding?.id;
    quote.buildingAccountId = accountId?.id || 0;
    quote.buildingOwnerId = ownerId?.id!;
    quote.quoteDate = this.convertToSAST(new Date(formData.quoteDate)); // Convert quoteDate to SAST
  
    quote.note = formData.note || "Price basis: The prices are fixed and firm for the validity period and include VAT. Validity: 30 Days";
    quote.items = this.rows.value; // Bind items from the table
    quote.subTotal = this.subTotal;
    quote.vat = this.vat;
    quote.discount = quote.discount || 0;
    quote.grandTotal = this.grandTotal;
    quote.isActive = true;
  
    if (!this.addForm.get('useExistingCustomer')?.value) {
      // Check if tempClient details exist and assign them to the quote
      if (this.quote.tempClient) {
        quote.tempClient = this.quote.tempClient;
      } else {
        this.snackbarService.openSnackBar('Please add client details.', 'Close');
        return;
      }
    }
  
    const transactionDTO = new TransactionDTO();
    transactionDTO.quotesDTOs = [quote];
  
    if (this.isUpdateMode && quote.guid) {
      // Update the existing quote
      this._quoteService.updateQuote(transactionDTO).subscribe(
        (response) => {
          if (response.success) {
            this.snackbarService.openSnackBar('Quote updated successfully!', 'Close');
            this.saveClicked.emit();
            this.dialogRef.close(response.data);
          } else {
            this.snackbarService.openSnackBar('Failed to update the quote.', 'Close');
          }
        },
        (error) => {
          console.error('Error updating quote:', error);
          this.snackbarService.openSnackBar('Failed to update the quote.', 'Close');
        }
      );
    } else {
      // Create a new quote
      this._quoteService.createQuote(transactionDTO).subscribe(
        (response) => {
          if (response.success) {
            this.snackbarService.openSnackBar('Quote saved successfully!', 'Close');
            this.saveClicked.emit();
            this.dialogRef.close(response.data);
          } else {
            this.snackbarService.openSnackBar('Failed to save the quote.', 'Close');
          }
        },
        (error) => {
          console.error('Error saving quote:', error);
          this.snackbarService.openSnackBar('Failed to save the quote.', 'Close');
        }
      );
    }
  }  
}
