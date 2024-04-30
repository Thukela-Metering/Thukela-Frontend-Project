import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatNativeDateModule } from '@angular/material/core';
interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-form-register-user',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule,MatNativeDateModule],
  templateUrl: './form-register-user.component.html',
})
export class AppFormRegisterUserComponent {
  constructor() {}
  foods: Food[] = [
    { value: 'steak-0', viewValue: 'One' },
    { value: 'pizza-1', viewValue: 'Two' },
    { value: 'tacos-2', viewValue: 'Three' },
    { value: 'tacos-3', viewValue: 'Four' },
  ];

  selectedFood = this.foods[2].value;
}
