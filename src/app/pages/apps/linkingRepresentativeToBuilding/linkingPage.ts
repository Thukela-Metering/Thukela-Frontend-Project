import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserData } from '../../tables/mix-table/mix-table.component';
import { BuildingDTO } from 'src/app/DTOs/buildingDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserDataDTO } from 'src/app/DTOs/userDataDTO';
import { OperationalResultDTO } from 'src/app/DTOs/backendResponseDTO';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { UserService as PersonService } from 'src/app/services/user.service';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingRepresentativeLinkDTO } from 'src/app/DTOs/buildingRepLinkDTO';
import { BuildingLinkingService } from 'src/app/services/linking.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-buildingRepresentativeLink',
  templateUrl: './linkingPage.html',
})
export class AppBuildingRepresentativeLinkComponent implements OnInit, AfterViewInit {
  constructor(public dialog: MatDialog, private _personService: PersonService, private snackbarService: SnackbarService, public datePipe: DatePipe, private linkingService: BuildingLinkingService, private authService: AuthService, private _buildingService: BuildingService,) { }// private _personService: PersonService,
  ngAfterViewInit(): void {
    //   throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    this.loadUserListData();

    this.loadBuildingListData();
  }
  hide = true;
  hide2 = true;
  conhide = true;
  alignhide = true;
  users: UserDataDTO[];
  buildings: BuildingDTO[] = [];
  selectedRepresentative: number = 0;
  selectedBuilding: number = 0;
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
      next: (response: OperationalResultDTO<UserDataDTO[]>) => {
        if (response) {
          this.users = response.data ?? [];
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: OperationalResultDTO<BuildingDTO[]>) => {
        if (response) {
          this.buildings = response.data ?? [];
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
  panelOpenState = false;
}
