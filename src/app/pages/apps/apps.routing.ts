import { Routes } from '@angular/router';

import { AppEmployeeComponent } from './employee/employee.component';
import { AppBuildingComponent } from './buildings/building.component';
import { AppBuildingRepresentativeLinkComponent } from './linkingRepresentativeToBuilding/linkingPage';
import { BuildingAccountsComponent } from './building-account/building-account.component';
import { AppBuildingOwnerComponent } from './buildingOwner/buildingOwner.component';

export const AppsRoutes: Routes = [
  {
    path: '',
    children: [      
      {
        path: 'employee',
        component: AppEmployeeComponent,
        data: {
          title: 'Employee',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Employee' },
          ],
        },
      },
      {
        path: 'building',
        component: AppBuildingComponent,
        data: {
          title: 'Building',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building' },
          ],
        },
      },
      {
        path: 'building/buildingRepresentative',
        component: AppBuildingRepresentativeLinkComponent,
        data: {
          title: 'Building',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building' },
          ],
        },
      },
      {
        path: 'building/buildingAccount',
        component: BuildingAccountsComponent,
        data: {
          title: 'Building Account',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building' },
          ],
        },
      },
      {
        path: 'building/buildingOwner',
        component: AppBuildingOwnerComponent,
        data: {
          title: 'Building',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building Owner' },
          ],
        },
      },
    ],
  },
];
