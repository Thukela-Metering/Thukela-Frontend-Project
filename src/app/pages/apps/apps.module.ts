import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { NgxPaginationModule } from 'ngx-pagination';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgApexchartsModule } from 'ng-apexcharts';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgScrollbarModule } from 'ngx-scrollbar';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

//Chat
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { AppEmployeeComponent } from './employee/employee.component';
import { AppEmployeeDialogContentComponent } from './employee/employee.component';
import { AppAddEmployeeComponent } from './employee/add/add.component';

import { AppsRoutes } from './apps.routing';
import { MatNativeDateModule } from '@angular/material/core';

// blog
import { AppBuildingComponent, AppBuildingDialogContentComponent } from './buildings/building.component';
import { AppAddBuildingComponent } from './buildings/add/add.component';
import { MatRadioModule } from '@angular/material/radio';
import { AppBuildingRepresentativeLinkComponent } from './linkingRepresentativeToBuilding/linkingPage';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BuildingAccountsComponent } from './building-account/building-account.component';
import { AppBuildingOwnerComponent} from './buildingOwner/buildingOwner.component';
import { AppBuildingOwnerTableComponent } from './buildingOwner/buildingOwnerTable.component';
import { AppBuildingAccountTableComponent } from './building-account/building-accountTable.component';
import { LookupValueManagerComponent } from './lookupValueManager/lookupValueManger.component';
import { AppInvoiceListComponent } from './invoice/invoice.component';
import { AppAddInvoiceComponent } from './invoice/add-invoice.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { AppStatementScreenComponent } from './statement/statement.component';
import { SearchComponent } from './seachComponent/filterSearch.component';
import { PaymentComponent } from './payment/payment.component';

import { PdfPreviewComponent } from './invoice/pdf-preview/pdf-preview.component';
import { ConfirmDownloadDialogComponent } from './confirm-download-dialog.component';
import { CreditNoteComponent } from './credit-note/credit-note.component';
import { CreditNoteTableComponent } from './credit-note/credit-note-table.component';
import { CreditNoteViewComponent, SafePipe } from './credit-note/credit-note-view.component';
import { AppInvoiceViewComponent } from './invoice/view-invoice.component';
import { HangfireDashboardComponent } from './tools/hangfire-dashboard/hangfire-dashboard.component';
import { BorderColorDirective } from 'src/app/directives/borderColorDirective';
import { LottieComponent } from 'ngx-lottie';
import { LottieLoaderComponent } from './loaders/lottie-loader.component';
import { ProcessInvoiceComponent } from './invoice/process-invoice/process-invoice.component';
import { PaymentTableComponent } from './payment/payment-table.component';
import { AppAddProductComponent } from './product-management/add-product/AddProduct.component';
import { AppProductTableComponent } from './product-management/product-Table/productTable.component';
import { QuoteComponent } from './quote/quote.component';
import { AddquoteComponent } from './quote/addquote/addquote.component';
import { AddQuoteCustomerDetailsComponent } from './quote/add-quote-customer-details/add-quote-customer-details.component';
import { ViewQuoteComponent } from './quote/view-quote/view-quote.component';
import { AddNewPortfolioForConvertComponent } from './quote/add-new-portfolio-for-convert/add-new-portfolio-for-convert.component';
import { AppBadDeptModalComponent } from './bad-dept/bad-dept-modal/badDeptModal';
import { AppBadDeptMainTableComponent } from './bad-dept/bad-dept-main-table/badDeptMainTable';
import { AppBadDeptAccountViewComponent } from './bad-dept/bad-dept-account-view/badDeptAccountView';
import { AppJobCardTableComponent } from './job-cards/job-card-table/job-card.component';
import { AppJobCardModalComponent } from './job-cards/job-card-modal/job-card-modal.component';




@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AppsRoutes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPermissionsModule.forRoot(),
    NgApexchartsModule,
    TablerIconsModule.pick(TablerIcons),
    DragDropModule,
    NgxPaginationModule,
    HttpClientModule,
    AngularEditorModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MatNativeDateModule,
    NgScrollbarModule,
    MatRadioModule,
    NgxMatSelectSearchModule,
    LottieComponent
  ],
  exports: [TablerIconsModule,BorderColorDirective],
  declarations: [
    BuildingAccountsComponent,
    AppBuildingOwnerComponent,
    AppEmployeeComponent,
    AppEmployeeDialogContentComponent,
    AppAddEmployeeComponent,
    AppBuildingComponent,
    AppBuildingOwnerTableComponent,
    AppBuildingAccountTableComponent,
    CreditNoteComponent,
    CreditNoteTableComponent,
    CreditNoteViewComponent,
    AppBuildingDialogContentComponent,
    AppInvoiceListComponent,
    AppInvoiceViewComponent,
    PdfPreviewComponent,
    SafePipe,
    AddNewPortfolioForConvertComponent,
    AddquoteComponent,
    ViewQuoteComponent,
    ConfirmDownloadDialogComponent,
    AddQuoteCustomerDetailsComponent,
    AppAddInvoiceComponent,
    AppAddBuildingComponent,    
    LookupValueManagerComponent,
    ProcessInvoiceComponent,
    QuoteComponent,
    AppBuildingRepresentativeLinkComponent,
    PortfolioComponent,
    PaymentTableComponent,
    AppStatementScreenComponent,
    SearchComponent,
    PaymentComponent,
    HangfireDashboardComponent,
    BorderColorDirective,
    LottieLoaderComponent,
    AppAddProductComponent,
    AppProductTableComponent,
    AppBadDeptModalComponent,
    AppBadDeptMainTableComponent,
    AppBadDeptAccountViewComponent,
    AppJobCardTableComponent,
    AppJobCardModalComponent
  ],
  providers: [DatePipe],
})
export class AppsModule { }
