
import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  template: `
    <div class="branding">
      @if(options.theme === 'light') {
      <a href="/dashboards/dashboard1">
        <img
          src="./assets/images/logos/thukela-logo.png"
          style="width: 155px; height: auto; max-width: 100%;"
          class="align-middle m-2"
          alt="logo"
        />
      </a>
      } @if(options.theme === 'dark') {
      <a href="/dashboards/dashboard1">
        <img
          src="./assets/images/logos/thukela-logo.png"
          style="width: 155px; height: auto; max-width: 100%;"
          class="align-middle m-2"
          alt="logo"
        />
      </a>
      }
    </div>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService) {}
}
