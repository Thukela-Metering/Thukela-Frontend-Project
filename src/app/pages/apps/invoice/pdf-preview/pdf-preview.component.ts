import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-preview',
  template: `
    <div class="pdf-container">
      <button mat-stroked-button color="primary" (click)="closeDialog()" class="close-button">Close</button>
      <iframe #pdfIframe [src]="sanitizedPdfUrl" width="100%" height="90%"></iframe>
    </div>
  `,
  styles: [`
    .pdf-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .close-button {
      position: absolute;
      bottom: 10px;
      left: 10px;
      z-index: 10;
    }
  `]
})
export class PdfPreviewComponent implements OnInit, AfterViewInit {
  sanitizedPdfUrl: SafeResourceUrl;
  @ViewChild('pdfIframe') pdfIframe!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pdfDataUrl: string },
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<PdfPreviewComponent>
  ) {
    console.log('PdfPreviewComponent initialized');
  }

  ngOnInit(): void {
    console.log('Sanitizing PDF URL');
    this.sanitizedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.pdfDataUrl);
    console.log('PDF URL sanitized:', this.sanitizedPdfUrl);
  }

  ngAfterViewInit(): void {
    console.log('PDF iframe:', this.pdfIframe);
    if (this.pdfIframe && this.pdfIframe.nativeElement) {
      this.pdfIframe.nativeElement.onload = () => {
        console.log('PDF loaded into iframe');
        const iframeDocument = this.pdfIframe.nativeElement.contentDocument || this.pdfIframe.nativeElement.contentWindow.document;
        console.log('iframeDocument:', iframeDocument);
      };
      console.log('PDF iframe URL set to:', this.sanitizedPdfUrl);
    } else {
      console.error('PDF iframe not found or not initialized properly');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
