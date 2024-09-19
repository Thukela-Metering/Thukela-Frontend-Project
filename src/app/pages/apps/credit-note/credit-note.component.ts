import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { BuildingOwnerDTO, InvoiceDTO, PaymentStatus, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CreditNoteDTO } from 'src/app/DTOs/CreditNoteDTO';
import { LineItemDTO } from 'src/app/DTOs/LineItemDTO';
import { MatTableDataSource } from '@angular/material/table';
import { CreditNoteService } from 'src/app/services/credit-note.service'; // Import the CreditNoteService

@Component({
  selector: 'app-credit-note',
  templateUrl: './credit-note.component.html',
})
export class CreditNoteComponent implements OnInit {
  invoiceDetail: InvoiceDTO;
  dataSource: MatTableDataSource<LineItemDTO>;
  retrievedBuildings: BuildingOwnerDTO[] = [];
  foundOwnerAccount: BuildingOwnerDTO | undefined;
  displayedColumns: string[] = ['itemName', 'description', 'unitPrice', 'units', 'lineDiscount', 'itemTotal', 'creditNoteValue'];
  invoiceForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDTO,
    public dialogRef: MatDialogRef<CreditNoteComponent>,
    private fb: FormBuilder,
    private _buildingOwnerService: BuildingOwnerService,
    private snackbarService: SnackbarService,
    private creditNoteService: CreditNoteService // Inject the CreditNoteService
  ) {
    console.log('Initializing CreditNoteComponent with data:', this.data);
    this.invoiceDetail = data;
    this.dataSource = new MatTableDataSource<LineItemDTO>(this.invoiceDetail.items || []);
    this.invoiceForm = this.fb.group({
      creditNoteValues: this.fb.array([], this.atLeastOneValueValidator())
    });
  }

  ngOnInit(): void {
    console.log('CreditNoteComponent ngOnInit');
    this.loadBuildingOwnerListData();
    this.initForm();
  }

  initForm(): void {
    const creditNoteValuesArray = this.invoiceDetail.items!.map(item => this.fb.control(0, [Validators.min(0)]));
    this.invoiceForm.setControl('creditNoteValues', this.fb.array(creditNoteValuesArray));
    console.log('Invoice items:', this.invoiceDetail.items);
  }

  loadBuildingOwnerListData(): void {
    console.log('Loading building owner list data');
    this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(this.data.buildingId ?? 0, true).subscribe({
      next: (response: any) => {
        console.log('Building owner data loaded:', response);
        this.retrievedBuildings = response.data?.buildingOwnerAccountDTOs ?? [];
        this.foundOwnerAccount = response.data?.buildingOwnerAccountDTOs[0];
      },
      error: (error) => {
        console.error('Error loading building owner data:', error);
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onCreditNoteValueChanged(event: any, index: number): void {
    const creditNoteValuesArray = this.invoiceForm.get('creditNoteValues') as FormArray;
    creditNoteValuesArray.at(index).patchValue(parseFloat(event.target.value));
  }

  submitCreditNote(): void {
    const creditNoteValuesArray = this.invoiceForm.get('creditNoteValues') as FormArray;
    if (!creditNoteValuesArray.controls.some(control => control.value > 0)) {
      this.snackbarService.openSnackBar('Please fill in at least one credit note value.', 'Close', 5000);
      return;
    }

    console.log('Submitting credit note');
    let totalCreditNoteValue = 0;

    creditNoteValuesArray.controls.forEach((control, index) => {
      const creditNoteValue = control.value;
      if (creditNoteValue > 0) {
        totalCreditNoteValue += creditNoteValue;
        this.invoiceDetail.items![index].isCreditNote = true;
        this.invoiceDetail.items![index].creditNoteLineValue = creditNoteValue;
      } else {
        this.invoiceDetail.items![index].isCreditNote = false;
      }
    });

    const creditNoteDTO: CreditNoteDTO = {
      invoiceReferenceNumber: this.invoiceDetail.referenceNumber,
      creditNoteDate: new Date(),
      creditNoteTotal: totalCreditNoteValue,
      buildingOwnerId: this.foundOwnerAccount?.id,
      buildingAccountId: this.invoiceDetail.buildingAccountId,
      items: this.invoiceDetail.items?.filter(item => item.isCreditNote),
      isActive: true
    };

    console.log('Submitted Credit Note DTO:', creditNoteDTO);
    this.createCreditNoteTransaction(creditNoteDTO);
  }

  createCreditNoteTransaction(creditNoteDTO: CreditNoteDTO): void {
    const transactionDTO: TransactionDTO = {
      creditNoteDTOs: [creditNoteDTO]
    };

    this.creditNoteService.createCreditNote(transactionDTO).subscribe(
      response => {
        if (response.success) {
          this.snackbarService.openSnackBar('Credit note created successfully.', 'Close', 5000);
          this.dialogRef.close({ event: "Add CreditNote", data: response.data });
          this.dialogRef.close(response.data);
        } else {
          this.snackbarService.openSnackBar('Failed to create credit note.', 'Close', 5000);
        }
      },
      error => {
        console.error('Error creating credit note:', error);
        this.snackbarService.openSnackBar('Error creating credit note.', 'Close', 5000);
      }
    );
  }

  atLeastOneValueValidator(): ValidatorFn {
    return (formArray: AbstractControl): { [key: string]: boolean } | null => {
      const hasAtLeastOne = (formArray as FormArray).controls.some(control => control.value > 0);
      return hasAtLeastOne ? null : { atLeastOneValue: true };
    };
  }

  mapStatusToString(status: PaymentStatus | undefined): string {
    switch (status) {
      case PaymentStatus.Paid:
        return 'Paid';
      case PaymentStatus.Unpaid:
        return 'Unpaid';
      case PaymentStatus.PartiallyPaid:
        return 'Partially Paid';
      default:
        return 'Unknown';
    }
  }

  getStatusColor(status: PaymentStatus | undefined): string {
    switch (status) {
      case PaymentStatus.Paid:
        return '#a3e4a1';
      case PaymentStatus.Unpaid:
        return '#f5a2a2';
      case PaymentStatus.PartiallyPaid:
        return '#fff6a2';
      default:
        return 'transparent';
    }
  }
}
