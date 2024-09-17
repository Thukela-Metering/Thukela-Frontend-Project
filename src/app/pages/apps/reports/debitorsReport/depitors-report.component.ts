import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DebitorReportDTO, StatementFilterDTO } from 'src/app/DTOs/dtoIndex';
import { SnackbarService } from 'src/app/services/snackbar.service';
import * as moment from 'moment-timezone';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'statement',
    templateUrl: './depitors-report.component.html'
})
export class AppDebitorsReportComponent implements OnInit, AfterViewInit {
    reportSalesItems: DebitorReportDTO[] = [];
    reportBadDeptItems: DebitorReportDTO[] = [];

    reportSalesItemsList: MatTableDataSource<DebitorReportDTO>;
    reportBadDeptItemsList: MatTableDataSource<DebitorReportDTO>;

    filterDTO: StatementFilterDTO = new StatementFilterDTO();
    fromDate: Date;
    toDate: Date;
    dataLoaded: boolean = false;
    displayedSalesColumns: string[] = [
        "buildingOwnerName",
        "buildingName",
        "amountExclVat",
        "amountInclVat",
        "vatTotal"
    ];
    displayedBadDeptColumns: string[] = [
        "buildingOwnerName",
        "buildingName",
        "amountInclVat",
    ];

    dataSourceSales = new MatTableDataSource<DebitorReportDTO>(this.reportSalesItems);
    dataSourceBadDept = new MatTableDataSource<DebitorReportDTO>(this.reportBadDeptItems);

    @ViewChild(MatSort) sort: MatSort = Object.create(null);
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    constructor(
        public dialog: MatDialog,
        private snackBar: SnackbarService,
        private _reportService: ReportService,
    ) { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.dataSourceSales.paginator = this.paginator;
        this.dataSourceSales.sort = this.sort;
    }
    filter(filterValue: string): void {
        this.reportSalesItemsList.filter = filterValue.trim().toLowerCase();
    }

    loadReportData(): void {
        var fromdate = this.convertToTimeZoneString(new Date(this.filterDTO.fromDate!), 'Africa/Johannesburg'); //new Date(this.filterDTO.fromDate!);
        var todate = this.convertToTimeZoneString(new Date(this.filterDTO.toDate!), 'Africa/Johannesburg');//new Date(this.filterDTO.toDate!);

        var DateFrom = new Date(fromdate);
        var DateTo = new Date(todate);
        this._reportService.getDebitorReport(DateFrom, DateTo).subscribe({
            next: (response: any) => {
                if (response) {
                    this.SetTableData(response.data?.debitorsReportDTOs);
                    this.dataLoaded = true;
                }
            },
            error: (error) => {
                console.error('There was an error!', error);
            }
        });
    }
    SetTableData(listOfData: DebitorReportDTO[]) {
      //  this.reportSalesItemsList.data = listOfData.filter(ax => ax.isSales == true && (ax.isBadDept == false|| ax.isBadDept == null));
        this.reportSalesItems = listOfData.filter(ax => ax.isSales == true && (ax.isBadDept == false|| ax.isBadDept == null));
      //  this.dataSourceSales.data = listOfData.filter(ax => ax.isSales == true && (ax.isBadDept == false|| ax.isBadDept == null));

        this.reportBadDeptItems = listOfData.filter(ax => ax.isBadDept == true && (ax.isSales == false || ax.isSales == null));
       // this.dataSourceBadDept.data = listOfData.filter(ax => ax.isBadDept == true && (ax.isSales == false || ax.isSales == null));
       // this.reportBadDeptItemsList.data = listOfData.filter(ax => ax.isBadDept == true && (ax.isSales == false || ax.isSales == null));
    }

    private convertToTimeZoneString(date: Date, timeZone: string): string {
        return moment(date).tz(timeZone).format();
    }

    // filter(filterValue: string): void {
    //     this.StatementItemList.filter = filterValue.trim().toLowerCase();
    // }
}
