import { Component, Inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BuildingOwnerDTO, BuildingAccountDTO, StatementItemDTO, FilterDTO, BuildingDTO, TransactionDTO, UserDataDTO } from 'src/app/DTOs/dtoIndex';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { PortfolioService } from 'src/app/services/portfolio.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { StatementService } from 'src/app/services/statement.service';
import { PdfService } from 'src/app/services/pdf.service';
import { PdfDTO } from 'src/app/DTOs/pdfDTO';
import { ConfirmDownloadDialogComponent } from '../confirm-download-dialog.component';

import { CommunicationService } from 'src/app/services/communication.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import * as moment from 'moment-timezone';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { PdfPreviewComponent } from '../invoice/pdf-preview/pdf-preview.component';

@Component({
  selector: 'statement',
  templateUrl: './statement.component.html'
})
export class AppStatementScreenComponent implements OnInit, AfterViewInit {
  allComplete: boolean = false;
  statementItems: StatementItemDTO[] = [];
  StatementItemList: MatTableDataSource<StatementItemDTO>;
  filterDTO: FilterDTO = new FilterDTO();
  selectedBuilding: BuildingDTO | null = null;
  buildingOwners: BuildingOwnerDTO[] = [];
  selectedBuildingAccount: BuildingAccountDTO;
  selectedOwnerAccount: BuildingOwnerDTO;
  selectedPerson: UserDataDTO;
  transactionData: TransactionDTO;
  buildings: BuildingDTO[] = [];
  dataLoaded: boolean = false;
  filteredBuildings: BuildingDTO[] = [];
  filteredBuildingOwners: BuildingOwnerDTO[] = [...this.buildingOwners];
  displayedColumns: string[] = [
    "Date",
    "Account",
    "Transaction",
    "Amount",
    "ClosingBalance"
  ];
  pdfDataUrl: string = '';

  dataSource = new MatTableDataSource<StatementItemDTO>(this.statementItems);
  balanceDue: number = 0;

  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private portfolioService: PortfolioService,
    private snackBar: SnackbarService,
    private _buildingOwnerService: BuildingOwnerService,
    private _buildingService: BuildingService,
    private _statementService: StatementService,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfService,
    private _emailService: CommunicationService,
    private userPreferencesService: UserPreferencesService
  ) { }

  ngOnInit(): void {
    this.loadBuildingOwnerListData();
    this.loadBuildingListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: any) => {
        if (response) {
          this.buildings = response.data?.buildingDTOs ?? [];
          this.filteredBuildings = this.buildings;
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  loadData() {
    console.log("The filter DTO :", this.filterDTO);

    // Convert dates to strings in the Africa/Johannesburg timezone
    const filterDTOWithStringDates: FilterDTO = {
      ...this.filterDTO,
      fromDate: this.filterDTO.fromDate ? this.convertToTimeZoneString(new Date(this.filterDTO.fromDate), 'Africa/Johannesburg') : "",
      toDate: this.filterDTO.toDate ? this.convertToTimeZoneString(new Date(this.filterDTO.toDate), 'Africa/Johannesburg') : ""
    };

    console.log("Formatted DTO with String Dates: ", filterDTOWithStringDates);

    // Use the DTO with formatted dates for the API call
    this._statementService.getByAccountId(filterDTOWithStringDates).subscribe({
      next: (response: any) => {
        this.statementItems = response.data?.statementItemDTOs!;
        console.log("The statementItemList: ", this.statementItems);
        this.populateStatementItemsWithOtherData();
      },
      error: (error) => {
        this.transactionData = new TransactionDTO();
        this.snackBar.openSnackBar('Error loading statement data', 'Close', 3000);
        console.error('Error loading statement data:', error);
      }
    });
  }

  private convertToTimeZoneString(date: Date, timeZone: string): string {
    return moment(date).tz(timeZone).format();
  }

  onBuildingOwnerSelectionChange(event: any): void {
    this.selectedBuilding = event.value;
    console.log('Selected Building Owner:', this.selectedBuilding);
    this.getSelectedBuildingAccount();
  }

  getSelectedBuildingAccount() {
    this.portfolioService.getPortfolioBuildingById(this.selectedBuilding?.id!).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log(response);
          this.transactionData = response.data!;
          if (this.transactionData!.buildingAccountDTOs![0] == null) {
            this.selectedBuildingAccount = new BuildingAccountDTO();
            this.selectedBuildingAccount.action = "Add";
          } else {
            this.selectedBuildingAccount = this.transactionData!.buildingAccountDTOs![0];
            this.selectedBuildingAccount.action = "Update";
            if (this.selectedBuildingAccount) {
              this.filterDTO.accountGuid = this.selectedBuildingAccount.guid;
              this.filterDTO.accountId = this.selectedBuildingAccount.id;
            }
          }
          if (this.transactionData!.buildingOwnerAccountDTOs![0] == null) {
            this.selectedOwnerAccount.action = "Add";
          } else {
            this.selectedOwnerAccount = this.transactionData!.buildingOwnerAccountDTOs![0];
            this.selectedOwnerAccount.action = "Update";
          }
        } else {
          this.snackBar.openSnackBar('Failed to load building data', 'Close', 3000);
        }

      },
      error: (error) => {
        this.transactionData = new TransactionDTO();
        this.snackBar.openSnackBar('Error loading building data', 'Close', 3000);
        console.error('Error loading building data:', error);
      }
    });
  }

  loadBuildingOwnerListData(): void {
    this._buildingOwnerService.getAllBuildingOwners().subscribe({
      next: (response) => {
        this.buildingOwners = response.data?.buildingOwnerAccountDTOs ?? [];
        this.filteredBuildingOwners = this.buildingOwners;
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  calculateBalanceDue() {
    let totalInvoices = 0;
    let totalCreditsAndPayments = 0;

    this.statementItems.forEach(item => {
      const amount = parseFloat(item.amount);
      if (item.transaction.toLowerCase().includes('invoice')) {
        totalInvoices += amount;
      } else {
        totalCreditsAndPayments += amount;
      }
    });

    this.balanceDue = totalInvoices - totalCreditsAndPayments;
    if (this.balanceDue < 0) {
      this.balanceDue = -this.balanceDue;
    }
  }

  populateStatementItemsWithOtherData() {
    this.statementItems.forEach(ax => {
      ax.amount = parseFloat(ax.amount).toFixed(2);
      ax.closingBalance = parseFloat(ax.closingBalance).toFixed(2);
      ax.accountNumber = this.selectedBuildingAccount.bookNumber!;
      if (ax.transaction === "Invoice") {
        ax.transaction = ax.transaction.concat(" ", ax.referenceNumber!.toString());
      } else if (ax.transaction === "CreditNote") {
        ax.transaction = ax.transaction.concat(" ", ax.referenceNumber!.toString());
      }
    });
    this.dataSource.data = this.statementItems;
    this.StatementItemList = this.dataSource;
    this.dataLoaded = true;
    this.calculateBalanceDue();
  }

  filter(filterValue: string): void {
    this.StatementItemList.filter = filterValue.trim().toLowerCase();
  }

  private getPdfDto(): PdfDTO {
    const selectedOwner = this.buildingOwners.find(owner => owner.buildingId === this.selectedBuilding?.id);
    var x = this.balanceDue
    var isCreditForStatement = false;
    if (this.selectedBuildingAccount.isInCredit) {
      // x = x * -1;
      isCreditForStatement = true;
    }
    return {
      invoiceDate: this.filterDTO.fromDate ? this.convertToSAST(new Date(this.filterDTO.fromDate)) : this.convertToSAST(new Date()),
      dueDate: this.filterDTO.toDate ? this.convertToSAST(new Date(this.filterDTO.toDate)) : this.convertToSAST(new Date()),
      customerName: selectedOwner?.name || 'N/A',
      customerAddress: selectedOwner?.address || 'N/A',
      customerPhone: selectedOwner?.contactNumber || 'N/A',
      customerEmail: selectedOwner?.email || 'N/A',
      taxNumber: this.selectedBuildingAccount?.buildingTaxNumber || 'N/A',
      statementItems: this.statementItems || [],
      grandTotal:x, //this.balanceDue,
      accountIsInCredit:isCreditForStatement,
    };
  }

  private convertToSAST(date: Date): Date {
    // Adjust the UTC time to SAST (GMT+2)
    const offset = 2 * 60; // SAST is GMT+2 in minutes
    const localTime = date.getTime();
    const adjustedTime = localTime + (offset * 60 * 1000); // Adjusting to GMT+2
    return new Date(adjustedTime);
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

  async emailInvoice(): Promise<void> {
    await this.sendPDF();
  }

  async previewInvoice(): Promise<void> {
    await this.generatePDF('preview');
    this.dataLoaded = true; // Set the PDF preview flag to true
    this.cdr.detectChanges(); // Trigger change detection to update the view
  }

  private async generatePDF(action: 'download' | 'preview'): Promise<void> {
    const pdfDto = this.getPdfDto();

    try {
      const response = await this.pdfService.generateStatementPdf(pdfDto).toPromise();
      const pdfBlob = new Blob([response || ""], { type: 'application/pdf' });

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `statement_${this.selectedBuildingAccount.bookNumber}.pdf`;
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

  private async sendPDF(): Promise<void> {
    const selectedOwner = this.buildingOwners.find(owner => owner.id === this.selectedBuilding?.id);
    const emailData = {
      filename: `statement_${this.selectedBuildingAccount.bookNumber}.pdf`,
      clientEmail: selectedOwner?.email || "",
      clientName: selectedOwner?.name || "",
      isActive: true
    };

    const pdfDto = this.getPdfDto();

    try {
      await this._emailService.sendEmail(pdfDto, JSON.stringify(emailData), 3).toPromise();
      this.snackBar.openSnackBar("Email has been sent to: " + selectedOwner?.email + " successfully", "dismiss", 8000);
    } catch (error: any) {
      console.error('Error sending email:', error);
      this.snackBar.openSnackBar("Error sending email", "dismiss");
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
}
