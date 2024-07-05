import { Component, Inject, OnInit, ViewChild, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { InvoiceDTO, InvoiceItemDTO } from 'src/app/DTOs/dtoIndex';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfPreviewComponent } from './pdf-preview/pdf-preview.component';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ConfirmDownloadDialogComponent } from '../confirm-download-dialog.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-invoice-view',
  templateUrl: './view-invoice.component.html',
})
export class AppInvoiceViewComponent implements OnInit {
  invoiceDetail: InvoiceDTO;
  dataSource: MatTableDataSource<InvoiceItemDTO>;
  displayedColumns: string[] = ['itemName', 'unitPrice', 'units', 'itemTotal'];
  pdfDataUrl: string = '';
  showPdfPreview: boolean = false;

  @ViewChild('invoice') invoiceElement!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDTO,
    public dialogRef: MatDialogRef<AppInvoiceViewComponent>,
    private dialog: MatDialog,
    private userPreferencesService: UserPreferencesService
  ) {
    this.invoiceDetail = data;
    this.dataSource = new MatTableDataSource<InvoiceItemDTO>(this.invoiceDetail.items || []);
  }

  ngOnInit(): void {}

  closeDialog(): void {
    this.dialogRef.close();
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
  }

  closePdfPreview(): void {
    this.showPdfPreview = false;
  }

  private async loadTemplate(url: string): Promise<string> {
    const response = await fetch(url);
    return await response.text();
  }

  private insertData(template: string, data: any): string {
    const itemsHtml = data.items.map((item: InvoiceItemDTO) => `
      <tr>
        <td>${item.itemName}</td>
        <td>${item.unitPrice}</td>
        <td>${item.units}</td>
        <td>${item.itemTotal}</td>
      </tr>
    `).join('');

    return template
      .replace('{{companyAddress}}', 'PO Box 50247, Hercules, 0030')
      .replace('{{companyPhone}}', '(123) 456-7890')
      .replace('{{companyRegNo}}', '2015/055277/07')
      .replace('{{invoiceNumber}}', data.id || 'N/A')
      .replace('{{vatNumber}}', '1234567890')
      .replace('{{invoiceDate}}', new Date(data.date).toLocaleDateString() || 'N/A')
      .replace('{{dueDate}}', new Date(data.dueDate).toLocaleDateString() || 'N/A')
      .replace('{{customerName}}', data.customerName || 'N/A')
      .replace('{{customerAddress}}', data.customerAddress || 'N/A')
      .replace('{{customerCityZip}}', data.customerCityZip || 'N/A')
      .replace('{{customerPhone}}', data.customerPhone || 'N/A')
      .replace('{{customerEmail}}', data.customerEmail || 'N/A')
      .replace('{{subtotal}}', data.subtotal || 'N/A')
      .replace('{{vat}}', data.vat || '15%')
      .replace('{{discount}}', data.discount || 'N/A')
      .replace('{{grandTotal}}', data.grandTotal || 'N/A')
      .replace('{{items}}', itemsHtml);
  }

  async generatePDF(action: 'download' | 'preview' | 'email'): Promise<void> {
    const template = await this.loadTemplate('assets/Templates/invoice-template.html');
    const htmlContent = this.insertData(template, this.invoiceDetail);

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      html2canvas(doc.body, { scale: 2 }).then((canvas) => {
        document.body.removeChild(iframe);

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
          heightLeft -= pageHeight;
        }

        if (action === 'download') {
          pdf.save(`invoice_${this.invoiceDetail.id}.pdf`);
        } else if (action === 'preview') {
          this.pdfDataUrl = pdf.output('dataurlstring') + '#zoom=page-fit';
          this.showPdfPreview = true;
          this.openPdfPreview();
        } else if (action === 'email') {
          const blob = pdf.output('blob');
          const fileName = `invoice_${this.invoiceDetail.id}.pdf`;
          this.saveAndPromptEmail(blob, fileName);
        }
      }).catch((error) => {
        console.error('Error generating PDF:', error);
      });
    }
  }

  saveAndPromptEmail(blob: Blob, fileName: string): void {
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(fileURL);

    setTimeout(() => {
      const mailtoLink = `mailto:?subject=Invoice%20${this.invoiceDetail.id}&body=Please%20find%20attached%20invoice%20PDF.%20Remember%20to%20attach%20the%20file%20from%20your%20downloads.`;
      const emailLink = document.createElement('a');
      emailLink.href = mailtoLink;
      emailLink.click();
    }, 1000);
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

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string, type: string): SafeResourceUrl {
    if (type === 'resourceUrl') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    throw new Error(`Invalid safe type specified: ${type}`);
  }
}
