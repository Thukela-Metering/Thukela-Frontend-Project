import { DatePipe } from "@angular/common";
import { Component, Inject, Input, OnChanges, OnInit, Optional, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { badDeptDTO } from "src/app/DTOs/dtoIndex";
import { LookupValueDTO } from "src/app/DTOs/lookupValueDTO";
import { OperationalResultDTO } from "src/app/DTOs/operationalResultDTO";
import { TransactionDTO } from "src/app/DTOs/transactionDTO";
import { AuthService } from "src/app/services/auth.service";
import { BadDeptService } from "src/app/services/badDept.service";
import { SnackbarService } from "src/app/services/snackbar.service";

@Component({
    selector: 'app-bad-dept-content',
    templateUrl: 'BadDeptModal.html',
  })
  
  export class AppBadDeptModalComponent implements OnInit, OnChanges {
    badDeptForm: FormGroup;
    @Input() localDataFromComponent: badDeptDTO;
    action: string;
    badDeptDTO: badDeptDTO = new badDeptDTO();
    local_data: badDeptDTO;
    DropDownValues: LookupValueDTO[] = [];
    constructor(
        private fb: FormBuilder,
      @Optional() public dialogRef: MatDialogRef<AppBadDeptModalComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: badDeptDTO,
      private _badDeptService: BadDeptService,
      public datePipe: DatePipe,
      private authService: AuthService,
      private snackbarService: SnackbarService,
    ) {
      this.local_data = { ...data };
      this.action = this.local_data.action ? this.local_data.action : "Update";
    }
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['localDataFromComponent'] && changes['localDataFromComponent'].currentValue) {
        this.badDeptForm.patchValue(this.localDataFromComponent);
      }
    }
    ngOnInit(): void {
      this.getDropdownValues();
      this.badDeptForm = this.fb.group({
        amount: ['', Validators.required],
        closeAccount: [false, Validators.required],
        buildingAccountNumber: [{ value: '', disabled: true }],        
        note: [''],
      });
      this.badDeptForm.patchValue(this.local_data);

      this.badDeptForm.get('closeAccount')?.valueChanges.subscribe(isClosed => {
        if (isClosed) {
          // If the toggle is checked (true), set the amount to nsp_AccountRunningBalance and disable the field
          this.badDeptForm.get('amount')?.setValue(this.local_data.nsp_AccountRunningBalance || 0);
          this.badDeptForm.get('amount')?.disable();
        } else {
          this.badDeptForm.get('amount')?.setValue(this.badDeptForm.controls['amount'].value || 0);
          // If the toggle is unchecked (false), enable the amount field and clear the value if needed
          this.badDeptForm.get('amount')?.enable();
        }
      });
    }
  
    getDropdownValues() {
      var userRoleResponse = this.authService.getLookupValues().subscribe(
        (response: OperationalResultDTO<TransactionDTO>) => {
          if (response.success) {
            if (response.data != null) {
              this.DropDownValues = response.data.lookupValueDTOs!.map((item: any) => {
                const lookupValue: LookupValueDTO = new LookupValueDTO();
                lookupValue.id = item.id;
                lookupValue.name = item.name;
                lookupValue.description = item.description;
                lookupValue.lookupGroupValueId = item.lookupGroupValueId;
                lookupValue.lookupGroupValueValue = item.lookupGroupValueValue;
                lookupValue.lookupListValueId = item.lookupListValueId;
                lookupValue.lookupListValueValue = item.lookupListValueValue;
                lookupValue.dateCreated = item.dateCreated;
                return lookupValue;
              });
             }
          }
        },
        error => {
          // Handle error
          console.error(error);
        }
      );
    }
    doAction(): void {
      if (this.action === "Add") {
        // Update badDeptDTO properties from the form values
        this.badDeptDTO.action = this.action;
        this.badDeptDTO.id = this.local_data.id;
        this.badDeptDTO.buildingAccountId = this.local_data.buildingAccountId;
        this.badDeptDTO.buildingAccountNumber = this.local_data.buildingAccountNumber;
    
        // Get the values from the form for amount and closeAccount
        this.badDeptDTO.amount = this.badDeptForm.get('amount')?.value;  // Get amount from form control
        this.badDeptDTO.closeAccount = this.badDeptForm.get('closeAccount')?.value;  // Get closeAccount from form control
        this.badDeptDTO.note = this.badDeptForm.get('note')?.value;  // Get note from form control
    
        this.addRowData(this.badDeptDTO);
        
        if (this.dialogRef) {
          this.dialogRef.close({ event: this.action, data: this.local_data });
        }
      }
    }
    onCancel() {
      this.badDeptForm.reset();
      this.dialogRef.close({ event: 'Cancel' });
    }
  
    addRowData(row_obj: badDeptDTO): void {
      this._badDeptService.createBadDept(row_obj).subscribe(
        response => {
          console.log(response);         
          this.snackbarService.openSnackBar(response.message, "dismiss");
          console.log(row_obj);
        },
        error => {
          this.snackbarService.openSnackBar(error.message, "dismiss");
          console.error(error);
        }
      );
    }
  
  
    closeDialog(): void {
      this.dialogRef.close({ event: 'Cancel' });
    }
  }
  