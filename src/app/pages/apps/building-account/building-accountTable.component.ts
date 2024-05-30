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
    'id',
    'buildingId',
    'municipalityOne',
    'municipalityTwo',
    'readingSlip',
    'creditControl',
    'centerOwner',
    'action'
  ];

  dataSource = new MatTableDataSource<BuildingAccountDTO>(this.buildingAccounts);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private buildingAccountService: BuildingAccountService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadBuildingAccountListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadBuildingAccountListData(): void {
    this.buildingAccountService.getAllBuildingAccounts(this.manageActiveBuildingAccounts).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response && response.data) {
          this.dataSource.data = response.data.buildingAccountDTOs ?? [];
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
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
          this.addRowData(result.data);
        } else if (result.event === 'Update') {
          this.updateRowData(result.data);
        } else if (result.event === 'Delete') {
          this.deleteRowData(result.data);
        }
      }
    });
  }
  
  addRowData(row_obj: BuildingAccountDTO): void {
    row_obj.isActive = true;
    this.buildingAccountService.addNewBuildingAccount(row_obj).subscribe({
      next: (response) => {
        this.loadBuildingAccountListData();
        this.snackbarService.openSnackBar('Building account added successfully!', 'dismiss');
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.snackbarService.openSnackBar('Failed to add building account.', 'dismiss');
      }
    });
  }

  updateRowData(row_obj: BuildingAccountDTO): boolean | any{
    this.dataSource.data = this.dataSource.data.filter((value: BuildingAccountDTO)=>{
      if(value.id === row_obj.id){
        value.id = row_obj.id;
        value.buildingId = row_obj.buildingId;
        value.centerOwner = row_obj.centerOwner;
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
        
      }
      this.buildingAccountService.updateBuildingAccount(row_obj).subscribe({
        next: (response) => {
          if(response){
            console.log(response);
            this.loadBuildingAccountListData();
          }
        },
        error:(error) => {
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

