import { Component, Inject, Optional, ViewChild, AfterViewInit, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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
import { badDeptDTO, BuildingAccountDTO, OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatSort } from '@angular/material/sort';
import { AppBadDeptModalComponent } from '../bad-dept-modal/badDeptModal';
import { BadDeptService } from 'src/app/services/badDept.service';
import { ActivatedRoute } from '@angular/router';
import { BuildingAccountService } from 'src/app/services/building-account.service';

@Component({
    templateUrl: './badDeptAccountView.html',
    selector: "ng-component-badDeptAccountView"
})
export class AppBadDeptAccountViewComponent implements OnInit, AfterViewInit {
    @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
    accountId: string;
    accountDTO: BuildingAccountDTO = new BuildingAccountDTO();
    searchText: any;
    newBadDeptRecordToSave: badDeptDTO = new badDeptDTO();
    manageActiveBadDept: boolean = true;
    badDeptRecords: badDeptDTO[] = [];
    displayedColumns: string[] = [
        'id',
        'bookNumber',
        'amount',
        'note',
    ];
    dataSource = new MatTableDataSource(this.badDeptRecords);

    constructor(public dialog: MatDialog,
        public datePipe: DatePipe,
        private _badDeptService: BadDeptService,
        private authService: AuthService,
        private buildingAccountService: BuildingAccountService,
        private cdRef: ChangeDetectorRef,
        private route: ActivatedRoute) { }
    ngOnInit(): void {

        this.route.params.subscribe(params => {
            this.accountId = params['id'];
            this.fetchAccountDTO();
            this.loadBadDeptData();
            
        });
        
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
    fetchAccountDTO(): void {
        this.buildingAccountService.getBuildingAccountById(Number(this.accountId)).subscribe({
          next: (data) => {
            this.accountDTO = data.data?.buildingAccountDTOs![0] ?? new BuildingAccountDTO();
            this.newBadDeptRecordToSave.buildingAccountNumber = this.accountDTO.bookNumber ?? "";
            this.newBadDeptRecordToSave.buildingAccountId = this.accountDTO.id ?? 0;
            this.newBadDeptRecordToSave.nsp_AccountRunningBalance = this.accountDTO.accountRunningBalance;
            if (!this.accountDTO.isInCredit) {
              this.accountDTO.accountRunningBalance = this.accountDTO.accountRunningBalance! ;
            }else{
              this.accountDTO.accountRunningBalance = this.accountDTO.accountRunningBalance! *-1 ;
            }
            this.accountDTO.accountRunningBalance?.toFixed(2)
            console.log(data.data?.buildingAccountDTOs![0]);
    
            if (this.accountDTO.isInCredit) {
              this.displayedColumns.unshift('select'); // Add the select column
            }
    
            this.cdRef.detectChanges(); // Trigger change detection
          },
          error: (error) => {
            console.error('There was an error!', error);
          }
        });
      }
    
    loadBadDeptData(): void {
        this._badDeptService.getbadDeptForAccount(Number(this.accountId!)).subscribe({
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

    openDialog(action: string, obj: any): void {
        obj.action = action;
        this.newBadDeptRecordToSave.action = action;
        const dialogRef = this.dialog.open(AppBadDeptModalComponent, {
            data: this.newBadDeptRecordToSave,
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
