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
    this.initForm();
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
    });
  }

  async downloadCreditNote(): Promise<void> {
    if (this.userPreferencesService.getDontAskAgainDownload()) {
      await this.generateCreditNotePDF('download');
    } else {
      const dialogRef = this.dialog.open(ConfirmDownloadDialogComponent, {
        width: '300px'
      });

      dialogRef.afterClosed().subscribe(async result => {
        if (result && result.confirmed) {
          if (result.dontAskAgain) {
            this.userPreferencesService.setDontAskAgainDownload(true);
          }
          await this.generateCreditNotePDF('download');
        }
      });
    }
  }

  async emailCreditNote(): Promise<void> {
    await this.sendCreditNotePDF();
  }

  async previewCreditNote(): Promise<void> {
    await this.generateCreditNotePDF('preview');
    this.showPdfPreview = true; 
    this.cdr.detectChanges(); 
  }  

  closePdfPreview(): void {
    this.showPdfPreview = false;
  }

  private getCreditNotePdfDto(): PdfDTO {
    const selectedOwner = this.retrievedBuildings.find(owner => owner.id === this.invoiceDetail.buildingId);
  
    // Calculate subtotal and VAT
    const subtotal = this.creditNoteDetail?.creditNoteTotal ? this.creditNoteDetail.creditNoteTotal / 1.15 : 0;
    const vat = this.creditNoteDetail?.creditNoteTotal ? this.creditNoteDetail.creditNoteTotal - subtotal : 0;
  
    return {
      referenceNumber: this.creditNoteDetail?.id?.toString() || "",
      originalRef: this.creditNoteDetail?.invoiceReferenceNumber || "",
      invoiceDate: this.creditNoteDetail?.creditNoteDate ? new Date(this.creditNoteDetail.creditNoteDate) : new Date(),
      dueDate: new Date(),
      customerName: selectedOwner?.name || 'N/A',
      customerAddress: selectedOwner?.address || 'N/A',
      customerPhone: selectedOwner?.contactNumber || 'N/A',
      customerEmail: selectedOwner?.email || 'N/A',
      taxNumber: this.retrievedAccounts.find(account => account.id === this.invoiceDetail.buildingId)?.buildingTaxNumber || 'N/A',
      subTotal: subtotal,
      discount: 0,  // Assuming discount is 0 or you can replace it with the actual discount value
      vat: vat,
      grandTotal: this.creditNoteDetail?.creditNoteTotal || 0,
      items: this.creditNoteDetail?.items || [],
      note: ""
    };
  }  

  private async generateCreditNotePDF(action: 'download' | 'preview' | 'email'): Promise<void> {
    const pdfDto = this.getCreditNotePdfDto();

    try {
      const response = await this.pdfService.generateCreditNotePdf(pdfDto).toPromise();
      const pdfBlob = new Blob([response || ""], { type: 'application/pdf' });

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `credit_note_${this.creditNoteDetail?.id}.pdf`;
        link.click();
      } else if (action === 'preview') {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.pdfDataUrl = pdfUrl;
        this.openPdfPreview();
      } else if (action === 'email') {
        await this.sendCreditNotePDF();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.snackbarService.openSnackBar("Error generating PDF", "dismiss");
    }
  }

  private async sendCreditNotePDF(): Promise<void> {
    const pdfDto = this.getCreditNotePdfDto();
    const selectedOwner = this.retrievedBuildings.find(owner => owner.id === this.invoiceDetail.buildingId);
    const emailData = {
      filename: `credit_note_${this.creditNoteDetail?.id}.pdf`,
      clientEmail: selectedOwner?.email || "",
      clientName: selectedOwner?.name || "",
      isActive: true
    };

    try {
      await this._emailService.sendEmail(pdfDto, JSON.stringify(emailData), 2).toPromise();
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
    console.log('Items changed', this.creditNoteForm.value);
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
  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string, type: string): SafeResourceUrl {
    if (type === 'resourceUrl') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    throw new Error(`Invalid safe type specified: ${type}`);
  }
}
