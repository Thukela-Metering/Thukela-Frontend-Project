import { Component, Inject, Optional, ViewChild, AfterViewInit, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { PersonDTO } from 'src/app/DTOs/personDTO';
import { UserService as PersonService } from 'src/app/services/user.service';
import { UserDataDTO, UserDataDTO as UserRegistrationDTO } from 'src/app/DTOs/userDataDTO';
import { AuthService } from 'src/app/services/auth.service';
import { LookupValueDTO } from 'src/app/DTOs/lookupValueDTO';
import { SystemUserDTO } from 'src/app/DTOs/systemUserDTO';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { badDeptDTO, OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatSort } from '@angular/material/sort';
import { AppBadDeptModalComponent } from '../bad-dept-modal/badDeptModal';
import { BadDeptService } from 'src/app/services/badDept.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './badDeptMainTable.html',
  selector: "ng-component-building"
})
export class AppBadDeptMainTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  searchText: any;
  manageActiveBadDept: boolean = true;
  badDeptRecords: badDeptDTO[] = [];
  displayedColumns: string[] = [
    'id',
    'bookNumber',
    'amount',
    'note',   
  ];
  dataSource = new MatTableDataSource(this.badDeptRecords);

  constructor(public dialog: MatDialog, public datePipe: DatePipe, private _badDeptService: BadDeptService, private authService: AuthService, private router: Router) { }
  ngOnInit(): void {
    this.loadBadDeptData();
    this.manageActiveBadDept = true;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Customize sorting for specific columns
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'id':
          return item.id || '';
        case 'bookNumber':
          return item.buildingAccountNumber;
        case 'amount':
          return item.amount;
        case 'note':
          return item.note?.trim().toLowerCase() || '';      
        default:
          return (item as any)[property];
      }
    };
    this.manageActiveBadDept = true;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadBadDeptData(): void {
    this._badDeptService.getAllBadDept(this.manageActiveBadDept).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response) {
          this.dataSource.data = response.data?.badDeptDTOs ?? [];
          this.badDeptRecords = [];
          this.badDeptRecords = response.data?.badDeptDTOs ?? [];
          this.table.renderRows();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
navigateToSearchPage()
{
    this.router.navigate(['apps/badDeptSearch']);
}
  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AppBadDeptModalComponent, {
      data: obj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.event === 'Add') {
        //  this.addRowData(result.data);
        this.loadBadDeptData();
        this.manageActiveBadDept = true;
      } 
    });
  }
}
