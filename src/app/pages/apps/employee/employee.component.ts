import { Component, Inject, Optional, ViewChild, AfterViewInit, OnInit } from '@angular/core';
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

@Component({
  templateUrl: './employee.component.html',
  selector: 'app-building-representative-link',
})
export class AppEmployeeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
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
    'vatNo',
    'action',
  ];
  dataSource = new MatTableDataSource(this.persons);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(public dialog: MatDialog, public datePipe: DatePipe, private _personService: PersonService, private authService: AuthService) { }
  ngOnInit(): void {
    this.loadUserListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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

  // tslint:disable-next-line - Disables all
  addRowData(row_obj: UserDataDTO): void {
    this.authService.register(row_obj).subscribe(
      response => {
        // Handle successful registration
        console.log(response);
        //////////////////////////////////////////////////////
        var userDataDTO = new UserDataDTO();
        userDataDTO.id = row_obj.id,
          userDataDTO.name = row_obj.name,
          userDataDTO.surname = row_obj.surname,
          userDataDTO.vatNo = row_obj.vatNo,
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
        ////////////////////////////////////////////////////
        console.log(row_obj);
        this.loadUserListData();
      },
      error => {
        // Handle error
        console.error(error);
      }
    );
    this.dialog.open(AppAddEmployeeComponent);
  }

  // tslint:disable-next-line - Disables all
  updateRowData(row_obj: UserDataDTO): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value: UserDataDTO) => {
      if (value.id === row_obj.id) {
        value.name = row_obj.name;
        value.id = row_obj.id;
        value.isActive = row_obj.isActive;
        value.dateDeleted = row_obj.dateDeleted;
        value.surname = row_obj.surname;
        value.vatNo = row_obj.vatNo;
        value.email = row_obj.email;
        value.mobile = row_obj.mobile;
        value.address = row_obj.address;
        value.username = row_obj.username;
        value.password = row_obj.password;
        value.guid = row_obj.guid;
        value.confirmPassword = row_obj.confirmPassword;
        value.userRole = row_obj.userRole;
      }
      if (row_obj.isActive) {
        row_obj.dateDeleted = undefined;
      }
      this._personService.updateUserData(row_obj).subscribe({
        next: (response) => {
          if (response) {
            this.loadUserListData();
            console.log(response);
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });

      return true;
    });
  }

  // tslint:disable-next-line - Disables all
  deleteRowData(row_obj: UserDataDTO): boolean | any {
    // this.dataSource.data = this.dataSource.data.filter((value: any) => {
    //   return value.id !== row_obj.id;
    // });
    if (row_obj.confirmPassword == "" || row_obj.confirmPassword == null) {
      row_obj.confirmPassword = "some";
    }
    row_obj.isActive = false;
    row_obj.dateDeleted = new Date();
    row_obj.dateDeleted.setHours(0, 0, 0, 0);
    this._personService.deleteUserData(row_obj).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
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
  // tslint:disable-next-line: component-selector
  selector: 'app-dialog-content',
  templateUrl: 'employee-dialog-content.html',
})
// tslint:disable-next-line: component-class-suffix
export class AppEmployeeDialogContentComponent implements OnInit {
  action: string;
  userRegistrationDTO: UserDataDTO = new UserDataDTO();
  // tslint:disable-next-line - Disables all
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
    public dialogRef: MatDialogRef<AppEmployeeDialogContentComponent>,
    private authService: AuthService,
    private personService: PersonService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserDataDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
  }
  ngOnInit(): void {
    this.roleFilterCtrl.valueChanges.pipe(
      //  debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterRoles(value || ''); // Use an empty string if value is falsy
    });

    this.filteredRoles = [...this.DropDownValues];
    this.getDropdownValues();

  }
  filterRole(filter: string): void {
    const filterValue = filter ? filter.toLowerCase() : '';
    this.filteredRoles = this.DropDownValues.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  getDropdownValues() {
    var userRoleResponse = this.authService.getLookupValues().subscribe(
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
            console.log(this.DropDownValues);

          }
        }
      },
      error => {
        // Handle error
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
      this.userRegistrationDTO.vatNo = this.local_data.vatNo;
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
}
