import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { AuthService } from 'src/app/services/auth.service';
import { OperationalResultDTO } from 'src/app/DTOs/operationalResultDTO';
import { TransactionDTO } from 'src/app/DTOs/transactionDTO';
import { BuildingAccountDTO } from 'src/app/DTOs/BuildingAccountDTO';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { BuildingAccountsComponent } from './building-account.component';
import { MatSort } from '@angular/material/sort';
import { BuildingService } from 'src/app/services/building.service';
import { map, catchError, of, forkJoin } from 'rxjs';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';

@Component({
  selector: 'app-building-account',
  templateUrl: 'building-accountTable.component.html',
})
export class AppBuildingAccountTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  searchText: any;
  manageActiveBuildingAccounts: boolean = true;
  buildingAccounts: BuildingAccountDTO[] = [];

  displayedColumns: string[] = [
    'buildingName',
    'municipalityOne',
    'municipalityTwo',
    'readingSlip',
    'creditControl',
    'action'
  ];

  dataSource = new MatTableDataSource<BuildingAccountDTO>(this.buildingAccounts);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private buildingAccountService: BuildingAccountService,
    private buildingService: BuildingService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.manageActiveBuildingAccounts = true;
    this.loadBuildingAccountListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  
    // Customize sorting for specific columns
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'buildingName':
          // This assumes that `buildingName` has been added to each item in `loadBuildingAccountListData`
          return (item as any).buildingName?.trim().toLowerCase() || ''; // Sort by building name
        case 'municipalityOne':
          return item.municipalityOne?.trim().toLowerCase() || '';
        case 'municipalityTwo':
          return item.municipalityTwo?.trim().toLowerCase() || '';
        case 'readingSlip':
          return item.readingSlip;
        case 'creditControl':
          return item.creditControl;
        default:
          return (item as any)[property];
      }
    };
  }  

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadBuildingAccountListData(): void {
    console.log('Fetching all buildings...');
  
    // Fetch all buildings first
    this.buildingService.getAllBuildings(this.manageActiveBuildingAccounts).subscribe({
      next: (response: OperationalResultDTO<any>) => {
        const buildingsMap = new Map<string, BuildingDTO>(); // Map to store building ID and BuildingDTO
        const buildings = response.data?.buildingDTOs ?? []; // Assuming the data structure
  
        console.log('Buildings received:', buildings);
  
        // Store buildings in a Map for easy lookup by ID
        buildings.forEach((building: BuildingDTO) => {
          console.log(`Mapping building ID ${building.id} to name ${building.name}`);
          buildingsMap.set((building.id!).toString(), building);
        });
  
        // Fetch all building accounts
        this.buildingAccountService.getAllBuildingAccounts(this.manageActiveBuildingAccounts).subscribe({
          next: (response: OperationalResultDTO<TransactionDTO>) => {
            if (response && response.data) {
              this.buildingAccounts = response.data.buildingAccountDTOs ?? [];
              console.log('Building accounts received:', this.buildingAccounts);
  
              // Match building accounts with building names
              this.buildingAccounts = this.buildingAccounts.map(account => {
                const building = buildingsMap.get(account.buildingId?.toString() || '');
                const buildingName = building ? building.name : 'Unknown Building';
                console.log(`Account ID ${account.id}: matched building ID ${account.buildingId} to name ${buildingName}`);
                return {
                  ...account,
                  buildingName
                };
              });
  
              // Update the data source
              this.dataSource.data = this.buildingAccounts;
              this.dataSource.sort = this.sort; // Ensure sorting is applied
              console.log('Data source updated with building names:', this.dataSource.data);
            }
          },
          error: (error) => {
            console.error('There was an error fetching building accounts!', error);
          }
        });
      },
      error: (error) => {
        console.error('There was an error fetching buildings!', error);
      }
    });
  }  
  
  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(BuildingAccountsComponent, {
      data: obj,
    });
  
    dialogRef.afterClosed().subscribe((result) => {
     // this.loadBuildingAccountListData();
    
      if (result && result.event) {
        if (result.event === 'Add') {
        //  this.addRowData(result.data);
        this.manageActiveBuildingAccounts = result.data.isActive;
          this.loadBuildingAccountListData();
      
        } else if (result.event === 'Update') {
          this.updateRowData(result.data);
          this.loadBuildingAccountListData();
        } else if (result.event === 'Delete') {
          this.deleteRowData(result.data);
          this.loadBuildingAccountListData();
        }
      }
      this.loadBuildingAccountListData();
    });
  }
  
  addRowData(row_obj: BuildingAccountDTO): void {
   
    this.loadBuildingAccountListData();
    this.manageActiveBuildingAccounts = row_obj.isActive;    
  }

  updateRowData(row_obj: BuildingAccountDTO): boolean | any{
    this.dataSource.data = this.dataSource.data.filter((value: BuildingAccountDTO)=>{
      if(value.id === row_obj.id){
        value.id = row_obj.id;
        value.buildingId = row_obj.buildingId;
        value.creditControl = row_obj.creditControl;
        value.municipalityOne = row_obj.municipalityOne;
        value.municipalityTwo = row_obj.municipalityTwo;
        value.readingSlip = row_obj.readingSlip;
        value.guid = row_obj.guid;
        value.id = row_obj.id,
        value.isActive = row_obj.isActive;
        value.dateCreated = row_obj.dateCreated;
        value.dateLastUpdated = row_obj.dateLastUpdated;
        value.dateDeleted = row_obj.dateDeleted;
        if (value.isActive != false) {
          this.manageActiveBuildingAccounts = true;
        }
        else{
          this.manageActiveBuildingAccounts = false;
        }
        
      }
      this.buildingAccountService.updateBuildingAccount(row_obj).subscribe({
        next: (response) => {
          if(response){
            console.log(response);
            this.loadBuildingAccountListData();
          }
        },
        error:(error) => {
          this.manageActiveBuildingAccounts = true;
          console.error('There was an error!', error);
        }
      });
      return true;
    });
  }

  deleteRowData(row_obj: BuildingAccountDTO): boolean | any {
    // this.dataSource.data = this.dataSource.data.filter((value: any) => {
    //   return value.id !== row_obj.id;
    // });
    row_obj.isActive = false;
    row_obj.dateDeleted = new Date();
    row_obj.dateDeleted.setHours(0, 0, 0, 0);
    this.buildingAccountService.deleteBuildingAccount(row_obj).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.loadBuildingAccountListData();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.loadBuildingAccountListData();
      }
    });

    return true;
  }
}

