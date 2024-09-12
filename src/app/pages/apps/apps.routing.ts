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
import { LottieLoaderComponent } from './loaders/lottie-loader.component';
import { ProcessInvoiceComponent } from './invoice/process-invoice/process-invoice.component';
import { PaymentTableComponent } from './payment/payment-table.component';
import { AppProductTableComponent } from './product-management/product-Table/productTable.component';
import { QuoteComponent } from './quote/quote.component';
import { AppBadDeptAccountViewComponent } from './bad-dept/bad-dept-account-view/badDeptAccountView';
import { AppBadDeptMainTableComponent } from './bad-dept/bad-dept-main-table/badDeptMainTable';
import { AppJobCardTableComponent } from './job-cards/job-card-table/job-card.component';

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
          searchType: 'statement',  // Pass the search type here
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Filter' },
          ],
        },
      },
      {
        path: 'badDeptSearch',
        component: SearchComponent,
        data: {
          title: 'search',
          searchType: 'badDept',  // Pass the search type here
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Filter' },
          ],
        },
      },
      {
        path: 'badDept',
        component: AppBadDeptMainTableComponent,
        data: {
          title: 'All Bad Dept',         
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Filter' },
          ],
        },
      },
      {
        path: 'badDept/:id',
        component: AppBadDeptAccountViewComponent,
        data: {
          title: 'Account Bad Dept',         
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
        path: 'payment',
        component: PaymentTableComponent,
        data: {
          title: 'Payment',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Payment List' },
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
      {
        path: 'product-management',
        component: AppProductTableComponent,
        data: {
          title: 'Product-management',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Product-management' },
          ],
        },
      },
      {
        path: 'Job-Cards',
        component: AppJobCardTableComponent,
        data: {
          title: 'Job Cards',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Product-management' },
            ],
      },
      },
      {
        path: 'Quotes',
        component: QuoteComponent,
        data: {
          title: 'Quotes',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Quotes' },
            }
          ],
        },
      },
    ],
  },
];
