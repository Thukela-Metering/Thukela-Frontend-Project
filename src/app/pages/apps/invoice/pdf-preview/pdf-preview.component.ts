import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css']
})
export class PdfPreviewComponent implements OnInit {
  pdfDataUrl: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<PdfPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pdfDataUrl: string }
  ) {
    this.pdfDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.pdfDataUrl);
  }

  ngOnInit(): void {}

  closePdfPreview(): void {
    this.dialogRef.close();
  }
}
