import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppBuildingOwnerComponent } from './buildingOwner.component';

@Component({
  selector: 'app-building-owner',
  templateUrl: './buildingOwnerTable.component.html',
})
export class AppBuildingOwnerTableComponent implements OnInit, AfterViewInit {
  searchText: any;
  manageActiveBuildingOwners: boolean = true;
  buildingOwners: BuildingOwnerDTO[] = [];
  displayedColumns: string[] = [
    'buildingId',
    'name',
    'email',
    'fax',
    'contactNumber',
    'accountNumber',
    'bank',
    'taxable',
    'address',
    'preferedCommunication',
    'additionalInformation',
    'action',
  ];

  dataSource = new MatTableDataSource<BuildingOwnerDTO>(this.buildingOwners);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private _buildingOwnerService: BuildingOwnerService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadBuildingOwnerListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadBuildingOwnerListData(): void {
    this._buildingOwnerService.getAllBuildingOwners().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.dataSource.data = response.data.buildingOwnerAccountDTOs ?? [];
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AppBuildingOwnerComponent, {
      width: '500px',
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
      if (result.event === 'Add') {
     //   this.addRowData(result.data);
      } else if (result.event === 'Update') {
        this.updateRowData(result.data);
      } else if (result.event === 'Delete') {
        this.deleteRowData(result.data);
      }
    }
    });
  }

  addRowData(row_obj: BuildingOwnerDTO): void {
    // Implementation for adding row
  }

  updateRowData(row_obj: BuildingOwnerDTO): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value: BuildingOwnerDTO) => {
      if (value.id === row_obj.id) {
        value.accountNumber = row_obj.accountNumber;
        value.additionalInformation = row_obj.additionalInformation;
        value.address = row_obj.address;
        value.bank = row_obj.bank;
        value.buildingId = row_obj.buildingId;
        value.contactNumber = row_obj.contactNumber;
        value.email = row_obj.email;
        value.fax = row_obj.fax ?? "12312312";
        value.id = row_obj.id;
        value.isActive = row_obj.isActive;
        value.name = row_obj.name;
        value.preferredCommunication = row_obj.preferredCommunication;
        value.taxable = row_obj.taxable;
        value.dateCreated = row_obj.dateCreated;
        value.dateLastUpdated = row_obj.dateLastUpdated;
        value.dateDeleted = row_obj.dateDeleted;      
      }
      this._buildingOwnerService.updateBuildingOwnerData(row_obj).subscribe({
        next: (response) => {
          if (response) {
            console.log(response);
            this.loadBuildingOwnerListData();
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });
      return true;
    });
  }

  deleteRowData(row_obj: BuildingOwnerDTO):boolean | any {
    // this.dataSource.data = this.dataSource.data.filter((value: any) => {
    //   return value.id !== row_obj.id;
    // });
    row_obj.isActive = false;
    row_obj.dateDeleted = new Date();
    row_obj.dateDeleted.setHours(0, 0, 0, 0);
    this._buildingOwnerService.deleteBuildingOwner(row_obj).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.loadBuildingOwnerListData();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.loadBuildingOwnerListData();
      }
    });

    return true;
  }
}