import { Component, Inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, Pipe, PipeTransform } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BuildingOwnerDTO, BuildingAccountDTO, InvoiceDTO, PaymentStatus } from 'src/app/DTOs/dtoIndex';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ConfirmDownloadDialogComponent } from '../confirm-download-dialog.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CreditNoteComponent } from '../credit-note/credit-note.component';
import { LineItemDTO } from 'src/app/DTOs/LineItemDTO';
import { CreditNoteDTO } from 'src/app/DTOs/CreditNoteDTO';
import { PdfPreviewComponent } from '../invoice/pdf-preview/pdf-preview.component';
import { CreditNoteService } from 'src/app/services/credit-note.service';
import { PdfService } from 'src/app/services/pdf.service';
import { PdfDTO } from 'src/app/DTOs/pdfDTO';

@Component({
  selector: 'app-credit-note-view',
  templateUrl: './credit-note-view.component.html',
})
export class CreditNoteViewComponent implements OnInit, AfterViewInit {
  itemDetail: InvoiceDTO;
  invoiceDetail: InvoiceDTO;
  retrievedBuildings: BuildingOwnerDTO[] = [];
  retrievedAccounts: BuildingAccountDTO[] = [];
  creditNoteDetail: CreditNoteDTO | null = null;
  retreivedCreditNotes: CreditNoteDTO[] = [];
  dataSource: MatTableDataSource<LineItemDTO>;
  displayedColumns: string[] = ['itemName', 'Description', 'unitPrice', 'units', 'creditTotal'];
  pdfDataUrl: string = '';
  foundOwnerAccount: BuildingOwnerDTO | undefined;
  showPdfPreview: boolean = false;
  creditNoteForm: FormGroup;

  @ViewChild('creditNote') creditNoteElement!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { credit: CreditNoteDTO, invoice: InvoiceDTO },
    public dialogRef: MatDialogRef<CreditNoteViewComponent>,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _buildingOwnerService: BuildingOwnerService,
    private _emailService: CommunicationService,
    private snackbarService: SnackbarService,
    private _buildingAccountService: BuildingAccountService,
    private _CreditNoteService: CreditNoteService,
    private pdfService: PdfService,
    private userPreferencesService: UserPreferencesService
  ) {
    this.creditNoteDetail = data.credit;
    this.invoiceDetail = data.invoice;
    this.dataSource = new MatTableDataSource<LineItemDTO>(this.creditNoteDetail.items || []);
    this.creditNoteForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadBuildingOwnerListData();
    this.loadBuildingAccount();
    this.loadCreditNoteDetail(this.creditNoteDetail?.guid || " ");
  }

  ngAfterViewInit(): void {}

  initForm(): void {
    const itemsArray = this.creditNoteForm.get('items') as FormArray;
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
    this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(this.invoiceDetail.buildingId ?? 0, true).subscribe({
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
    this._buildingAccountService.getBuildingAccountByBuildingId(this.invoiceDetail.buildingId ?? 0).subscribe({
      next: (response: any) => {
        this.retrievedAccounts = response.data?.buildingAccountDTOs ?? [];
      }
    })
  }

  loadCreditNoteDetail(id: string): void {
    this._CreditNoteService.getCreditNoteByGuid(id).subscribe({
      next: (response: any) => {
        this.retreivedCreditNotes = response;
      },
      error: (error) => {
        console.error('There was an error fetching credit note details!', error);
      }
    });
  }

  downloadCreditNote(): void {
    if (this.userPreferencesService.getDontAskAgainDownload()) {
      this.generateCreditNotePDF('download');
    } else {
      const dialogRef = this.dialog.open(ConfirmDownloadDialogComponent, {
        width: '300px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.confirmed) {
          if (result.dontAskAgain) {
            this.userPreferencesService.setDontAskAgainDownload(true);
          }
          this.generateCreditNotePDF('download');
        }
      });
    }
  }

  emailCreditNote(): void {
    this.generateCreditNotePDF('email');
  }

  previewCreditNote(): void {
    this.generateCreditNotePDF('preview');
    this.showPdfPreview = true; 
    this.cdr.detectChanges(); 
  }  

  closePdfPreview(): void {
    this.showPdfPreview = false;
  }

  async generateCreditNotePDF(action: 'download' | 'preview' | 'email'): Promise<void> {
    console.log('Starting PDF generation');
    const pdfDto: PdfDTO = this.createCreditNotePdfDto();

    try {
      const pdfBlob = await this.pdfService.generateCreditNotePdf(pdfDto).toPromise();
      if (action === 'download') {
        console.log('Downloading PDF');
        const blob = new Blob([pdfBlob || ""], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `credit_note_${this.creditNoteDetail?.id}.pdf`;
        link.click();
      } else if (action === 'preview') {
        console.log('Preparing PDF preview');
        const blobUrl = URL.createObjectURL(new Blob([pdfBlob || ""], { type: 'application/pdf' }));
        this.pdfDataUrl = blobUrl;
        console.log('Blob URL:', blobUrl);
        this.showPdfPreview = true;
        this.openPdfPreview();
      } else if (action === 'email') {
        console.log('Sending PDF via email');
        this.sendCreditNotePDF(pdfBlob!);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.snackbarService.openSnackBar("Error generating PDF", "dismiss");
    }
  }

  private createCreditNotePdfDto(): PdfDTO {
    return {
      referenceNumber: this.creditNoteDetail?.id?.toString() || "",
      originalRef: this.creditNoteDetail?.invoiceReferenceNumber || "",
      invoiceDate: this.creditNoteDetail?.creditNoteDate ? new Date(this.creditNoteDetail.creditNoteDate) : new Date(),
      dueDate: new Date(),
      customerName: this.foundOwnerAccount?.name || 'N/A',
      customerAddress: this.foundOwnerAccount?.address || 'N/A',
      customerPhone: this.foundOwnerAccount?.contactNumber || 'N/A',
      customerEmail: this.foundOwnerAccount?.email || 'N/A',
      taxNumber: this.retrievedAccounts.find(account => account.id === this.invoiceDetail.buildingId)?.buildingTaxNumber || 'N/A',
      subTotal: this.creditNoteDetail?.creditNoteTotal || 0,
      discount: 0,
      vat: this.creditNoteDetail?.creditNoteTotal ? this.creditNoteDetail.creditNoteTotal * 0.15 : 0,
      grandTotal: this.creditNoteDetail?.creditNoteTotal ? this.creditNoteDetail.creditNoteTotal * 1.15 : 0,
      items: this.creditNoteDetail?.items || [],
      note: ""
    };
  }

  async sendCreditNotePDF(pdfBlob: Blob): Promise<void> {
    console.log('Sending PDF blob via email');

    const formData = new FormData();
    formData.append('pdf', pdfBlob, `Credit_Note_${this.creditNoteDetail?.id}.pdf`);
    formData.append('filename', `Credit_Note_${this.creditNoteDetail?.id}.pdf`);
    formData.append('clientEmail', this.foundOwnerAccount?.email || "");
    formData.append('clientName', this.foundOwnerAccount?.name || "");
    formData.append('isActive', 'true');

    const emailData = {
        filename: `Credit_Note_${this.creditNoteDetail?.id}.pdf`,
        clientEmail: this.foundOwnerAccount?.email || "",
        clientName: this.foundOwnerAccount?.name || "",
        isActive: 'true'
    };

    formData.append('emailData', JSON.stringify(emailData));

    console.log('FormData:', formData);

    try {
        await this._emailService.sendEmailWithBlob(formData, 2).toPromise();
        console.log('Email sent successfully');
        this.snackbarService.openSnackBar("Email has been sent to: " + this.foundOwnerAccount?.email + " successfully", "dismiss", 8000);
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
    console.log('Items changed', this.creditNoteForm.value);
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
