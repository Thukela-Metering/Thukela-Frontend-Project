import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-buildingRepresentativeLink',
  templateUrl: './linkingPage.html',
})
export class AppBuildingRepresentativeLinkComponent implements OnInit, AfterViewInit {
  constructor(
    public dialog: MatDialog,
    private _personService: PersonService,
    private snackbarService: SnackbarService,
    public datePipe: DatePipe,
    private linkingService: BuildingLinkingService,
    private authService: AuthService,
    private _buildingService: BuildingService,
  ) { }

  representativeFilterCtrl: FormControl = new FormControl();
  buildingFilterCtrl: FormControl = new FormControl();

  hide = true;
  hide2 = true;
  conhide = true;
  alignhide = true;
  users: UserDataDTO[] = [];
  buildings: BuildingDTO[] = [];
  selectedRepresentative: number = 0;
  selectedBuilding: number = 0;
  buildingHasLink: boolean = false;
  filteredBuildings: BuildingDTO[] = [];
  filteredRepresentatives: UserDataDTO[] = [];
  tableDataLoaded: boolean = false;
  tableData: BuildingRepresentativeLinkDTO[] = [];
  step = 0;
  displayedColumns: string[] = [
    'BuildingName',
    'RepresentativeName',
    'RepresentativeEmail',
    'RepresentativeMobile',
    // 'action',
  ];
  dataSource = new MatTableDataSource(this.tableData);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  ngAfterViewInit(): void {
    // No implementation needed here for this issue
  }

  ngOnInit(): void {
    this.representativeFilterCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterRepresentatives(value || ''); // Use an empty string if value is falsy
    });

    this.buildingFilterCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterBuildings(value || ''); // Use an empty string if value is falsy
    });

    this.loadUserListData();
    this.loadBuildingListData();
    this.LoadTableData();
  }


  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
  LoadTableData() {
    this.linkingService.getAllBuildingRepresentativeLinks(true).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response.success) {
          this.tableData = response.data?.buildingRepresentativeLinkDTOs ?? []
          this.dataSource.data = response.data?.buildingRepresentativeLinkDTOs ?? [];
          this.tableDataLoaded = true;
        } else {
          this.tableDataLoaded = false;
          this.snackbarService.openSnackBar("Something went wrong. Please contact Support", "dismiss");
        }
      },
      error: (error) => {
        this.tableDataLoaded = false;
        this.snackbarService.openSnackBar("Something went wrong. Please contact Support", "dismiss");
        console.error('There was an error!', error);
      }
    });
  }
  loadUserListData(): void {
    this._personService.getUserDataList(true).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        this.users = response.data?.userDataDTOs ?? [];
        this.filteredRepresentatives = [...this.users];
        this.filterRepresentatives(this.representativeFilterCtrl.value); // Apply initial filter
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
   checkIfBuildingHasALink() {
    this.linkingService.checkIfBuildingHasRepresentative(this.selectedBuilding).subscribe({
      next: (ax => {
        if (ax.success) {
          if (ax.data?.boolResponseProperty) {
            this.buildingHasLink = true;
            this.snackbarService.openSnackBar("Building has a representative. Updating Link once save is clicked", "dismiss");
          } else {
            this.snackbarService.openSnackBar("No link found. Creating new link on save.", "dismiss");
          }
        }
      }),
      error: (error => {
        this.snackbarService.openSnackBar("Something went wrong. Please contact Support", "dismiss");
        console.error('There was an error!', error);
      })
    });
  }


  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response) {
          this.buildings = response.data?.buildingDTOs ?? [];
          this.filteredBuildings = [...this.buildings];
          this.filterBuildings(this.buildingFilterCtrl.value); // Apply initial filter
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  saveBuildingRepLink() {
    const dataToSave = new BuildingRepresentativeLinkDTO();
    dataToSave.buildingId = this.selectedBuilding;
    dataToSave.representativeId = this.selectedRepresentative;
    dataToSave.isActive = true;
    dataToSave.dateCreated = new Date(Date.now());
    if (this.buildingHasLink == false) {
      this.linkingService.addNewBuildingLinkToRepresentative(dataToSave).subscribe({
        next: (response) => {
          if (response) {
            this.snackbarService.openSnackBar("Successfully created new link Between Building And Representative", "dismiss");
            this.selectedBuilding = 0;
            this.selectedRepresentative = 0;
          }
        },
        error: (error) => {
          this.snackbarService.openSnackBar("Something went wrong. Please contact Support", "dismiss");
          console.error('There was an error!', error);
        }
      });
    } else {
      this.linkingService.updateBuildingRepresentativeLink(dataToSave).subscribe({
        next: (response) => {
          if (response) {
            this.snackbarService.openSnackBar("Successfully Updated link Between Building And Representative", "dismiss");
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
