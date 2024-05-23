import { Routes } from '@angular/router';
import { AppBoxedLoginComponent } from './boxed-login/boxed-login.component';
import { AppErrorComponent } from './error/error.component';
import { AppMaintenanceComponent } from './maintenance/maintenance.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [

      {
        path: 'boxed-login',
        component: AppBoxedLoginComponent,
      },
      {
        path: 'error',
        component: AppErrorComponent,
      },
      {
        path: 'maintenance',
        component: AppMaintenanceComponent,
      },    
    ],
  },
];
