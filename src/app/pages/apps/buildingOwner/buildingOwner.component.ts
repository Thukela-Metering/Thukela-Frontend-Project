import { Component, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
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

@Component({
  selector: 'app-building-owner-dialog-content',
  templateUrl: 'buildingOwner.component.html',
})
export class AppBuildingOwnerComponent implements OnInit {
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
    public dialogRef: MatDialogRef<AppBuildingOwnerComponent>,
    private fb: FormBuilder,
    private _buildingOwnerService: BuildingOwnerService,
    private _buildingService: BuildingService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BuildingOwnerDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
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
      isActive:[''],
      preferredCommunication: ['', Validators.required],
      additionalInformation: ['']
    });

    this.onPreferredCommunicationChange();
    this.loadBuildingOwnerListData();
    this.setupBuildingFilter();
    if(this.data != null){
      this.accountForm.patchValue(this.data);
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
        if (value === 'mobile') {
          contactNumberControl?.setValidators([Validators.required]);
        } else {
          contactNumberControl?.clearValidators();
        }
        contactNumberControl?.updateValueAndValidity(); // Important to apply the validation changes
      });
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
            if(response.success){
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
      this.dialogRef.close({ event: this.action, data: this.local_data });
    }
  }

  onCancel() {
    this.accountForm.reset();
    this.dialogRef.close({event: 'Cancel'});
  }


}