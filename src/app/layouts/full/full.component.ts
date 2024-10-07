// full.component.ts

import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';
import { AppSettings } from 'src/app/app.config';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { navItems } from './vertical/sidebar/sidebar-data';
import { NavService } from '../../services/nav.service';
import { AppNavItemComponent } from './vertical/sidebar/nav-item/nav-item.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './vertical/sidebar/sidebar.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HeaderComponent } from './vertical/header/header.component';
import { AppHorizontalHeaderComponent } from './horizontal/header/header.component';
import { AppHorizontalSidebarComponent } from './horizontal/sidebar/sidebar.component';
import { AppBreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { CustomizerComponent } from './shared/customizer/customizer.component';
import { UserService } from 'src/app/services/user.service';
import { PersonDTO } from 'src/app/DTOs/personDTO';
import { RoleService } from 'src/app/services/role.service';
import { AuthService } from 'src/app/services/auth.service';
import { OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

// for mobile app sidebar
interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
    AppHorizontalHeaderComponent,
    AppHorizontalSidebarComponent,
    AppBreadcrumbComponent,
    CustomizerComponent
  ],
  templateUrl: './full.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class FullComponent implements OnInit {

  navItems = navItems;
  LoggedInPersonName: string = '';
  LoggedInPersonRole: string = '';

  // ViewChild for Main Navigation Sidenav
  @ViewChild('leftsidenav') sidenav?: MatSidenav;

  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  // Get options from service
  options: AppSettings;
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  get isTablet(): boolean {
    return this.resView;
  }

  resView = false;

  constructor(
    private settings: CoreService,
    private mediaMatcher: MediaMatcher,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navService: NavService,
    private _userService: UserService,
    private _roleService: RoleService,
    private authService: AuthService
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.options = this.settings.getOptions() || {
      sidenavOpened: true,
      sidenavCollapsed: false,
      horizontal: false,
      navPos: 'side',
      dir: 'ltr',
      theme: 'light',
      // ... other default settings
    };

    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
      .subscribe((state) => {
        if (state.breakpoints[MOBILE_VIEW] || state.breakpoints[BELOWMONITOR]) {
          this.isMobileScreen = true;
          this.options.sidenavOpened = false;
          this.options.sidenavCollapsed = false;
        } else if (state.breakpoints[TABLET_VIEW]) {
          this.isMobileScreen = false;
          this.options.sidenavOpened = true;
          this.options.sidenavCollapsed = true;
        } else if (state.breakpoints[MONITOR_VIEW]) {
          this.isMobileScreen = false;
          this.options.sidenavOpened = true;
          this.options.sidenavCollapsed = false;
        }

        // Update settings after state changes
        this.settings.setOptions(this.options);
      });

    // Initialize project theme with options
    this.receiveOptions(this.options);

    // This is for scroll to top
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.content.scrollTo({ top: 0 });
      });
  }

  ngOnInit(): void {
    this.getLoggedInPersonData();
    this.getLoggedInUserRole();
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  getLoggedInPersonData() {
    const getLoggedInUserId = localStorage.getItem('LoggedInUserGuid');
    if (getLoggedInUserId) {
      this._userService.getUserById(getLoggedInUserId).subscribe((userDetail) => {
        const result = userDetail as OperationalResultDTO<TransactionDTO>;
        if (result.data && result.data.personDTOs && result.data.personDTOs.length > 0) {
          this.LoggedInPersonName = `${result.data.personDTOs[0].name} ${result.data.personDTOs[0].surname}`;
        }
      });
    }
  }

  getLoggedInUserRole() {
    const getLoggedInUserId = localStorage.getItem('LoggedInUserGuid');
    if (getLoggedInUserId) {
      this._roleService.getUserRoleByUserId(getLoggedInUserId).subscribe(ax => {
        const result = ax as OperationalResultDTO<TransactionDTO>;
        this.LoggedInPersonRole = result.data?.stringResponseProperty || '';
      });
    }
  }

  signout(){
    this.authService.logout().subscribe(
      response => {
        localStorage.clear();
        this.router.navigate(['/authentication/boxed-login']);
      },
      error => {
        console.error(error);
      }
    );
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }

  receiveOptions(options: AppSettings): void {
    this.options = options;
    this.toggleDarkTheme(options);
  }

  toggleDarkTheme(options: AppSettings) {
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
    }
  }

  // Unified Toggle Function
  toggleSidenav() {
    if (this.sidenav) {
      this.sidenav.toggle();
      // Update the sidenavOpened state based on the new state
      this.sidenav.opened ? (this.options.sidenavOpened = true) : (this.options.sidenavOpened = false);
      this.settings.setOptions(this.options);
    }
  }
}
