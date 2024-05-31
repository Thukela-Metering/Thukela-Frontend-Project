import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { BuildingAccountDTO } from 'src/app/DTOs/BuildingAccountDTO';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { da } from 'date-fns/locale';

@Component({
  selector: 'app-building-accounts',
  templateUrl: './building-account.component.html',
})
export class BuildingAccountsComponent implements OnInit {
  accountsForm: FormGroup;
  action: string;
  buildingAccount: BuildingAccountDTO[] = [];
  local_data: BuildingAccountDTO;
  buildings: BuildingDTO[] = [];
  filteredBuildings: BuildingDTO[] = [];
  buildingFilterCtrl: FormControl = new FormControl();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BuildingAccountsComponent>,
    private _buildingAccountService: BuildingAccountService,
    private snackbarService: SnackbarService,
    private _buildingService: BuildingService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BuildingDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
  }

  ngOnInit(): void {
    this.accountsForm = this.fb.group({
      buildingId: ['', Validators.required],
      municipalityOne: ['', Validators.required],
      municipalityTwo: [''],
      readingSlip: ['', Validators.required],
      creditControl: [''],
      centerOwner: ['', Validators.required],
      isActive: [''],
    });

    this.loadBuildingListData();
    this.buildingFilterCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterBuildings(value || ''); // Use an empty string if value is falsy
    });
    if(this.data != null){
      this.accountsForm.patchValue(this.local_data);
    }
  }

  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: any) => {
        if (response) {
          this.buildings = response.data?.buildingDTOs ?? [];
          this.filteredBuildings = this.buildings;
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
    if(this.action == "Add"){
    var some = new BuildingAccountDTO();
    some.buildingId = this.accountsForm.get("buildingId")?.value;
    some.municipalityOne = this.accountsForm.get("municipalityOne")?.value;
    some.municipalityTwo = this.accountsForm.get("municipalityTwo")?.value;
    some.readingSlip = this.accountsForm.get("readingSlip")?.value;
    some.creditControl = this.accountsForm.get("creditControl")?.value;
    some.centerOwner = this.accountsForm.get("centerOwner")?.value;
    some.isActive = true;
    console.log("the value in onSubmit: ");
    console.log(this.local_data);
      this._buildingAccountService.addNewBuildingAccount(this.local_data).subscribe(
        response => {
          console.log(response);
          this.buildingAccount.push(this.local_data);
          console.log(some);
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.accountsForm.reset();
          this.onCancel();
        },
        error => {
          console.error(error);
          this.snackbarService.openSnackBar(error.message, "dismiss");
        }
    );
  }else{
  //  this.mapFormValuesToLocalData();
    //this.local_data.isActive = this.accountsForm.value.isActive;
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }
  }
  private mapFormValuesToLocalData(): void {
    this.local_data.buildingId = this.accountsForm.get("buildingId")?.value;
    this.local_data.municipalityOne = this.accountsForm.get("municipalityOne")?.value;
    this.local_data.municipalityTwo = this.accountsForm.get("municipalityTwo")?.value;
    this.local_data.readingSlip = this.accountsForm.get("readingSlip")?.value;
    this.local_data.creditControl = this.accountsForm.get("creditControl")?.value;
    this.local_data.centerOwner = this.accountsForm.get("centerOwner")?.value;
    this.local_data.isActive = this.accountsForm.get("isActive")?.value;
  }
  onCancel() {
    // Reset the form or navigate away
    this.accountsForm.reset();
    this.dialogRef.close({ event: 'Cancel' });
  }
}