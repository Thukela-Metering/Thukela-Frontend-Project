import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TempClientDTO } from 'src/app/DTOs/tempClientDTO';

@Component({
  selector: 'app-add-quote-customer-details',
  templateUrl: './add-quote-customer-details.component.html',
})
export class AddQuoteCustomerDetailsComponent implements OnInit {
  clientForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddQuoteCustomerDetailsComponent>,
  ) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      taxNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const clientDetails: TempClientDTO = this.clientForm.value;
      this.dialogRef.close(clientDetails); // Close the modal and pass the data
    }
  }
}
