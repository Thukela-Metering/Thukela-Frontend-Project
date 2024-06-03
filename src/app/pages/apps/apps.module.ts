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
import { PortfolioComponent } from './portfolio/portfolio.component';




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
  ],
  exports: [TablerIconsModule],
  declarations: [
    BuildingAccountsComponent,
    AppBuildingOwnerComponent,
    AppEmployeeComponent,
    AppEmployeeDialogContentComponent,
    AppAddEmployeeComponent,
    AppBuildingComponent,
    AppBuildingOwnerTableComponent,
    AppBuildingAccountTableComponent,
    AppBuildingDialogContentComponent,
    AppAddBuildingComponent,    
    LookupValueManagerComponent,
    AppBuildingRepresentativeLinkComponent,
    PortfolioComponent,
  ],
  providers: [DatePipe],
})
export class AppsModule { }
