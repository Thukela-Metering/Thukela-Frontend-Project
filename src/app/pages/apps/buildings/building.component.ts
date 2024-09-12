import { Component, Inject, Optional, ViewChild, AfterViewInit, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppAddBuildingComponent } from './add/add.component';
import { PersonDTO } from 'src/app/DTOs/personDTO';
import { UserService as PersonService } from 'src/app/services/user.service';
import { UserDataDTO, UserDataDTO as UserRegistrationDTO } from 'src/app/DTOs/userDataDTO';
import { AuthService } from 'src/app/services/auth.service';
import { LookupValueDTO } from 'src/app/DTOs/lookupValueDTO';
import { SystemUserDTO } from 'src/app/DTOs/systemUserDTO';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatSort } from '@angular/material/sort';

@Component({
  templateUrl: './building.component.html',
  selector: "ng-component-building"
})
export class AppBuildingComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  searchText: any;
  manageActiveBuildings: boolean = true;
  buildings: BuildingDTO[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'nSquareMetersame',
    'sdgMeterZone',
    'address',
    'notes',
    'action',
  ];
  dataSource = new MatTableDataSource(this.buildings);

  constructor(public dialog: MatDialog, public datePipe: DatePipe, private _buildingService: BuildingService, private authService: AuthService) { }
  ngOnInit(): void {
    this.loadBuildingListData();
    this.manageActiveBuildings = true;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Customize sorting for specific columns
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item.name?.trim().toLowerCase() || '';
        case 'nSquareMetersame':
          return item.nSquareMetersame;
        case 'sdgMeterZone':
          return item.sdgMeterZone;
        case 'address':
          return item.address?.trim().toLowerCase() || '';
        case 'notes':
          return item.notes?.trim().toLowerCase() || '';
        default:
          return (item as any)[property];
      }
    };
    this.manageActiveBuildings = true;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(this.manageActiveBuildings).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response) {
          this.dataSource.data = response.data?.buildingDTOs ?? [];
          this.buildings = [];
          this.buildings = response.data?.buildingDTOs ?? [];
          this.table.renderRows();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  openDialog(action: string, obj: any = {}): void {
    obj.action = action;
  
    if (action === 'Add') {
      // Ensure the object has the structure needed for adding a building
      obj = { ...new BuildingDTO(), action: 'Add' };
    }
  
    const dialogRef = this.dialog.open(AppBuildingDialogContentComponent, {
      data: obj,
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result.event === 'Add') {
        this.loadBuildingListData();
        this.manageActiveBuildings = true;
      } else if (result.event === 'Update') {
        this.loadBuildingListData();
        this.manageActiveBuildings = true;
      } else if (result.event === 'Delete') {
        this.deleteRowData(result.data);
        this.manageActiveBuildings = true;
      }
    });
  }
  
  // tslint:disable-next-line - Disables all
  deleteRowData(row_obj: BuildingDTO): boolean | any {
    row_obj.isActive = false;
    row_obj.dateDeleted = new Date();
    row_obj.dateDeleted.setHours(0, 0, 0, 0);
    this._buildingService.deleteBuilding(row_obj).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.loadBuildingListData();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.loadBuildingListData();
      }
    });

    return true;
  }
}

@Component({
  selector: 'app-building-dialog-content',
  templateUrl: 'building-dialog-content.html',
})
export class AppBuildingDialogContentComponent implements OnInit, OnChanges {

  @Input() localDataFromComponent: BuildingDTO;
  @Input() isPortfolioCreation: boolean = false;
  @Output() submissionSuccess = new EventEmitter<BuildingDTO>();
  action: string;
  buildingDTO: BuildingDTO = new BuildingDTO();
  local_data: BuildingDTO;
  DropDownValues: LookupValueDTO[] = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<AppBuildingDialogContentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BuildingDTO,
    private _buildingService: BuildingService,
    public datePipe: DatePipe,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['localDataFromComponent'] && changes['localDataFromComponent'].currentValue) {
      this.local_data.isActive = this.localDataFromComponent.isActive;
      this.local_data = this.localDataFromComponent;
    }
  }

  ngOnInit(): void {
    this.getDropdownValues();
  }

  getDropdownValues() {
    this.authService.getLookupValues().subscribe(
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
        console.error(error);
      }
    );
  }

  doAction(): void {
    const actionData = this.local_data?.action ? this.local_data : this.localDataFromComponent;
    if (actionData.action === "Add") {
      // Ensure all properties are set correctly for a new building
      this.buildingDTO = {
        name: this.local_data.name,
        nSquareMetersame: this.local_data.nSquareMetersame,
        sdgMeterZone: this.local_data.sdgMeterZone,
        address: this.local_data.address,
        notes: this.local_data.notes,
        isActive: this.local_data.isActive,
      };
      this.addRowData(this.buildingDTO);
    } else {
      this.updateRowData(this.local_data);
    }
  }

  updateRowData(row_obj: BuildingDTO): boolean | any {
    this._buildingService.updateBuildingData(row_obj).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.submissionSuccess.emit(row_obj);  // Emit success event

          // Only close the dialog if not part of a specific process
          if (!this.isPortfolioCreation) {
            if (this.dialogRef) {
              this.dialogRef.close({ event: this.action, data: this.local_data });
            }
          }
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.snackbarService.openSnackBar(error.message, "dismiss");
      }
    });
    return true;
  }

  addRowData(row_obj: BuildingDTO): void {
    this._buildingService.addNewBuilding(row_obj).subscribe(
        response => {
            if (response.success) {
                // If saved successfully, load the building list to retrieve the full BuildingDTO
                this._buildingService.getAllBuildings(true).subscribe(
                    buildingResponse => {
                        const savedBuilding = buildingResponse.data?.buildingDTOs?.find(b => b.name === row_obj.name);

                        if (!savedBuilding) {
                            this.snackbarService.openSnackBar("Building not found after saving.", "dismiss");
                        } else {
                            this.submissionSuccess.emit(savedBuilding);  // Emit the found building with the ID
                            if (!this.isPortfolioCreation) {
                              if (this.dialogRef) {
                                this.dialogRef.close({ event: this.action, data: this.local_data });
                              }
                          }
                          this.snackbarService.openSnackBar("Building saved successfully", "dismiss");
                        }
                    },
                    error => {
                        console.error("Error retrieving building list:", error);
                    }
                );
            } else {
                console.error("Failed to save the building:", response.message);
            }
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