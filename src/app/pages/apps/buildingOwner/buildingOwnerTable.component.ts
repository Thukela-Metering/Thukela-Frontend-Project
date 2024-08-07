import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppBuildingOwnerComponent } from './buildingOwner.component';
import { MatSort } from '@angular/material/sort';

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
    'preferredCommunication',
    'additionalInformation',
    'action',
  ];

  dataSource = new MatTableDataSource<BuildingOwnerDTO>(this.buildingOwners);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private _buildingOwnerService: BuildingOwnerService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.manageActiveBuildingOwners = true;
    this.loadBuildingOwnerListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  
    // Customize sorting for specific columns
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'buildingId':
          return item.buildingId;
        case 'name':
          return item.name?.trim().toLowerCase() || '';
        case 'email':
          return item.email?.trim().toLowerCase() || '';
        case 'fax':
          return item.fax;
        case 'contactNumber':
          return item.contactNumber;
        case 'accountNumber':
          return item.accountNumber;
        case 'bank':
          return item.bank;
        case 'taxable':
          return item.taxable;
        case 'address':
          return item.address?.trim().toLowerCase() || '';
        case 'preferredCommunication':
          return item.preferredCommunication;
        case 'additionalInformation':
          return item.additionalInformation?.trim().toLowerCase() || '';
        default:
          return (item as any)[property];
      }
    };
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadBuildingOwnerListData(): void {
    this._buildingOwnerService.getAllBuildingOwners().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.buildingOwners = response.data.buildingOwnerAccountDTOs ?? [];
          this.filterBuildingOwners();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }

  filterBuildingOwners(): void {
    if (this.manageActiveBuildingOwners) {
      this.dataSource.data = this.buildingOwners.filter(owner => owner.isActive);
    } else {
      this.dataSource.data = this.buildingOwners.filter(owner => !owner.isActive);
    }
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    this.loadBuildingOwnerListData();
    const dialogRef = this.dialog.open(AppBuildingOwnerComponent, {
      width: '500px',
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        if (result.event === 'Add') {
          this.loadBuildingOwnerListData();
        } else if (result.event === 'Update') {
          this.loadBuildingOwnerListData();
        } else if (result.event === 'Delete') {
          this.deleteRowData(result.data);
          this.loadBuildingOwnerListData();
        }
      }
    });
  }

  deleteRowData(row_obj: BuildingOwnerDTO): boolean | any {
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
