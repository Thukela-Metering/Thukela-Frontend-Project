import { Component, Inject, Optional, ViewChild, AfterViewInit, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppAddEmployeeComponent } from './add/add.component';
import { PersonDTO } from 'src/app/DTOs/personDTO';
import { UserService as PersonService } from 'src/app/services/user.service';
import { UserDataDTO, UserDataDTO as UserRegistrationDTO } from 'src/app/DTOs/userDataDTO';
import { AuthService } from 'src/app/services/auth.service';
import { LookupValueDTO } from 'src/app/DTOs/lookupValueDTO';
import { SystemUserDTO } from 'src/app/DTOs/systemUserDTO';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatSort } from '@angular/material/sort';

@Component({
  templateUrl: './employee.component.html',
  selector: 'app-building-representative-link',
})
export class AppEmployeeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  searchText: any;
  persons: UserDataDTO[] = [];
  manageActiveUsers: boolean = true;
  displayedColumns: string[] = [
    'id',
    'name',
    'surname',
    'email',
    'mobile',
    'username',
    'address',
    'action',
  ];
  dataSource = new MatTableDataSource(this.persons);

  constructor(public dialog: MatDialog, public datePipe: DatePipe, private _personService: PersonService, private authService: AuthService) { }
  
  ngOnInit(): void {
    this.loadUserListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  
    // Customize sorting for specific columns
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item.name?.trim().toLowerCase() || '';
        case 'surname':
          return item.surname?.trim().toLowerCase() || '';
        case 'username':
          return item.username?.trim().toLowerCase() || '';
        case 'email':
          return item.email?.trim().toLowerCase() || '';
        case 'mobile':
          return item.mobile;
        case 'address':
          return item.address?.trim().toLowerCase() || '';
        default:
          return (item as any)[property];
      }
    };
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadUserListData(): void {
    this._personService.getUserDataList(this.manageActiveUsers).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response) {
          this.dataSource.data = response.data?.userDataDTOs ?? [];
          this.persons = [];
          this.persons = response.data?.userDataDTOs ?? [];
          this.table.renderRows();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AppEmployeeDialogContentComponent, {
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.event === 'Add') {
        this.addRowData(result.data);
      } else if (result.event === 'Update') {
        this.updateRowData(result.data);
      } else if (result.event === 'Delete') {
        this.deleteRowData(result.data);
      }
    });
  }

  addRowData(row_obj: UserDataDTO): void {
    this.authService.register(row_obj).subscribe(
      response => {
        var userDataDTO = new UserDataDTO();
        userDataDTO.id = row_obj.id,
          userDataDTO.name = row_obj.name,
          userDataDTO.surname = row_obj.surname,
          userDataDTO.email = row_obj.email,
          userDataDTO.mobile = row_obj.mobile,
          userDataDTO.username = row_obj.username,
          userDataDTO.userRole = row_obj.userRole,
          userDataDTO.password = row_obj.password,
          userDataDTO.confirmPassword = row_obj.confirmPassword,
          userDataDTO.address = row_obj.address,
          userDataDTO.password = row_obj.password,
          userDataDTO.username = row_obj.username,
          this.persons.push(userDataDTO);
        this.loadUserListData();
      },
      error => {
        console.error(error);
      }
    );
    this.dialog.open(AppAddEmployeeComponent);
  }

  updateRowData(row_obj: UserDataDTO): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value: UserDataDTO) => {
      if (value.id === row_obj.id) {
        value.name = row_obj.name;
        value.id = row_obj.id;
        value.isActive = row_obj.isActive;
        value.dateDeleted = row_obj.dateDeleted;
        value.surname = row_obj.surname;
        value.email = row_obj.email;
        value.mobile = row_obj.mobile;
        value.address = row_obj.address;
        value.username = row_obj.username;
        value.password = row_obj.password;
        value.guid = row_obj.guid;
        value.confirmPassword = row_obj.confirmPassword;
        value.userRole = row_obj.userRole;
        if (value.isActive != false) {
          this.manageActiveUsers = true;
        }
        else{
          this.manageActiveUsers = false;
        }
      }
      if (row_obj.isActive) {
        row_obj.dateDeleted = undefined;
      }
      this._personService.updateUserData(row_obj).subscribe({
        next: (response) => {
          if (response) {
            this.loadUserListData();
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });
      return true;
    });
  }

  deleteRowData(row_obj: UserDataDTO): boolean | any {
    if (row_obj.confirmPassword == "" || row_obj.confirmPassword == null) {
      row_obj.confirmPassword = "some";
    }
    row_obj.isActive = false;
    row_obj.dateDeleted = new Date();
    row_obj.dateDeleted.setHours(0, 0, 0, 0);
    this._personService.deleteUserData(row_obj).subscribe({
      next: (response) => {
        if (response) {
          this.loadUserListData();
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.loadUserListData();
      }
    });

    return true;
  }
}

@Component({
  selector: 'app-dialog-content',
  templateUrl: 'employee-dialog-content.html',
})
export class AppEmployeeDialogContentComponent implements OnInit, OnChanges {
  @Input() localDataFromComponent: UserDataDTO;
  action: string;
  userRegistrationDTO: UserDataDTO = new UserDataDTO();
  local_data: UserDataDTO;
  local_data_systemUser: SystemUserDTO;
  username: string;
  password: string;
  confirmPassword: string;
  userRoleId: number;
  selectedImage: any = '';
  joiningDate: any = '';
  DropDownValues: LookupValueDTO[] = [];
  filteredRoles: LookupValueDTO[] = [...this.DropDownValues];
  roleFilterCtrl: FormControl = new FormControl();

  constructor(
    public datePipe: DatePipe,
    @Optional() public dialogRef: MatDialogRef<AppEmployeeDialogContentComponent>,
    private authService: AuthService,
    private _personService: PersonService,
    private snackbarService: SnackbarService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserDataDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
  }

  ngOnInit(): void {
    this.roleFilterCtrl.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterRoles(value || '');
    });

    this.filteredRoles = [...this.DropDownValues];
    this.getDropdownValues();
    if (this.localDataFromComponent) {
      this.local_data = this.localDataFromComponent;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['localDataFromComponent'] && changes['localDataFromComponent'].currentValue) {
      this.local_data = this.localDataFromComponent;
    }
  }

  filterRole(filter: string): void {
    const filterValue = filter ? filter.toLowerCase() : '';
    this.filteredRoles = this.DropDownValues.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  getDropdownValues() {
    this.authService.getLookupValues().subscribe(
      (response: OperationalResultDTO<TransactionDTO>) => {
        if (response.success) {
          if (response.data != null) {
            this.DropDownValues = response.data.lookupValueDTOs!.map((item: any) => {
              const lookupValue: LookupValueDTO = new LookupValueDTO();
              lookupValue.id = item.id;
              lookupValue.name = item.name;
              lookupValue.description = item.description;
              lookupValue.lookupGroupValueId = item.lookupGroupValueId;
              lookupValue.lookupGroupValueValue = item.lookupGroupValueValue;
              lookupValue.lookupListValueId = item.lookupListValueId;
              lookupValue.lookupListValueValue = item.lookupListValueValue;
              lookupValue.dateCreated = item.dateCreated;
              return lookupValue;
            });
            this.filteredRoles = response.data.lookupValueDTOs!.map((item: any) => {
              const lookupValue: LookupValueDTO = new LookupValueDTO();
              lookupValue.id = item.id;
              lookupValue.name = item.name;
              lookupValue.description = item.description;
              lookupValue.lookupGroupValueId = item.lookupGroupValueId;
              lookupValue.lookupGroupValueValue = item.lookupGroupValueValue;
              lookupValue.lookupListValueId = item.lookupListValueId;
              lookupValue.lookupListValueValue = item.lookupListValueValue;
              lookupValue.dateCreated = item.dateCreated;
              return lookupValue;
            });
          }
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  doAction(): void {
    if (this.action == "Add") {
      this.userRegistrationDTO.confirmPassword = this.confirmPassword;
      this.userRegistrationDTO.password = this.password;
      this.userRegistrationDTO.username = this.username;
      this.userRegistrationDTO.userRole = this.userRoleId;
      this.userRegistrationDTO.name = this.local_data.name;
      this.userRegistrationDTO.username = this.local_data.username;
      this.userRegistrationDTO.password = this.local_data.password;
      this.userRegistrationDTO.confirmPassword = this.local_data.confirmPassword;
      this.userRegistrationDTO.surname = this.local_data.surname;
      this.userRegistrationDTO.userRole = this.local_data.userRole;
      this.userRegistrationDTO.email = this.local_data.email;
      this.userRegistrationDTO.mobile = this.local_data.mobile;
      this.userRegistrationDTO.address = this.local_data.address;
      this.userRegistrationDTO.isActive = this.local_data.isActive;
      this.userRegistrationDTO.dateDeleted = this.local_data.dateDeleted;
      this.dialogRef.close({ event: this.action, data: this.userRegistrationDTO });
    } else {
      this.dialogRef.close({ event: this.action, data: this.local_data });
    }
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  filterRoles(filter: string): void {
    const filterValue = filter ? filter.toLowerCase() : '';
    this.filteredRoles = this.DropDownValues.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  addRowData(row_obj: UserDataDTO): void {
    this.authService.register(row_obj).subscribe(
      response => {
        if(response)
          {
            this.snackbarService.openSnackBar(response.message, "dismiss");
          }             
      },
      error => {
        console.error(error);
        this.snackbarService.openSnackBar(error.message, "dismiss");
      }
    );
  }

  updateRowData(row_obj: UserDataDTO): boolean | any {    
    this._personService.updateUserData(row_obj).subscribe({
      next: (response) => {
        if (response) {
          this.snackbarService.openSnackBar(response.message, "dismiss");
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.snackbarService.openSnackBar(error.message, "dismiss");
      }
    });
  }
}
