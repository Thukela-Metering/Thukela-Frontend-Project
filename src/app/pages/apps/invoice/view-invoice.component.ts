import { Component, Inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, QueryList, ViewChildren, PipeTransform, ChangeDetectionStrategy, Pipe } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BuildingOwnerDTO, BuildingAccountDTO, InvoiceDTO, PaymentStatus } from 'src/app/DTOs/dtoIndex';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfPreviewComponent } from './pdf-preview/pdf-preview.component';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ConfirmDownloadDialogComponent } from '../confirm-download-dialog.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PDFDocument } from 'pdf-lib';
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
    private userPreferencesService: UserPreferencesService
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
  }

  ngAfterViewInit(): void {}

  initForm(): void {
    const itemsArray = this.invoiceForm.get('items') as FormArray;
    this.invoiceDetail.items!.forEach(item => {
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
    this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(this.data.buildingId ?? 0, true).subscribe({
      next: (response: any) => {
        this.retrievedBuildings = response.data?.buildingOwnerAccountDTOs ?? [];
        this.foundOwnerAccount = this.retrievedBuildings.find(owner => owner.id === this.invoiceDetail.buildingId);
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
    })
  }

  downloadInvoice(): void {
    if (this.userPreferencesService.getDontAskAgainDownload()) {
      this.generatePDF('download');
    } else {
      const dialogRef = this.dialog.open(ConfirmDownloadDialogComponent, {
        width: '300px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.confirmed) {
          if (result.dontAskAgain) {
            this.userPreferencesService.setDontAskAgainDownload(true);
          }
          this.generatePDF('download');
        }
      });
    }
  }

  emailInvoice(): void {
    this.generatePDF('email');
  }

  previewInvoice(): void {
    this.generatePDF('preview');
    this.showPdfPreview = true; 
    this.cdr.detectChanges(); 
  }  

  closePdfPreview(): void {
    this.showPdfPreview = false;
  }

  private async loadTemplate(url: string): Promise<string> {
    const response = await fetch(url);
    return await response.text();
  }

  private insertData(template: string, data: any): string {
    const selectedOwner = this.retrievedBuildings.find(owner => owner.id === data.buildingId);
    const selectedAccount = this.retrievedAccounts.find(account => account.id === data.buildingId);
    const vatNumber = selectedAccount?.buildingTaxNumber ? `Vat no: ${selectedAccount.buildingTaxNumber}` : '';
    const itemsHtml = data.items.map((item: LineItemDTO) => `
      <tr>
        <td>${item.itemName}</td>
        <td>${item.description}</td>
        <td>${this.formatCurrency(item.unitPrice || 0)}</td>
        <td>${item.units}</td>
        <td>${this.formatCurrency(item.lineDiscount || 0)}</td>
        <td>${this.formatCurrency(item.itemTotal || 0)}</td>
      </tr>
    `).join('');

    return template
      .replace('{{companyAddress}}', 'PO Box 50247, Hercules, 0030')
      .replace('{{companyPhone}}', '(123) 456-7890')
      .replace('{{companyRegNo}}', '2015/055277/07')
      .replace('{{invoiceNumber}}', data.referenceNumber || 'N/A')
      .replace('{{vatNumber}}', '4270238266')
      .replace('{{description}}', data.description || 'No Description')
      .replace('{{invoiceDate}}', new Date(data.invoiceDate).toLocaleDateString() || 'N/A')
      .replace('{{dueDate}}', new Date(data.dueDate).toLocaleDateString() || 'N/A')
      .replace('{{customerName}}', selectedOwner?.name || 'N/A')
      .replace('{{customerAddress}}', selectedOwner?.address || 'N/A')
      .replace('{{customerPhone}}', selectedOwner?.contactNumber || 'N/A')
      .replace('{{customerEmail}}', selectedOwner?.email || 'N/A')
      .replace('{{taxNumber}}', vatNumber)
      .replace('{{subtotal}}', this.formatCurrency(data.subTotal ?? 0))
      .replace('{{vat}}', this.formatCurrency(data.vat ?? 0))
      .replace('{{note}}', data.note || '')
      .replace('{{lineDiscount}}', this.formatCurrency(data.lineDiscount ?? 0))
      .replace('{{discount}}', this.formatCurrency(data.discount ?? 0))
      .replace('{{grandTotal}}', this.formatCurrency(this.invoiceDetail.grandTotal ?? 0))
      .replace('{{status}}', this.mapStatusToString(data.status))
      .replace('{{items}}', itemsHtml);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
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

  async generatePDF(action: 'download' | 'preview' | 'email'): Promise<void> {
    console.log('Starting PDF generation');
    const template = await this.loadTemplate('assets/Templates/invoice-template.html');
    console.log('Template loaded');
    const htmlContent = this.insertData(template, this.invoiceDetail);
    console.log('Data inserted into template');
    const selectedOwner = this.retrievedBuildings.find(owner => owner.id === this.data.buildingId);

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(`<div style="padding: 20px;">${htmlContent}</div>`);
        doc.close();
        console.log('Content written to iframe');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageHeight = pdf.internal.pageSize.height || 297;
        const pageWidth = pdf.internal.pageSize.width || 210;
        const margin = 10;
        const canvasHeight = 1123; // Adjust as needed to fit the page
        let position = 0;

        const totalHeight = doc.body.scrollHeight;
        while (position < totalHeight) {
            const canvas = await html2canvas(doc.body, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                x: 0,
                y: position,
                width: doc.body.scrollWidth,
                height: canvasHeight,
                windowWidth: doc.body.scrollWidth,
                windowHeight: canvasHeight,
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.5); // Compress image to 50% quality
            pdf.addImage(imgData, 'JPEG', margin, margin, pageWidth - 2 * margin, (canvas.height * (pageWidth - 2 * margin)) / canvas.width);
            position += canvasHeight;
            if (position < totalHeight) {
                pdf.addPage();
            }
        }

        document.body.removeChild(iframe);
        console.log('PDF generated');

        // Use pdf-lib to compress the PDF further
        const compressedPdfBytes = await this.compressPdfWithPdfLib(pdf.output('arraybuffer'));

        if (compressedPdfBytes.byteLength === 0) {
            console.error('Generated PDF has no pages');
            this.snackbarService.openSnackBar("Error: Generated PDF has no pages", "dismiss");
            return;
        }

        if (action === 'download') {
            console.log('Downloading PDF');
            const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `invoice_${this.invoiceDetail.id}.pdf`;
            link.click();
        } else if (action === 'preview') {
            console.log('Preparing PDF preview');
            const blobUrl = URL.createObjectURL(new Blob([compressedPdfBytes], { type: 'application/pdf' }));
            this.pdfDataUrl = blobUrl;
            console.log('Blob URL:', blobUrl);
            this.showPdfPreview = true;
            this.openPdfPreview();
        } else if (action === 'email') {
            console.log('Sending PDF via email');
            const pdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            this.sendPDF(pdfBlob, selectedOwner);
        }
    }
  }

  private async compressPdfWithPdfLib(arrayBuffer: ArrayBuffer): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: false, updateFieldAppearances: false });
    return compressedPdfBytes;
  }

  async sendPDF(pdfBlob: Blob, selectedOwner: BuildingOwnerDTO | undefined): Promise<void> {
    console.log('Sending PDF blob via email');

    const formData = new FormData();
    formData.append('pdf', pdfBlob, `invoice_${this.invoiceDetail.referenceNumber}.pdf`);
    formData.append('filename', `invoice_${this.invoiceDetail.referenceNumber}.pdf`);
    formData.append('clientEmail', selectedOwner?.email || "");
    formData.append('clientName', selectedOwner?.name || "");
    formData.append('isActive', 'true');

    const emailData = {
        filename: `invoice_${this.invoiceDetail.referenceNumber}.pdf`,
        clientEmail: selectedOwner?.email || "",
        clientName: selectedOwner?.name || "",
        isActive: 'true'
    };

    formData.append('emailData', JSON.stringify(emailData));

    console.log('FormData:', formData);

    try {
        await this._emailService.sendEmail(formData).toPromise();
        console.log('Email sent successfully');
        this.snackbarService.openSnackBar("Email has been sent to: " + selectedOwner?.email + " successfully", "dismiss", 8000);
        this.dialogRef.close();
    } catch (error: any) {
        console.error('Error sending email:', error);
        this.snackbarService.openSnackBar("Error sending email", "dismiss");
    }
  }

  openCreditNote(): void {
    this.dialogRef.close();
    this.dialog.open(CreditNoteComponent, {
      width: '80vw',
      data: this.invoiceDetail
    });
  }
  getControlName(index: number, controlName: string): string {
    return `items.${index}.${controlName}`;
  }

  itemsChanged(): void {
    console.log('Items changed', this.invoiceForm.value);
  }

  openPdfPreview(): void {
    console.log('Opening PDF preview dialog');
    const dialogRef = this.dialog.open(PdfPreviewComponent, {
      width: '80vw',
      height: '80vh',
      data: { pdfDataUrl: this.pdfDataUrl }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.showPdfPreview = false;
      console.log('PDF preview dialog closed');
    });
  }
}

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string, type: string): SafeResourceUrl {
    if (type === 'resourceUrl') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    throw new Error(`Invalid safe type specified: ${type}`);
  }
}
