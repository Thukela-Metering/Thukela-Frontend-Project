import { Component, Inject, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { BuildingAccountDTO } from 'src/app/DTOs/BuildingAccountDTO';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-building-accounts',
  templateUrl: './building-account.component.html',
})
export class BuildingAccountsComponent implements OnInit, OnChanges {
  @Input() localDataFromComponent: BuildingAccountDTO;
  accountsForm: FormGroup;
  action: string;
  buildingAccount: BuildingAccountDTO[] = [];
  local_data: BuildingAccountDTO;
  buildings: BuildingDTO[] = [];
  filteredBuildings: BuildingDTO[] = [];
  buildingFilterCtrl: FormControl = new FormControl();

  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<BuildingAccountsComponent>,
    private _buildingAccountService: BuildingAccountService,
    private snackbarService: SnackbarService,
    private buildingAccountService: BuildingAccountService,
    private _buildingService: BuildingService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BuildingDTO,
  ) {
    this.local_data = { ...data };
    if(this.data != null){
      this.action = this.local_data.action ? this.local_data.action : "Update";
    }else
    {
      this.action = "Add";
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['localDataFromComponent'] && changes['localDataFromComponent'].currentValue) {
      if (this.accountsForm) {
        this.accountsForm.patchValue(this.localDataFromComponent);
      }
      this.action = this.localDataFromComponent.action ? this.localDataFromComponent.action : "Update";
    }
  }

  ngOnInit(): void {
    this.accountsForm = this.fb.group({
      buildingId: ['', Validators.required],
      municipalityOne: ['', Validators.required],
      municipalityTwo: [''],
      readingSlip: [false, Validators.required], // Initialize as boolean
      creditControl: [false], // Initialize as boolean
      isActive: [false],
      buildingTaxNumber: [''],
      bookNumber: ['',Validators.required],
    });

    this.loadBuildingListData();
    this.buildingFilterCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterBuildings(value || ''); // Use an empty string if value is falsy
    });

    if (this.data != null) {
      this.accountsForm.patchValue(this.data);
    }
    if (this.localDataFromComponent) {
      this.accountsForm.patchValue(this.localDataFromComponent);
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
    if (this.action == "Add") {
      var some = new BuildingAccountDTO();
      some.buildingId = this.accountsForm.get("buildingId")?.value;
      some.municipalityOne = this.accountsForm.get("municipalityOne")?.value;
      some.municipalityTwo = this.accountsForm.get("municipalityTwo")?.value;
      some.readingSlip = this.accountsForm.get("readingSlip")?.value;
      some.creditControl = this.accountsForm.get("creditControl")?.value;
      some.isActive = this.accountsForm.get("isActive")?.value;
      some.buildingTaxNumber = this.accountsForm.get("buildingTaxNumber")?.value;
      some.bookNumber = this.accountsForm.get("bookNumber")?.value;

      console.log("the value in onSubmit: ");
      console.log(some);
      this._buildingAccountService.addNewBuildingAccount(some).subscribe(
        response => {
          console.log(response);
          this.buildingAccount.push(some);
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
    } else {
      this.mapFormValuesToLocalData();
      this.local_data.isActive = this.accountsForm.value.isActive;
      if (this.dialogRef) {
        this.dialogRef.close({ event: this.action, data: this.local_data });
      } else {
        this.updateRowData(this.local_data);
      }
    }
  }

  private mapFormValuesToLocalData(): void {
    this.local_data.buildingId = this.accountsForm.get("buildingId")?.value;
    this.local_data.municipalityOne = this.accountsForm.get("municipalityOne")?.value;
    this.local_data.municipalityTwo = this.accountsForm.get("municipalityTwo")?.value;
    this.local_data.readingSlip = this.accountsForm.get("readingSlip")?.value;
    this.local_data.creditControl = this.accountsForm.get("creditControl")?.value;
    this.local_data.isActive = this.accountsForm.get("isActive")?.value;
    this.local_data.buildingTaxNumber = this.accountsForm.get("buildingTaxNumber")?.value;
    this.local_data.bookNumber = this.accountsForm.get("bookNumber")?.value;
  }

  onCancel() {
    // Reset the form or navigate away
    this.accountsForm.reset();
    this.dialogRef.close({ event: 'Cancel' });
  }

  updateRowData(row_obj: BuildingAccountDTO): boolean | any {
    this.buildingAccountService.updateBuildingAccount(row_obj).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
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
}
