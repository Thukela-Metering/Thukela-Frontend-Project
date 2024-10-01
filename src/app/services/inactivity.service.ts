import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutId: any;
  private readonly inactivityTime: number = 15 * 60 * 1000; // 15 minutes

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.setupActivityListeners();
  }

  public setupActivityListeners(): void {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimeout(), true);
    });
    this.resetTimeout();
  }

  private resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => this.logout(), this.inactivityTime);
  }

  private logout(): void {
    this.ngZone.run(() => {
      this.authService.logout().subscribe(
        response => {
          console.log(response);
          localStorage.clear();
          this.router.navigate(['/authentication/boxed-login']);
        },
        error => {
          console.error(error);
        }
      );
    });
  }
}
