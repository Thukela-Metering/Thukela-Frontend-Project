import { Component, OnInit, OnDestroy, Optional, Inject, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingService } from 'src/app/services/building.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LookupValueDTO } from 'src/app/DTOs/lookupValueDTO';
import { OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { LookupValueManagerService } from 'src/app/services/lookupValueManager.service';

@Component({
  selector: 'app-building-owner-dialog-content',
  templateUrl: 'buildingOwner.component.html',
})
export class AppBuildingOwnerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() localDataFromComponent: BuildingOwnerDTO;
  @Input() isPortfolioCreation: boolean = false;
  @Input() selectedBuilding: BuildingDTO;

  @Output() submissionSuccess = new EventEmitter<BuildingOwnerDTO>();

  action: string;
  local_data: BuildingOwnerDTO;
  DropDownValues: LookupValueDTO[] = [];
  accountForm: FormGroup;
  private formChangesSubscription: Subscription;
  buildingFilterCtrl: FormControl = new FormControl();
  buildings: BuildingDTO[] = [];
  filteredBuildings: BuildingDTO[] = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<AppBuildingOwnerComponent>,
    private fb: FormBuilder,
    private _buildingOwnerService: BuildingOwnerService,
    private _buildingService: BuildingService,
    private lookupValueService: LookupValueManagerService,
    private snackbarService: SnackbarService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BuildingOwnerDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data?.action ?? "Update";
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isPortfolioCreation && this.selectedBuilding) {
      this.action = "Add";
      this.accountForm.patchValue({ buildingId: this.selectedBuilding.id });
      const existingBuilding = this.filteredBuildings.find(b => b.id === this.selectedBuilding.id);
      if (!existingBuilding) {
        this.filteredBuildings.push(this.selectedBuilding);
      }
    }
  }

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fax: [''],
      contactNumber: [''],
      buildingId: [{ value: this.selectedBuilding ? this.selectedBuilding.id : '', disabled: this.action !== 'Add' }, Validators.required],
      accountNumber: [''],
      bank: ['', Validators.required],
      taxable: [false, Validators.required],
      address: [''],
      isActive: [''],
      preferredCommunication: ['', Validators.required],
      additionalInformation: ['']
    });

    this.loadBuildingOwnerListData();
    this.getDropdownValues("Bank", "Bank");

    if (this.data != null) {
      this.accountForm.patchValue(this.local_data);
      this.accountForm.get('preferredCommunication')?.setValue(9);
      console.log(this.accountForm);
    }

    this.buildingFilterCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterBuildings(value || '');
    });

    // Ensure unique IDs
    this.filteredBuildings = Array.from(new Set(this.filteredBuildings.map(b => b.id)))
      .map(id => this.filteredBuildings.find(b => b.id === id)!);

    if (this.localDataFromComponent) {
      this.accountForm.patchValue(this.localDataFromComponent);
    }
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

  loadBuildingOwnerListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: any) => {
        if (response) {
          this.buildings = response.data?.buildingDTOs ?? [];
          this.filteredBuildings = this.buildings;

          // If a building is already selected (in case of portfolio creation), ensure it's in the list
          if (this.selectedBuilding) {
            const existingBuilding = this.buildings.find(b => b.id === this.selectedBuilding.id);
            if (!existingBuilding) {
              this.buildings.push(this.selectedBuilding);
              this.filteredBuildings.push(this.selectedBuilding);
            }

            // Set the selected building
            this.accountForm.patchValue({ buildingId: this.selectedBuilding.id });
          }
        }
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

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.mapFormValuesToLocalData();

      const actionData = this.local_data?.action ? this.local_data : this.localDataFromComponent;
      if (actionData.action === "Add") {
        this._buildingOwnerService.addNewBuildingOwner(this.local_data).subscribe(
          response => {
            this.snackbarService.openSnackBar(response.message, "dismiss");
            this.accountForm.reset();
            this.loadBuildingOwnerListData();

            this.submissionSuccess.emit(this.local_data);

            if (!this.isPortfolioCreation) {
              this.finalizeDialogClose('Add', this.local_data);
            }
          },
          error => {
            this.snackbarService.openSnackBar(error, "dismiss");
            console.error('Error adding building owner:', error);
          }
        );
      } else {
        this.updateRowData(this.local_data);

        this.submissionSuccess.emit(this.local_data);

        if (!this.isPortfolioCreation) {
          this.dialogRef.close({ event: this.action, data: this.local_data });
        }
      }
    }
  }

  finalizeDialogClose(action: string, data: any) {
    setTimeout(() => {
      if (this.dialogRef) {
        this.dialogRef.close({ event: action, data: data });
      }
    }, 300);
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

  updateRowData(row_obj: BuildingOwnerDTO): void {
    this._buildingOwnerService.updateBuildingOwnerData(row_obj).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackbarService.openSnackBar(response.message, 'dismiss');
          if (!this.isPortfolioCreation) {
            this.dialogRef.close({ event: 'Update', data: response });
          } else {
            this.submissionSuccess.emit(row_obj);
          }
        } else {
          this.snackbarService.openSnackBar(response.message, 'dismiss');
          if (!this.isPortfolioCreation) {
            this.dialogRef.close({ event: 'Update', data: response });
          }
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.snackbarService.openSnackBar(error.message, 'dismiss');
      }
    });
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
