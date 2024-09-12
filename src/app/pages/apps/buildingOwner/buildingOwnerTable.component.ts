import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppBuildingOwnerComponent } from './buildingOwner.component';
import { MatSort } from '@angular/material/sort';
import { LookupValueManagerService } from 'src/app/services/lookupValueManager.service';

@Component({
  selector: 'app-building-owner',
  templateUrl: './buildingOwnerTable.component.html',
})
export class AppBuildingOwnerTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
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
    private snackbarService: SnackbarService,
    private lookupService: LookupValueManagerService 
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
  mapCategoryToString(categoryId: number | undefined): string {
    return this.lookupService.getDescriptionById(categoryId!) || 'unknown';
  }
   loadBuildingOwnerListData(): void {
    this.buildingOwners = [];
    this.dataSource.data = [];
    this._buildingOwnerService.getAllBuildingOwners().subscribe({
      next: (response) => {
        if (response && response.data) {
          if(response.success){
            console.log("Here is the response for all building owners:",response)
          this.buildingOwners = response.data.buildingOwnerAccountDTOs ?? [];
          this.dataSource.data = response.data.buildingOwnerAccountDTOs ?? [];
          this.filterBuildingOwners();
        }
          // this.table.renderRows()
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
  const dialogRef = this.dialog.open(AppBuildingOwnerComponent, {
    width: '500px',
    data: obj,
  });
  dialogRef.afterClosed().subscribe((result) => {

    if(result){
      if (result.event === 'Add' || result.event === 'Update' ) {
        setTimeout(() => {
        this.loadBuildingOwnerListData();
        },1000);
      }else if(result.event === 'Delete')
        {
          setTimeout(() => {
          this.loadBuildingOwnerListData();
          },1000);
          this.deleteRowData(result);        
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

        }
      },
      error: (error) => {
        console.error('There was an error!', error);

      }
    });

    return true;
  }
}
