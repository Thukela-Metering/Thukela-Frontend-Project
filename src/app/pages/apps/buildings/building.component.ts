import { Component, Inject, Optional, ViewChild, AfterViewInit, OnInit } from '@angular/core';
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
import { OperationalResultDTO } from 'src/app/DTOs/backendResponseDTO';
import { SystemUserDTO } from 'src/app/DTOs/systemUserDTO';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';

@Component({
  templateUrl: './building.component.html',
  selector:"ng-component-building"
})
export class AppBuildingComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  searchText: any;
  manageActiveBuildings:boolean = true;
  buildings: BuildingDTO[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'nSquareMetersame',
    'buildingOwner',
    'sdgMeterZone',
    'address',
    'notes',   
    'action',
  ];
  dataSource = new MatTableDataSource(this.buildings);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(public dialog: MatDialog, public datePipe: DatePipe, private _buildingService: BuildingService, private authService: AuthService) { }
  ngOnInit(): void {
    this.loadBuildingListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(this.manageActiveBuildings).subscribe({
      next: (response: OperationalResultDTO<BuildingDTO[]>) => {
        if (response) {
          this.dataSource.data = response.data ?? [];
          this.buildings = [];
          this.buildings = response.data ?? [];
          this.table.renderRows();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AppBuildingDialogContentComponent, {
      data: obj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.event === 'Add') {
        this.addRowData(result.data);
      } else if (result.event === 'Update') {

        this.updateRowData(result.data);
      } else if (result.event === 'Delete') {
        this.deleteRowData(result.data);
      }
    });
  }

  // tslint:disable-next-line - Disables all
  addRowData(row_obj: BuildingDTO): void {

    this._buildingService.addNewBuilding(row_obj).subscribe(
      response => {
        // Handle successful registration
        console.log(response);
        //////////////////////////////////////////////////////
        var userDataDTO = new BuildingDTO();
        userDataDTO.id = row_obj.id,
          userDataDTO.name = row_obj.name,
          userDataDTO.nSquareMetersame = row_obj.nSquareMetersame,
          userDataDTO.buildingOwner = row_obj.buildingOwner,
          userDataDTO.sdgMeterZone = row_obj.sdgMeterZone,
          userDataDTO.address = row_obj.address,
          userDataDTO.notes = row_obj.notes,              
        this.buildings.push(userDataDTO);
        ////////////////////////////////////////////////////        
        console.log(row_obj);
        this.loadBuildingListData();
      },
      error => {
        // Handle error
        console.error(error);
      }
    );
    this.dialog.open(AppAddBuildingComponent);
  }

  // tslint:disable-next-line - Disables all
  updateRowData(row_obj: BuildingDTO): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value: BuildingDTO) => {
      if (value.id === row_obj.id) {
        value.name = row_obj.name;
        value.id = row_obj.id;
        value.nSquareMetersame = row_obj.nSquareMetersame;
        value.buildingOwner = row_obj.buildingOwner;
        value.sdgMeterZone = row_obj.sdgMeterZone;
        value.address = row_obj.address;
        value.notes = row_obj.notes;
        value.isActive = row_obj.isActive;
        value.dateCreated = row_obj.dateCreated;
        value.dateLastUpdated = row_obj.dateLastUpdated;
        value.dateDeleted = row_obj.dateDeleted;        
      }
      this._buildingService.updateBuildingData(row_obj).subscribe({
        next: (response) => {
          if (response) {
            console.log(response);
            this.loadBuildingListData();
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });
      return true;
    });
  }

  // tslint:disable-next-line - Disables all
  deleteRowData(row_obj: BuildingDTO): boolean | any {
    // this.dataSource.data = this.dataSource.data.filter((value: any) => {
    //   return value.id !== row_obj.id;
    // });
    row_obj.isActive = false;
    row_obj.dateDeleted = new Date();
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
  // tslint:disable-next-line: component-selector
  selector: 'app-building-dialog-content',
  templateUrl: 'building-dialog-content.html',
})
// tslint:disable-next-line: component-class-suffix
export class AppBuildingDialogContentComponent implements OnInit {
  action: string;
  buildingDTO: BuildingDTO = new BuildingDTO();
  // tslint:disable-next-line - Disables all
  local_data: BuildingDTO;
  DropDownValues: LookupValueDTO[] = [];
  constructor(
    public datePipe: DatePipe,
    public dialogRef: MatDialogRef<AppBuildingDialogContentComponent>,
    private authService: AuthService,
    private personService: PersonService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BuildingDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
  }
  ngOnInit(): void {
    this.getDropdownValues();
  }

  getDropdownValues() {
    var userRoleResponse = this.authService.getLookupValues().subscribe(
      (response: OperationalResultDTO<LookupValueDTO[]>) => {
        if (response.success) {
          if (response.data != null) {


            this.DropDownValues = response.data.map((item: any) => {
              const lookupValue: LookupValueDTO = new LookupValueDTO();
              lookupValue.Id = item.id;
              lookupValue.Name = item.name;
              lookupValue.Description = item.description;
              lookupValue.LookupGroupValueId = item.lookupGroupValueId;
              lookupValue.LookupGroupValueValue = item.lookupGroupValueValue;
              lookupValue.LookupListValueId = item.lookupListValueId;
              lookupValue.LookupListValueValue = item.lookupListValueValue;
              lookupValue.DateCreated = item.dateCreated;
              return lookupValue;
            });
            console.log(this.DropDownValues);

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
    if (this.action == "Add") {
      this.buildingDTO.name = this.local_data.name;
      this.buildingDTO.nSquareMetersame = this.local_data.nSquareMetersame;
      this.buildingDTO.buildingOwner = this.local_data.buildingOwner;
      this.buildingDTO.sdgMeterZone = this.local_data.sdgMeterZone;
      this.buildingDTO.name = this.local_data.name;
      this.buildingDTO.address = this.local_data.address;
      this.buildingDTO.notes = this.local_data.notes;
      this.buildingDTO.isActive = this.local_data.isActive;
      // this.buildingDTO.dateCreated = this.local_data.dateLastUpdated;
      // this.buildingDTO.dateDeleted = this.local_data.dateDeleted;    
      this.dialogRef.close({ event: this.action, data: this.buildingDTO });
    } else {
      this.dialogRef.close({ event: this.action, data: this.local_data });
    }

  }
  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }
}
