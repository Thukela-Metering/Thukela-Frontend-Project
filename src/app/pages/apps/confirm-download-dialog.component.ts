import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-download-dialog',
  template: `
    <h1 mat-dialog-title>Confirm Download</h1>
    <div mat-dialog-content>
      <p>Do you want to download the invoice?</p>
      <mat-checkbox [(ngModel)]="dontAskAgain">Don't ask again</mat-checkbox>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onConfirm()">Download</button>
    </div>
  `,
})
export class ConfirmDownloadDialogComponent {
  dontAskAgain = false;

  constructor(public dialogRef: MatDialogRef<ConfirmDownloadDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close({ confirmed: true, dontAskAgain: this.dontAskAgain });
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
