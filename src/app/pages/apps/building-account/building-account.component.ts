import { Component, Inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, EventEmitter } from '@angular/core';
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
  @Input() isPortfolioCreation: boolean = false;
  @Input() selectedBuilding: BuildingDTO; // Receiving the selected building data

  @Output() submissionSuccess = new EventEmitter<BuildingAccountDTO>();  // Emit BuildingAccountDTO

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
    this.action = this.local_data?.action ?? 'Add';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isPortfolioCreation && this.selectedBuilding) {
      // Avoid re-adding the building and ensure the correct selection
      this.accountsForm.patchValue({ buildingId: this.selectedBuilding.id });
      const existingBuilding = this.filteredBuildings.find(b => b.id === this.selectedBuilding.id);
      if (!existingBuilding) {
          this.filteredBuildings.push(this.selectedBuilding);
      }
    }
  }  

  ngOnInit(): void {
    this.accountsForm = this.fb.group({
        buildingId: [{ value: this.selectedBuilding ? this.selectedBuilding.id : '', disabled: this.action !== 'Add' }, Validators.required],
        municipalityOne: ['', Validators.required],
        municipalityTwo: [''],
        readingSlip: [false, Validators.required],
        creditControl: [false],
        isActive: [false],
        buildingTaxNumber: [''],
        bookNumber: ['', Validators.required],
    });

    this.loadBuildingListData();
    
    this.buildingFilterCtrl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
    ).subscribe(value => {
        this.filterBuildings(value || '');
    });

    // Ensure unique IDs
    this.filteredBuildings = Array.from(new Set(this.filteredBuildings.map(b => b.id)))
        .map(id => this.filteredBuildings.find(b => b.id === id)!);

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
          this.buildings.sort((a, b) => this.customSort(a.name!, b.name!));
          this.filteredBuildings = this.buildings;

          // If a building is already selected (in case of portfolio creation), make sure it is included in the list
          if (this.selectedBuilding) {
            const existingBuilding = this.buildings.find(b => b.id === this.selectedBuilding.id);
            if (!existingBuilding) {
              this.buildings.push(this.selectedBuilding);
              this.filteredBuildings.push(this.selectedBuilding);
            }

            // Set the selected building
            this.accountsForm.patchValue({ buildingId: this.selectedBuilding.id });
          }
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
  
  customSort(nameA: string, nameB: string): number {
    const trimmedNameA = nameA.trim();
    const trimmedNameB = nameB.trim();
  
    const isNumberA = /^\d/.test(trimmedNameA);
    const isNumberB = /^\d/.test(trimmedNameB);
  
    if (isNumberA && isNumberB) {
      return trimmedNameA.localeCompare(trimmedNameB, undefined, { numeric: true });
    } else if (isNumberA) {
      return -1; 
    } else if (isNumberB) {
      return 1; 
    } else {
      return trimmedNameA.localeCompare(trimmedNameB); // Alphabetical order
    }
  }  

  filterBuildings(filter: string): void {
    const filterValue = filter ? filter.toLowerCase() : '';
    this.filteredBuildings = this.buildings.filter(option => option.name?.toLowerCase().includes(filterValue));
  }  

  async onSubmit(): Promise<void> {
    const actionToUse = this.localDataFromComponent?.action || this.action;
    if (actionToUse === "Add") {
      const some = new BuildingAccountDTO();
      some.buildingId = this.accountsForm.get("buildingId")?.value;
      some.municipalityOne = this.accountsForm.get("municipalityOne")?.value;
      some.municipalityTwo = this.accountsForm.get("municipalityTwo")?.value;
      some.readingSlip = this.accountsForm.get("readingSlip")?.value;
      some.creditControl = this.accountsForm.get("creditControl")?.value;
      some.isActive = this.accountsForm.get("isActive")?.value;
      some.buildingTaxNumber = this.accountsForm.get("buildingTaxNumber")?.value;
      some.bookNumber = this.accountsForm.get("bookNumber")?.value;
  
      this._buildingAccountService.addNewBuildingAccount(some).subscribe(
        response => {
          this.buildingAccount.push(some);
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.accountsForm.reset();
          this.loadBuildingListData();
  
          // Emit the newly added BuildingAccountDTO
          this.submissionSuccess.emit(some);
  
          // Close the dialog only if not part of portfolio creation
          if (!this.isPortfolioCreation) {
            if (this.dialogRef) {
              this.dialogRef.close({ event: this.action, data: this.local_data });
            }
          }
        },
        error => {
          console.error(error);
          this.snackbarService.openSnackBar(error.message, "dismiss");
        }
      );
    } else {
      this.mapFormValuesToLocalData();
      this.local_data.isActive = this.accountsForm.value.isActive;
  
      await this.updateRowData(this.local_data);
  
      // Emit the updated BuildingAccountDTO
      this.submissionSuccess.emit(this.local_data);
  
      // Close the dialog only if not part of portfolio creation
      if (!this.isPortfolioCreation) {
        this.dialogRef.close({ event: this.action, data: this.local_data });
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
