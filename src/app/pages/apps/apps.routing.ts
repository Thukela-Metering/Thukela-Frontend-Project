import { Routes } from '@angular/router';

import { AppEmployeeComponent } from './employee/employee.component';
import { AppBuildingComponent } from './buildings/building.component';
import { AppBuildingRepresentativeLinkComponent } from './linkingRepresentativeToBuilding/linkingPage';
import { BuildingAccountsComponent } from './building-account/building-account.component';
import { AppBuildingOwnerComponent } from './buildingOwner/buildingOwner.component';

import { AppBuildingOwnerTableComponent } from './buildingOwner/buildingOwnerTable.component';
import { AppBuildingAccountTableComponent } from './building-account/building-accountTable.component';

import { LookupValueManagerComponent } from './lookupValueManager/lookupValueManger.component';
import { PortfolioComponent } from './portfolio/portfolio.component';


export const AppsRoutes: Routes = [
  {
    path: '',
    children: [      
      {
        path: 'employee',
        component: AppEmployeeComponent,
        data: {
          title: 'Employee management',
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
          title: 'Building management',
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
          title: 'Building Representative',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Representitive' },
          ],
        },
      },
      {
        path: 'building/buildingOwner',
        component: AppBuildingOwnerTableComponent,
        data: {
          title: 'Building Owner Account',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building Owner' },
          ],
        },
      },
      {
        path: 'building/buildingAccount',
        component: AppBuildingAccountTableComponent,
        data: {
          title: 'Building Account',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building Account' },
          ],
        },
      },{
        path: 'building/buildingPropertyGroup',
        component: LookupValueManagerComponent,
        data: {
          title: 'Building Property Group',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building Property Group' },
          ],
        },
      },
      {
        path: 'building/Portfolio',
        component: PortfolioComponent,
        data: {
          title: 'Building',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Building Portfolio' },
          ],
        },
      },

    ],
  },
];
