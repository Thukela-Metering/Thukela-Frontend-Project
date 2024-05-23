import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService } from 'src/app/services/auth.service';
import { userLoginDTO } from 'src/app/DTOs/userLoginDTO';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TokenResponseDTO } from 'src/app/DTOs/tokenResponseDTO';

@Component({
  selector: 'app-boxed-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './boxed-login.component.html',
})
export class AppBoxedLoginComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService, private router: Router, private authService: AuthService, private snackbarService: SnackbarService) { }

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }
  //
  submit() {
    var loginData = new userLoginDTO();
    loginData.Password = this.form.value.password!.toString();
    loginData.Username = this.form.value.uname!.toString();

    this.authService.login(loginData).subscribe(
      (response) => {

        const token = response.data?.authenticationResponseDTOs[0].accessToken
        //   const token = response['accessToken'];
        console.log('This is the token:');
        console.log(token)
        if (token != "credentials not found!" && token != "Invalid Password" && token != null) {
          localStorage.setItem('token', token ?? "No Token Found!");
          localStorage.setItem('LoggedInUserId', response.data?.userId ?? "-1");
          localStorage.setItem("LoggedInUserRefreshToken", response['refreshToken'])
          localStorage.setItem("LoggedInUserGuid", response.data?.authenticationResponseDTOs[0].guid)
          this.authService.isauthenticated = true;
          this.router.navigate(['/dashboards/dashboard1']);
        } else {
          this.snackbarService.openSnackBar(token, "dismiss");
        }


        console.log(response);
      },
      error => {
        this.snackbarService.openSnackBar("Invalid credentials or something went wrong. Contact Support", "dismiss");
        console.error(error);
      }
    );
    // console.log(this.form.value);
    // this.router.navigate(['/dashboards/dashboard1']);
  }
}
