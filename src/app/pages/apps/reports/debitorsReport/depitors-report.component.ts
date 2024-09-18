import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DebitorReportDTO, DebitorSummaryReportDTO, PdfDTO, StatementFilterDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { SnackbarService } from 'src/app/services/snackbar.service';
import * as moment from 'moment-timezone';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ReportService } from 'src/app/services/report.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { PdfService } from 'src/app/services/pdf.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ConfirmDownloadDialogComponent } from '../../confirm-download-dialog.component';
import { PdfPreviewComponent } from '../../invoice/pdf-preview/pdf-preview.component';

@Component({
    selector: 'statement',
    templateUrl: './depitors-report.component.html'
})
export class AppDebitorsReportComponent implements OnInit, AfterViewInit {
    reportSalesItems: DebitorReportDTO[] = [];
    reportBadDeptItems: DebitorReportDTO[] = [];
    reportSummaryItems: DebitorSummaryReportDTO[] = [];

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
    displayedSummaryColumns: string[] = [
        "buildingOwnerName",
        "balanceBF",
        "sales",
        "creditNotes",
        "payments",
        "badDepts",
        "total"
    ];
    pdfDataUrl: string = '';
    dataSourceSales = new MatTableDataSource<DebitorReportDTO>(this.reportSalesItems);
    dataSourceBadDept = new MatTableDataSource<DebitorReportDTO>(this.reportBadDeptItems);

    @ViewChild(MatSort) sort: MatSort = Object.create(null);
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    constructor(
        public dialog: MatDialog,
        private snackBar: SnackbarService,
        private cdr: ChangeDetectorRef,
        private _reportService: ReportService,
        private pdfService: PdfService,
        private _emailService: CommunicationService,
        private userPreferencesService: UserPreferencesService
    ) { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.dataSourceSales.paginator = this.paginator;
        this.dataSourceSales.sort = this.sort;
    }

    loadReportData(): void {
        var fromdate = this.convertToTimeZoneString(new Date(this.filterDTO.fromDate!), 'Africa/Johannesburg'); //new Date(this.filterDTO.fromDate!);
        var todate = this.convertToTimeZoneString(new Date(this.filterDTO.toDate!), 'Africa/Johannesburg');//new Date(this.filterDTO.toDate!);

        var DateFrom = new Date(fromdate);
        var DateTo = new Date(todate);
        this._reportService.getDebitorReport(DateFrom, DateTo).subscribe({
            next: (response: any) => {
                if (response) {
                    this.SetTableData(response.data!);
                    this.dataLoaded = true;
                }
            },
            error: (error) => {
                console.error('There was an error!', error);
            }
        });
    }
    SetTableData(listOfData: TransactionDTO) {
        if (listOfData.debitorsReportDTOs != null) {
            this.reportSalesItems = listOfData.debitorsReportDTOs!.filter(ax => ax.isSales == true && (ax.isBadDept == false || ax.isBadDept == null));
            this.reportBadDeptItems = listOfData.debitorsReportDTOs!.filter(ax => ax.isBadDept == true && (ax.isSales == false || ax.isSales == null));
        }
        if (listOfData.debitorsReportSummaryDTOs != null) {
            this.reportSummaryItems = listOfData.debitorsReportSummaryDTOs!;
        }
        this.addGrandTotalRows(listOfData);
    }

    private convertToTimeZoneString(date: Date, timeZone: string): string {
        return moment(date).tz(timeZone).format();
    }

    async downloadInvoice(): Promise<void> {
        if (this.userPreferencesService.getDontAskAgainDownload()) {
            await this.generatePDF('download');
        } else {
            const dialogRef = this.dialog.open(ConfirmDownloadDialogComponent, {
                width: '300px'
            });

            dialogRef.afterClosed().subscribe(async result => {
                if (result && result.confirmed) {
                    if (result.dontAskAgain) {
                        this.userPreferencesService.setDontAskAgainDownload(true);
                    }
                    await this.generatePDF('download');
                }
            });
        }
    }


    async previewInvoice(): Promise<void> {
        await this.generatePDF('preview');
        this.dataLoaded = true; // Set the PDF preview flag to true
        this.cdr.detectChanges(); // Trigger change detection to update the view
    }

    private async generatePDF(action: 'download' | 'preview'): Promise<void> {
        const pdfDto = this.getPdfDto();

        try {
            const response = await this.pdfService.generateDebitorsReportPdf(pdfDto).toPromise();
            const pdfBlob = new Blob([response || ""], { type: 'application/pdf' });
            var dateTimeNow = new Date();
            if (action === 'download') {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfBlob);
                link.download = `debitorsSummaryReport_${dateTimeNow}.pdf`;
                link.click();
            } else if (action === 'preview') {
                const pdfUrl = URL.createObjectURL(pdfBlob);
                this.pdfDataUrl = pdfUrl;
                this.openPdfPreview();
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.snackBar.openSnackBar("Error generating PDF", "dismiss");
        }
    }

    openPdfPreview(): void {
        const dialogRef = this.dialog.open(PdfPreviewComponent, {
            width: '80vw',
            height: '80vh',
            data: { pdfDataUrl: this.pdfDataUrl }
        });

        dialogRef.afterClosed().subscribe(() => {
            this.dataLoaded = true; // Reset the PDF preview flag when the preview dialog is closed
        });
    }
    private getPdfDto(): PdfDTO {
        var pdfToReturn = new PdfDTO();

        pdfToReturn.reportSalesItems = this.reportSalesItems;
        pdfToReturn.reportBadDeptItems = this.reportBadDeptItems;
        pdfToReturn.reportSummaryItems = this.reportSummaryItems;
        pdfToReturn.filterStartDate = this.convertToSAST(new Date(this.filterDTO.fromDate!));
        pdfToReturn.filterEndDate = this.convertToSAST(new Date(this.filterDTO.toDate!));
        return pdfToReturn;
    }
    private addGrandTotalRows(listOfData: TransactionDTO): void {
        // Helper function to filter out totals rows
        const filterNonTotalRows = (items: DebitorReportDTO[]): DebitorReportDTO[] => {
            return items.filter(item => !item.isTotalsRow);
        };
    
        // Calculate totals for Sales Items, excluding totals rows
        const totalSalesExclVat = this.truncateToTwoDecimals(
            filterNonTotalRows(this.reportSalesItems).reduce((sum, item) => sum + (item.amountExclVat || 0), 0)
        );
        const totalSalesInclVat = this.truncateToTwoDecimals(
            filterNonTotalRows(this.reportSalesItems).reduce((sum, item) => sum + (item.amountInclVat || 0), 0)
        );
        const totalVat = this.truncateToTwoDecimals(
            filterNonTotalRows(this.reportSalesItems).reduce((sum, item) => sum + (item.vatTotal || 0), 0)
        );
    
        const salesTotalRow: DebitorReportDTO = {
            buildingOwnerName: '',
            buildingName: 'Grand Total',
            amountExclVat: totalSalesExclVat,
            amountInclVat: totalSalesInclVat,
            vatTotal: totalVat,
            isTotalsRow: true
        };
    
        // Append the total row to reportSalesItems
        this.reportSalesItems.push(salesTotalRow);
        this.dataSourceSales.data = this.reportSalesItems;
    
        // Calculate totals for Bad Dept Items, excluding totals rows
        const totalBadDeptInclVat = this.truncateToTwoDecimals(
            filterNonTotalRows(this.reportBadDeptItems).reduce((sum, item) => sum + (item.amountInclVat || 0), 0)
        );
    
        const badDeptTotalRow: DebitorReportDTO = {
            buildingOwnerName: '',
            buildingName: 'Grand Total',
            amountExclVat: 0, // Not applicable
            amountInclVat: totalBadDeptInclVat,
            vatTotal: 0, // Not applicable
            isTotalsRow: true
        };
    
        // Append the total row to reportBadDeptItems
        this.reportBadDeptItems.push(badDeptTotalRow);
        this.dataSourceBadDept.data = this.reportBadDeptItems;
    
        // Calculate totals for Summary Items, excluding totals rows
                const totalBalanceBF = this.truncateToTwoDecimals(
            this.reportSummaryItems.reduce((sum, item) => sum + (item.balanceBF || 0), 0)
        );
        const totalSalesSummary = this.truncateToTwoDecimals(
            this.reportSummaryItems.reduce((sum, item) => sum + (item.sale || 0), 0)
        );
        const totalCreditNotes = this.truncateToTwoDecimals(
            this.reportSummaryItems.reduce((sum, item) => sum + (item.creditNote || 0), 0)
        );
        const totalPayments = this.truncateToTwoDecimals(
            this.reportSummaryItems.reduce((sum, item) => sum + (item.payment || 0), 0)
        );
        const totalBadDepts = this.truncateToTwoDecimals(
            this.reportSummaryItems.reduce((sum, item) => sum + (item.badDept || 0), 0)
        );
        const grandTotalSummary = this.truncateToTwoDecimals(
            this.reportSummaryItems.reduce((sum, item) => sum + (item.total || 0), 0)
        );
    
        const summaryTotalRow: DebitorSummaryReportDTO = {
            ownerName: 'Grand Total',
            balanceBF: totalBalanceBF,
            sale: totalSalesSummary,
            creditNote: totalCreditNotes,
            payment: totalPayments,
            badDept: totalBadDepts,
            total: grandTotalSummary,
        };
    
        // Append the total row to reportSummaryItems
        this.reportSummaryItems.push(summaryTotalRow);
        // Update the dataSource for summary items
    }
    // addGrandTotalRows(listOfData: TransactionDTO): void {
    //     // Calculate totals for Sales Items
    //     const totalSalesExclVat = this.truncateToTwoDecimals(
    //         this.reportSalesItems.reduce((sum, item) => sum + (item.amountExclVat || 0), 0)
    //     );
    //     const totalSalesInclVat = this.truncateToTwoDecimals(
    //         this.reportSalesItems.reduce((sum, item) => sum + (item.amountInclVat || 0), 0)
    //     );
    //     const totalVat = this.truncateToTwoDecimals(
    //         this.reportSalesItems.reduce((sum, item) => sum + (item.vatTotal || 0), 0)
    //     );

    //     const salesTotalRow: DebitorReportDTO = {
    //         buildingOwnerName: '',
    //         buildingName: 'Grand Total',
    //         amountExclVat: totalSalesExclVat,
    //         amountInclVat: totalSalesInclVat,
    //         vatTotal: totalVat,
    //         isTotalsRow: true
    //     };

    //     // Append the total row to reportSalesItems
    //     this.reportSalesItems.push(salesTotalRow);
    //     this.dataSourceSales.data = this.reportSalesItems;

    //     // Calculate totals for Bad Dept Items
    //     const totalBadDeptInclVat = this.truncateToTwoDecimals(
    //         this.reportBadDeptItems.reduce((sum, item) => sum + (item.amountInclVat || 0), 0)
    //     );

    //     const badDeptTotalRow: DebitorReportDTO = {
    //         buildingOwnerName: '',
    //         buildingName: 'Grand Total',
    //         amountExclVat: 0, // Not applicable
    //         amountInclVat: totalBadDeptInclVat,
    //         vatTotal: 0, // Not applicable
    //         isTotalsRow: true
    //     };

    //     // Append the total row to reportBadDeptItems
    //     this.reportBadDeptItems.push(badDeptTotalRow);
    //     this.dataSourceBadDept.data = this.reportBadDeptItems;

    //     // Calculate totals for Summary Items
    //     const totalBalanceBF = this.truncateToTwoDecimals(
    //         this.reportSummaryItems.reduce((sum, item) => sum + (item.balanceBF || 0), 0)
    //     );
    //     const totalSalesSummary = this.truncateToTwoDecimals(
    //         this.reportSummaryItems.reduce((sum, item) => sum + (item.sale || 0), 0)
    //     );
    //     const totalCreditNotes = this.truncateToTwoDecimals(
    //         this.reportSummaryItems.reduce((sum, item) => sum + (item.creditNote || 0), 0)
    //     );
    //     const totalPayments = this.truncateToTwoDecimals(
    //         this.reportSummaryItems.reduce((sum, item) => sum + (item.payment || 0), 0)
    //     );
    //     const totalBadDepts = this.truncateToTwoDecimals(
    //         this.reportSummaryItems.reduce((sum, item) => sum + (item.badDept || 0), 0)
    //     );
    //     const grandTotalSummary = this.truncateToTwoDecimals(
    //         this.reportSummaryItems.reduce((sum, item) => sum + (item.total || 0), 0)
    //     );


    //     const summaryTotalRow: DebitorSummaryReportDTO = {
    //         ownerName: 'Grand Total',
    //         balanceBF: totalBalanceBF,
    //         sale: totalSalesSummary,
    //         creditNote: totalCreditNotes,
    //         payment: totalPayments,
    //         badDept: totalBadDepts,
    //         total: grandTotalSummary,
    //     };

    //     // Append the total row to reportSummaryItems
    //     this.reportSummaryItems.push(summaryTotalRow);
    //     // If you have a dataSource for summary items, update it similarly
    //     // For example:
    //     // this.dataSourceSummary.data = this.reportSummaryItems;
    // }
    private truncateToTwoDecimals(num: number): number {
        return Math.trunc(num * 100) / 100;
    }
    private convertToSAST(date: Date): Date {
        // Adjust the UTC time to SAST (GMT+2)
        const offset = 2 * 60; // SAST is GMT+2 in minutes
        const localTime = date.getTime();
        const adjustedTime = localTime + (offset * 60 * 1000); // Adjusting to GMT+2
        return new Date(adjustedTime);
    }
}
