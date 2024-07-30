import { Injectable, NgZone } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { LoaderService } from 'src/app/services/lottieLoader.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private snackbarService: SnackbarService,
    private loaderService: LoaderService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = localStorage.getItem('token'); 
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });

    this.loaderService.show();

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        this.loaderService.hide();
        if (error.status === 401) {
          this.handleUnauthorized();
        }
        return throwError(error);
      }),
      finalize(() => this.loaderService.hide())
    );
  }

  private handleUnauthorized(): void {
    this.ngZone.run(() => {
      this.authService.logout().subscribe(
        response => {
          console.log(response);
          localStorage.clear();
          this.router.navigate(['/authentication/boxed-login']);
          this.snackbarService.openSnackBar("Unauthorized access detected. Logging out", "Dismiss");
        },
        error => {
          console.error(error);
        }
      );
    });
  }
}
