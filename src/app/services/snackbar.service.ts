import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string, duration: number = 2000) {
    this._snackBar.open(message, action, { duration });
  }

  openCustomSnackBar() {
    // this._snackBar.openFromComponent(PizzaPartyComponent, {
    //   duration: 5000
    // });
  }
}