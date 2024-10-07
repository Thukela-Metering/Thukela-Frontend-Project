import { Component, Inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BuildingOwnerDTO, BuildingAccountDTO, InvoiceDTO, PaymentStatus } from 'src/app/DTOs/dtoIndex';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ConfirmDownloadDialogComponent } from '../confirm-download-dialog.component';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PdfPreviewComponent } from './pdf-preview/pdf-preview.component';
import { PdfService } from 'src/app/services/pdf.service';
import { PdfDTO } from 'src/app/DTOs/pdfDTO';
import { CreditNoteComponent } from '../credit-note/credit-note.component';
import { LineItemDTO } from 'src/app/DTOs/LineItemDTO';

@Component({
  selector: 'app-invoice-view',
  templateUrl: './view-invoice.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppInvoiceViewComponent implements OnInit, AfterViewInit {
  itemDetail: InvoiceDTO;
  invoiceDetail: InvoiceDTO;
  runningBalance: number = 0; 
  retrievedBuildings: BuildingOwnerDTO[] = [];
  retrievedAccounts: BuildingAccountDTO[] = [];
  dataSource: MatTableDataSource<LineItemDTO>;
  displayedColumns: string[] = ['itemName', 'Description', 'unitPrice', 'units', 'lineDiscount', 'itemTotal'];
  pdfDataUrl: string = '';
  foundOwnerAccount: BuildingOwnerDTO | undefined;
  showPdfPreview: boolean = false;
  invoiceForm: FormGroup;

  @ViewChild('invoice') invoiceElement!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDTO,
    public dialogRef: MatDialogRef<AppInvoiceViewComponent>,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _buildingOwnerService: BuildingOwnerService,
    private _emailService: CommunicationService,
    private snackbarService: SnackbarService,
    private _buildingAccountService: BuildingAccountService,
    private userPreferencesService: UserPreferencesService,
    private pdfService: PdfService
  ) {
    this.invoiceDetail = data;
    this.dataSource = new MatTableDataSource<LineItemDTO>(this.invoiceDetail.items || []);
    this.invoiceForm = this.fb.group({
      items: this.fb.array([])
    });
    this.initForm();
  }

  ngOnInit(): void {
    this.loadBuildingOwnerListData();
    this.loadBuildingAccount();
    this.runningBalance = this.calculateRunningBalance(this.invoiceDetail);
  }

  ngAfterViewInit(): void {}

  initForm(): void {
    const itemsArray = this.invoiceForm.get('items') as FormArray;
    this.invoiceDetail.items!.forEach(item => {
      itemsArray.push(this.createItemGroup(item));
    });
  }

  calculateRunningBalance(invoice: InvoiceDTO): number {
    let runningBalance = invoice.grandTotal;
    invoice.items?.forEach(item => {
      if (item.isCreditNote) {
        runningBalance! -= (item.creditNoteLineValue) * 1.15;
      }
    });
    return runningBalance!;
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
    this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(this.data.buildingId ?? 0, true).subscribe({
      next: (response: any) => {
        this.retrievedBuildings = response.data?.buildingOwnerAccountDTOs ?? [];
        this.foundOwnerAccount = response.data?.buildingOwnerAccountDTOs[0];
        console.log("");
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  loadBuildingAccount(): void {
    this._buildingAccountService.getBuildingAccountByBuildingId(this.data.buildingId ?? 0).subscribe({
      next: (response: any) => {
        this.retrievedAccounts = response.data?.buildingAccountDTOs ?? [];
      }
    });
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
    this.showPdfPreview = true; 
    this.cdr.detectChanges(); 
  }  

  closePdfPreview(): void {
    this.showPdfPreview = false;
  }

  private getPdfDto(): PdfDTO {
    const selectedOwner = this.retrievedBuildings.find(owner => owner.buildingId === this.invoiceDetail.buildingId);
    return {
      referenceNumber: this.invoiceDetail.referenceNumber || "",
      invoiceDate: this.convertToSAST(new Date(this.invoiceDetail.invoiceDate!)),
      dueDate: this.convertToSAST(new Date(this.invoiceDetail.dueDate!)),
      customerName: selectedOwner?.name || 'N/A',
      customerAddress: selectedOwner?.address || 'N/A',
      customerPhone: selectedOwner?.contactNumber || 'N/A',
      customerEmail: selectedOwner?.email || 'N/A',
      taxNumber: this.retrievedAccounts.find(account => account.buildingId === this.invoiceDetail.buildingId)?.buildingTaxNumber || 'N/A',
      subTotal: this.invoiceDetail.subTotal || 0,
      discount: this.invoiceDetail.discount || 0,
      vat: this.invoiceDetail.vat || 0,
      grandTotal: this.invoiceDetail.outstandingAmount || 0,
      accountNumber: selectedOwner?.accountNumber,
      items: this.invoiceDetail.items || [],
      note: this.data.note || ""
    };
  }
  
  private convertToSAST(date: Date): Date {
    // Get the UTC time from the date
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
    // Calculate the SAST time (UTC + 2 hours)
    const sastOffset = 2 * 60 * 60000; // 2 hours in milliseconds
    const sastTime = utcTime + sastOffset;
  
    // Return the new Date object with the adjusted SAST time
    return new Date(sastTime);
  }  
  
  private async generatePDF(action: 'download' | 'preview'): Promise<void> {
    const pdfDto = this.getPdfDto();

    try {
      const response = await this.pdfService.generateInvoicePdf(pdfDto).toPromise();
      const pdfBlob = new Blob([response || ""], { type: 'application/pdf' });

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `invoice_${this.invoiceDetail.referenceNumber}.pdf`;
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
    const selectedOwner = this.retrievedBuildings.find(owner => owner.id === this.invoiceDetail.buildingId);
    const emailData = {
      filename: `invoice_${this.invoiceDetail.referenceNumber}.pdf`,
      clientEmail: this.foundOwnerAccount?.email || "",
      clientName: this.foundOwnerAccount?.name || "",
      isActive: true
    };

    const pdfDto = this.getPdfDto();

    try {
      await this._emailService.sendEmail(pdfDto, JSON.stringify(emailData), 1).toPromise();
      this.snackbarService.openSnackBar("Email has been sent to: " + this.foundOwnerAccount?.email + " successfully", "dismiss", 8000);
      this.dialogRef.close();
    } catch (error: any) {
      console.error('Error sending email:', error);
      this.snackbarService.openSnackBar("Error sending email", "dismiss");
    }
  }

  mapStatusToString(status: PaymentStatus | undefined): string {
    switch (status) {
      case PaymentStatus.Paid:
        return 'Paid';
      case PaymentStatus.Unpaid:
        return 'Unpaid';
      case PaymentStatus.PartiallyPaid:
        return 'Partially Paid';
      default:
        return 'Unknown';
    }
  }

  getStatusColor(status: PaymentStatus | undefined): string {
    switch (status) {
      case PaymentStatus.Paid:
        return '#a3e4a1';
      case PaymentStatus.Unpaid:
        return '#f5a2a2';
      case PaymentStatus.PartiallyPaid:
        return '#fff6a2';
      default:
        return 'transparent';
    }
  }

  openCreditNote(): void {
    this.dialogRef.close();
   const dialogref= this.dialog.open(CreditNoteComponent, {
      width: '80vw',
      data: this.invoiceDetail
    });

    dialogref.afterClosed().subscribe((result) => {
      if (result) {
      this.closeDialog();
      }
    });
  }

  getControlName(index: number, controlName: string): string {
    return `items.${index}.${controlName}`;
  }

  itemsChanged(): void {
    console.log('Items changed', this.invoiceForm.value);
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