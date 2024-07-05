import { Component } from '@angular/core';
import { InactivityService } from './services/inactivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private inactivityService: InactivityService) {}
  title = 'Thukela Metering';
  ngOnInit(): void {
    // Start tracking inactivity
    this.inactivityService.setupActivityListeners();
  }
}
