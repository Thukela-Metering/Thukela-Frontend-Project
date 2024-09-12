import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BuildingAccountDTO } from 'src/app/DTOs/BuildingAccountDTO';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { LineItemDTO } from 'src/app/DTOs/LineItemDTO';
import { PdfDTO } from 'src/app/DTOs/pdfDTO';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { PdfService } from 'src/app/services/pdf.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ConfirmDownloadDialogComponent } from '../../confirm-download-dialog.component';
import { QuotesDTO } from 'src/app/DTOs/QuotesDTO';
import { PdfPreviewComponent } from '../../invoice/pdf-preview/pdf-preview.component';
import { TempClientDTO } from 'src/app/DTOs/tempClientDTO';
import { QuoteService } from 'src/app/services/quotes.service';
import { AddNewPortfolioForConvertComponent } from '../add-new-portfolio-for-convert/add-new-portfolio-for-convert.component';
import { BuildingDTO } from 'src/app/DTOs/dtoIndex';
import { AppAddInvoiceComponent } from '../../invoice/add-invoice.component';

@Component({
  selector: 'app-view-quote',
  templateUrl: './view-quote.component.html',
})
export class ViewQuoteComponent implements OnInit, AfterViewInit {
  itemDetail: QuotesDTO;
  quoteDetail: QuotesDTO;
  retrievedBuildings: BuildingOwnerDTO[] = [];
  retrievedAccounts: BuildingAccountDTO[] = [];
  retrievedTempClient: TempClientDTO | null = null;
  selectedBuilding: BuildingDTO;
  selectedBuildingAccount: BuildingAccountDTO;
  selectedOwnerAccount: BuildingOwnerDTO;
  dataSource: MatTableDataSource<LineItemDTO>;
  displayedColumns: string[] = ['itemName', 'Description', 'unitPrice', 'units', 'lineDiscount', 'itemTotal'];
  pdfDataUrl: string = '';
  foundOwnerAccount: BuildingOwnerDTO | undefined;
  showPdfPreview: boolean = false;
  quoteForm: FormGroup;

  @ViewChild('quote') quoteElement!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QuotesDTO,
    public dialogRef: MatDialogRef<ViewQuoteComponent>,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _buildingOwnerService: BuildingOwnerService,
    private _emailService: CommunicationService,
    private _quoteService: QuoteService,
    private snackbarService: SnackbarService,
    private _buildingAccountService: BuildingAccountService,
    private userPreferencesService: UserPreferencesService,
    private pdfService: PdfService
  ) {
    this.quoteDetail = { ...data, items: data.items ?? [] }; // Ensure `items` is at least an empty array
    this.dataSource = new MatTableDataSource<LineItemDTO>(this.quoteDetail.items || []);
    this.quoteForm = this.fb.group({
      items: this.fb.array([])
    });
    this.initForm();
  }

  ngOnInit(): void {
    if (this.quoteDetail.buildingOwnerId && this.quoteDetail.buildingId) {
      this.loadBuildingOwnerListData();
      this.loadBuildingAccount();
    } else if (this.quoteDetail.tempClient?.guid) {
      this.loadTempClientData();
    }
  }

  ngAfterViewInit(): void {}

  initForm(): void {
    const itemsArray = this.quoteForm.get('items') as FormArray;
    const items = this.quoteDetail.items ?? []; // Default to an empty array if `items` is undefined

    items.forEach(item => {
      itemsArray.push(this.createItemGroup(item));
    });
  }

  createItemGroup(item: LineItemDTO): FormGroup {
    return this.fb.group({
      itemName: [item.itemName],
      description: [item.description],
      unitPrice: [item.unitPrice],
      units: [item.units],
      lineDiscount: [item.lineDiscount],
      itemTotal: [item.itemTotal],
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  loadBuildingOwnerListData(): void {
    if (this.quoteDetail.buildingId) {
      this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(this.quoteDetail.buildingId, true).subscribe({
        next: (response: any) => {
          this.retrievedBuildings = response.data?.buildingOwnerAccountDTOs ?? [];
          this.foundOwnerAccount = this.retrievedBuildings.find(owner => owner.id === this.quoteDetail.buildingOwnerId);
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });
    }
  }

  loadBuildingAccount(): void {
    if (this.quoteDetail.buildingId) {
      this._buildingAccountService.getBuildingAccountByBuildingId(this.quoteDetail.buildingId).subscribe({
        next: (response: any) => {
          this.retrievedAccounts = response.data?.buildingAccountDTOs ?? [];
        }
      });
    }
  }

  loadTempClientData(): void {
    if (this.quoteDetail.tempClient?.guid) {
      this._quoteService.getTempClientById(this.quoteDetail.tempClient.guid).subscribe({
        next: (response) => {
          this.retrievedTempClient = response.data!;
        },
        error: (error) => {
          console.error('There was an error fetching the temp client details!', error);
        }
      });
    }
  }

  async downloadQuote(): Promise<void> {
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

  public openInvoiceDialogWithQuote(quote: QuotesDTO): void {
    if (quote.tempClient) {
      console.log('Client is temporary, opening Add Portfolio dialog.');
  
      // Initialize selectedBuilding and selectedOwnerAccount with temporary client data if not already defined
      if (!this.selectedBuilding) {
        this.selectedBuilding = new BuildingDTO();
      }
      if (!this.selectedOwnerAccount) {
        this.selectedOwnerAccount = new BuildingOwnerDTO();
      }
  
      // Populate the selected building's address with the temp client's address
      this.selectedBuilding.address = this.quoteDetail.tempClient?.address;
  
      // Populate the selected owner account with temp client details
      this.selectedOwnerAccount.name = this.quoteDetail.tempClient?.name || "";
      this.selectedOwnerAccount.email = this.quoteDetail.tempClient?.email || "";
      this.selectedOwnerAccount.contactNumber = this.quoteDetail.tempClient?.contactNumber || "";
      this.selectedOwnerAccount.address = this.quoteDetail.tempClient?.address || "";
  
      // Prepare the data object to pass to the dialog
      const dataObject = {
        action: 'Add',
        selectedBuilding: this.selectedBuilding,
        selectedBuildingAccount: this.selectedBuildingAccount,
        selectedOwnerAccount: this.selectedOwnerAccount
      };
  
      // Open the "Add Portfolio" dialog with the prepared data
      const dialogRef = this.dialog.open(AddNewPortfolioForConvertComponent, {
        width: '600px',
        data: dataObject
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.action === 'Add') {
          console.log('The Add Portfolio dialog was closed', result);
          
          // Reopen the invoice dialog with the new customer data and the quote data
          const dataObjectForInvoice = {
            quote: quote, // Pass the quote data to the invoice component
            selectedBuilding: result.selectedBuilding, // Pass the newly created building
            selectedOwnerAccount: result.selectedOwnerAccount, // Pass the newly created owner account
            selectedBuildingAccount: result.selectedBuildingAccount // Pass the newly created building account
          };
      
          this.dialog.open(AppAddInvoiceComponent, {
            width: '1200px',
            data: dataObjectForInvoice
          });
      
          this.dialogRef.close(); // Close the current dialog
        } else {
          console.log('The Add Portfolio dialog was closed without adding a new portfolio');
        }
      });      
    } else {
      console.log('Client is not temporary, opening Add Invoice dialog.');
  
      const dataObject: any = {
        quote: quote, // Pass the quote data to the invoice component
        selectedBuilding: this.selectedBuilding, // Pass the selected building if available
        selectedOwnerAccount: this.foundOwnerAccount, // Add the client details
      };
  
      this.dialog.open(AppAddInvoiceComponent, {
        width: '1200px',
        data: dataObject
      });
  
      this.dialogRef.close(); // Close the current dialog
    }
  }

  async emailQuote(): Promise<void> {
    await this.sendPDF();
  }

  async previewQuote(): Promise<void> {
    await this.generatePDF('preview');
    this.showPdfPreview = true;
    this.cdr.detectChanges();
  }

  closePdfPreview(): void {
    this.showPdfPreview = false;
  }

  private getPdfDto(): PdfDTO {
    const selectedOwner = this.foundOwnerAccount;
    const selectedTempClient = this.retrievedTempClient;

    return {
      invoiceDate: this.convertToSAST(new Date(this.quoteDetail.quoteDate!)),
      dueDate: this.convertToSAST(new Date(this.quoteDetail.dateCreated!)),
      customerName: selectedOwner?.name || selectedTempClient?.name || 'N/A',
      customerAddress: selectedOwner?.address || selectedTempClient?.address || 'N/A',
      customerPhone: selectedOwner?.contactNumber || selectedTempClient?.contactNumber || 'N/A',
      customerEmail: selectedOwner?.email || selectedTempClient?.email || 'N/A',
      taxNumber: selectedTempClient?.taxNumber || this.retrievedAccounts.find(account => account.id === this.quoteDetail.buildingAccountId)?.buildingTaxNumber || '',
      subTotal: this.quoteDetail.subTotal || 0,
      discount: this.quoteDetail.discount || 0,
      vat: this.quoteDetail.vat || 0,
      grandTotal: this.quoteDetail.grandTotal || 0,
      items: this.quoteDetail.items || [],
      note: this.data.note || "",
      referenceNumber: (this.data.quoteNumber || 0).toString(),
    };
  }

  private convertToSAST(date: Date): Date {
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const sastOffset = 2 * 60 * 60000;
    const sastTime = utcTime + sastOffset;
    return new Date(sastTime);
  }

  private async generatePDF(action: 'download' | 'preview'): Promise<void> {
    const pdfDto = this.getPdfDto();

    try {
      const response = await this.pdfService.generateQuotePdf(pdfDto).toPromise();
      const pdfBlob = new Blob([response || ""], { type: 'application/pdf' });

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `quote_${this.quoteDetail.id}.pdf`;
        link.click();
      } else if (action === 'preview') {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.pdfDataUrl = pdfUrl;
        this.openPdfPreview();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.snackbarService.openSnackBar("Error generating PDF", "dismiss");
    }
  }

  private async sendPDF(): Promise<void> {
    const selectedOwner = this.foundOwnerAccount;
    const selectedTempClient = this.retrievedTempClient;
    const emailData = {
      filename: `quote_${this.quoteDetail.id}.pdf`,
      clientEmail: selectedOwner?.email || selectedTempClient?.email || "",
      clientName: selectedOwner?.name || selectedTempClient?.name || "",
      isActive: true
    };

    const pdfDto = this.getPdfDto();

    try {
      await this._emailService.sendEmail(pdfDto, JSON.stringify(emailData), 4).toPromise();
      this.snackbarService.openSnackBar("Email has been sent to: " + (selectedOwner?.email || selectedTempClient?.email) + " successfully", "dismiss", 8000);
      this.dialogRef.close();
    } catch (error: any) {
      console.error('Error sending email:', error);
      this.snackbarService.openSnackBar("Error sending email", "dismiss");
    }
  }

  openPdfPreview(): void {
    const dialogRef = this.dialog.open(PdfPreviewComponent, {
      width: '80vw',
      height: '80vh',
      data: { pdfDataUrl: this.pdfDataUrl }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.showPdfPreview = false;
    });
  }
}
