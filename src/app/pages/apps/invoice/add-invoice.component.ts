import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html'
})
export class AppAddInvoiceComponent {
  addForm: FormGroup;
  rows: FormArray;
  displayedColumns: string[] = ['index', 'itemName', 'unitPrice', 'units', 'itemTotal', 'actions'];

  subTotal = 0;
  vat = 0.15; // VAT set to 15% for South African standard
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    public dialogRef: MatDialogRef<AppAddInvoiceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.addForm = this.fb.group({
      payStatus: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      billFrom: ['', Validators.required],
      billTo: ['', Validators.required],
      fromAddress: ['', Validators.required],
      toAddress: ['', Validators.required],
      rows: this.fb.array([this.createItemFormGroup()])
    });
    this.rows = this.addForm.get('rows') as FormArray;
    this.dialogRef.updateSize('90vw', '90vh');  // Adjusting width and height

    this.rows.valueChanges.subscribe(() => this.itemsChanged());
  }

  onAddRow(): void {
    this.rows.push(this.createItemFormGroup());
  }

  onRemoveRow(rowIndex: number): void {
    const unitPriceControl = this.rows.at(rowIndex).get('unitPrice');
    const unitsControl = this.rows.at(rowIndex).get('units');

    if (unitPriceControl && unitsControl) {
      const totalCostOfItem =
        (unitPriceControl.value ?? 0) * (unitsControl.value ?? 0);

      this.subTotal -= totalCostOfItem;
      this.grandTotal = this.subTotal + (this.subTotal * this.vat);
    }

    this.rows.removeAt(rowIndex);
    this.itemsChanged(); // Recalculate totals after removal
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      units: ['', Validators.required],
      unitPrice: ['', Validators.required],
      itemTotal: [{ value: 0, disabled: true }],
    });
  }

  itemsChanged(): void {
    let total: number = 0;
    for (let t = 0; t < this.rows.length; t++) {
      const unitPriceControl = this.rows.at(t).get('unitPrice');
      const unitsControl = this.rows.at(t).get('units');

      if (unitPriceControl && unitsControl) {
        const unitPrice = unitPriceControl.value ?? 0;
        const units = unitsControl.value ?? 0;

        total += unitPrice * units;
        this.rows.at(t).get('itemTotal')?.setValue(unitPrice * units, { emitEvent: false });
      }
    }
    this.subTotal = total;
    this.grandTotal = this.subTotal + (this.subTotal * this.vat);
  }

  saveDetail(): void {
    // Save logic here
  }
}
