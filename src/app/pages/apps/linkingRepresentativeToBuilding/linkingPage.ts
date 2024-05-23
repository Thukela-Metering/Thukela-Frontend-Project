import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserDataDTO } from 'src/app/DTOs/userDataDTO';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { UserService as PersonService } from 'src/app/services/user.service';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingRepresentativeLinkDTO } from 'src/app/DTOs/buildingRepLinkDTO';
import { BuildingLinkingService } from 'src/app/services/linking.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';

@Component({
  selector: 'app-buildingRepresentativeLink',
  templateUrl: './linkingPage.html',
})
export class AppBuildingRepresentativeLinkComponent implements OnInit, AfterViewInit {
  constructor(public dialog: MatDialog, private _personService: PersonService, private snackbarService: SnackbarService, public datePipe: DatePipe, private linkingService: BuildingLinkingService, private authService: AuthService, private _buildingService: BuildingService,) { }// private _personService: PersonService,
  representativeFilterCtrl: FormControl = new FormControl();
  buildingFilterCtrl: FormControl = new FormControl();
  ngAfterViewInit(): void {
    //   throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    this.representativeFilterCtrl.valueChanges.pipe(
     debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterRepresentatives(value || ''); // Use an empty string if value is falsy
    });
  
    this.buildingFilterCtrl.valueChanges.pipe(
    //  debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterBuildings(value || ''); // Use an empty string if value is falsy
    });
  
    this.loadUserListData();

    this.loadBuildingListData();   
  }
  hide = true;
  hide2 = true;
  conhide = true;
  alignhide = true;
  users: UserDataDTO[] = [];
  buildings: BuildingDTO[] = [];
  selectedRepresentative: number = 0;
  selectedBuilding: number = 0;
 
  filteredBuildings: BuildingDTO[] = [...this.buildings];
  filteredRepresentatives: UserDataDTO[] = [...this.users];
  // 3 accordian
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }
  loadUserListData(): void {
    this._personService.getUserDataList(true).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        this.users = response.data?.userDataDTOs ?? [];
        this.filterRepresentatives(this.representativeFilterCtrl.value); // Apply initial filter
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response) {
        this.buildings = response.data?.buildingDTOs ?? [];
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
  prevStep() {
    this.step--;
  }
  saveBuildingRepLink() {
    var dataToSave = new BuildingRepresentativeLinkDTO();
    dataToSave.buildingId = this.selectedBuilding;
    dataToSave.representativeId = this.selectedRepresentative;
    dataToSave.isActive = true;
    dataToSave.dateCreated = new Date(Date.now());
    this.linkingService.addNewBuildingLinkToRepresentative(dataToSave).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);          
          this.snackbarService.openSnackBar("SuccessFully created new link Between Building And Representative", "dismiss");
          this.selectedBuilding = 0;
          this.selectedRepresentative = 0;
        }
      },
      error: (error) => {
        this.snackbarService.openSnackBar("Something went wrong. Please contact Support", "dismiss");
        console.error('There was an error!', error);
      }
    });
  }
  filterRepresentatives(filter: string): void {
    const filterValue = filter ? filter.toLowerCase() : '';
    this.filteredRepresentatives = this.users.filter(option => option.name.toLowerCase().includes(filterValue));
  }
  
  filterBuildings(filter: string): void {
    const filterValue = filter ? filter.toLowerCase() : '';
    this.filteredBuildings = this.buildings.filter(option => option.name!.toLowerCase().includes(filterValue));
  }
  panelOpenState = false;
}
