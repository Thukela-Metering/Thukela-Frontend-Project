import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LottieLoaderComponent } from '../pages/apps/loaders/lottie-loader.component';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();
  private dialogRef: MatDialogRef<LottieLoaderComponent> | null = null;
  private requestCount = 0;

  constructor(private dialog: MatDialog) {}

  show() {
    this.requestCount++;
    if (!this.dialogRef) {
      this.dialogRef = this.dialog.open(LottieLoaderComponent, {
        disableClose: true,
        panelClass: 'transparent-dialog'
      });
    }
    this._loading.next(true);
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      if (this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
      this._loading.next(false);
    }
  }
}
