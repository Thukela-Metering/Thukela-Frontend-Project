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
import { AppInvoiceListComponent } from './invoice/invoice.component';
import { AppStatementScreenComponent } from './statement/statement.component';
import { SearchComponent } from './seachComponent/filterSearch.component';
import { PaymentComponent } from './payment/payment.component';
import { CreditNoteTableComponent } from './credit-note/credit-note-table.component';
import { HangfireDashboardComponent } from './tools/hangfire-dashboard/hangfire-dashboard.component';
import { ProcessInvoiceComponent } from './invoice/process-invoice/process-invoice.component';


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
      },
      {
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
        path: 'invoice',
        component: AppInvoiceListComponent,
        data: {
          title: 'Invoicing',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Invoicing' },
          ],
        },
      },
      {
        path: 'statement',
        component: AppStatementScreenComponent,
        data: {
          title: 'Statement',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Invoicing' },
          ],
        },
      },
      {
        path: 'statementSearch',
        component: SearchComponent,
        data: {
          title: 'search',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Filter' },
          ],
        },
      },
      {
        path: 'payment/:id',
        component: PaymentComponent,
        data: {
          title: 'Payment',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Payment' },
          ],
        },
      },
      {
        path: 'creditNote',
        component: CreditNoteTableComponent,
        data: {
          title: 'Credit Notes',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Credit Notes' },
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
      {
        path: 'hangfire',
        component: HangfireDashboardComponent,
        data: {
          title: 'Hangfire Dashboard',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Hangfire Dashboard' },
          ],
        },
      },
      {
        path: 'recurring',
        component: ProcessInvoiceComponent,
        data: {
          title: 'Recurring Invoices',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Recurring Invoices' },
          ],
        },
      },
    ],
  },
];
