import { Component, OnInit, OnDestroy, Optional, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingService } from 'src/app/services/building.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LookupValueDTO } from 'src/app/DTOs/lookupValueDTO';
import { OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { LookupValueManagerService } from 'src/app/services/lookupValueManager.service';

@Component({
  selector: 'app-building-owner-dialog-content',
  templateUrl: 'buildingOwner.component.html',
})
export class AppBuildingOwnerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() localDataFromComponent: BuildingOwnerDTO;
  action: string;
  local_data: BuildingOwnerDTO;
  DropDownValues: LookupValueDTO[] = [];
  accountForm: FormGroup;
  banks = ['Bank A', 'Bank B', 'Bank C'];
  private formChangesSubscription: Subscription;
  buildingFilterCtrl: FormControl = new FormControl();
  buildings: BuildingDTO[] = [];
  filteredBuildings: BuildingDTO[] = [...this.buildings];

  constructor(
    @Optional() public dialogRef: MatDialogRef<AppBuildingOwnerComponent>,
    private fb: FormBuilder,
    private _buildingOwnerService: BuildingOwnerService,
    private _buildingService: BuildingService,
    private lookupValueService: LookupValueManagerService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BuildingOwnerDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['localDataFromComponent'] && changes['localDataFromComponent'].currentValue) {
      if (this.accountForm) {
        this.accountForm.patchValue(this.localDataFromComponent);
      }
    }
  }
  ngOnInit(): void {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fax: [''],
      contactNumber: [''],
      buildingId: ['', Validators.required],
      accountNumber: [''],
      bank: ['', Validators.required],
      taxable: [false, Validators.required],
      address: [''],
      isActive: [''],
      preferredCommunication: ['', Validators.required],
      additionalInformation: ['']
    });

    // this.onPreferredCommunicationChange();
    this.getDropdownValues("Bank", "Bank");
    this.loadBuildingOwnerListData();
    this.setupBuildingFilter();
    if (this.data != null) {
      this.accountForm.patchValue(this.local_data);
      this.accountForm.get('preferredCommunication')?.setValue(9);
      console.log(this.accountForm);
    }
    if (this.localDataFromComponent) {
      this.accountForm.patchValue(this.localDataFromComponent);
    }
  }

  setupBuildingFilter(): void {
    this.buildingFilterCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterBuildings(value || ''); // Use an empty string if value is falsy
    });
  }

  loadBuildingOwnerListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response) => {
        this.buildings = response.data?.buildingDTOs ?? [];
        this.filteredBuildings = this.buildings;
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  filterBuildings(filter: string): void {
    const filterValue = filter ? filter.toLowerCase() : '';
    this.filteredBuildings = this.buildings.filter(option => option.name?.toLowerCase().includes(filterValue));
  }

  onPreferredCommunicationChange() {
    this.formChangesSubscription = this.accountForm.get('preferredCommunication')!.valueChanges
      .subscribe(value => {
        const contactNumberControl = this.accountForm.get('contactNumber');
        if (value === '10') {
          contactNumberControl?.setValidators([Validators.required]);
        } else {
          contactNumberControl?.clearValidators();
        }
        contactNumberControl?.updateValueAndValidity(); // Important to apply the validation changes
      });
  }

  getDropdownValues(lookupGroupValue: string, lookupListValue: string) {
    this.lookupValueService.getLookupValueList(lookupGroupValue, lookupListValue).subscribe(
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
        console.log(response);
      },
      error => {
        // Handle error
        console.error(error);
      }
    );
  }

  onSubmit() {
    if (this.action == "Add") {
      if (this.accountForm.valid) {
        const buildingOwnerData = new BuildingOwnerDTO();
        Object.assign(buildingOwnerData, this.accountForm.value, {
          preferredCommunication: this.accountForm.value.preferredCommunication === 'email'
        });
        this._buildingOwnerService.addNewBuildingOwner(buildingOwnerData).subscribe(
          response => {
            if (response.success) {
              this.snackbarService.openSnackBar(response.message, "dismiss");
              this.accountForm.reset();
              this.dialogRef.close({ event: 'Add', data: buildingOwnerData });
              this.loadBuildingOwnerListData();
            }
          },
          error => {
            this.snackbarService.openSnackBar(error, "dismiss");
            console.error('Error adding building owner:', error);
          }
        );
      }
    } else {
      this.mapFormValuesToLocalData();
      if (this.dialogRef) {
        this.dialogRef.close({ event: this.action, data: this.local_data });
      }else
      {
        this.updateRowData(this.local_data);
      }
    }
  }

  private mapFormValuesToLocalData(): void {
    this.local_data.name = this.accountForm.get('name')?.value;
    this.local_data.email = this.accountForm.get('email')?.value;
    this.local_data.fax = this.accountForm.get('fax')?.value;
    this.local_data.contactNumber = this.accountForm.get('contactNumber')?.value;
    this.local_data.buildingId = this.accountForm.get('buildingId')?.value;
    this.local_data.accountNumber = this.accountForm.get('accountNumber')?.value;
    this.local_data.bank = this.accountForm.get('bank')?.value;
    this.local_data.taxable = this.accountForm.get('taxable')?.value;
    this.local_data.address = this.accountForm.get('address')?.value;
    this.local_data.isActive = this.accountForm.get('isActive')?.value;
    this.local_data.preferredCommunication = this.accountForm.get('preferredCommunication')?.value;
    this.local_data.additionalInformation = this.accountForm.get('additionalInformation')?.value;
  }
  updateRowData(row_obj: BuildingOwnerDTO): boolean | any {
      this._buildingOwnerService.updateBuildingOwnerData(row_obj).subscribe({
        next: (response) => {
          if (response) {
            console.log(response);
            this.loadBuildingOwnerListData();
            this.snackbarService.openSnackBar(response.message, "dismiss");
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
          this.snackbarService.openSnackBar(error.message, "dismiss");
        }
      });
      return true;
  }

  onCancel() {
    this.accountForm.reset();
    this.dialogRef.close({ event: 'Cancel' });
  }

  ngOnDestroy(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }
}
