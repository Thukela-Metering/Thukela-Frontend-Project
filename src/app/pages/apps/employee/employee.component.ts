import { Component, Inject, Optional, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppAddEmployeeComponent } from './add/add.component';
import { PersonDTO } from 'src/app/DTOs/userDto';
import { UserService as PersonService } from 'src/app/services/user.service';
import { userRegistrationDTO as UserRegistrationDTO} from 'src/app/DTOs/userRegistrationDTO';
import { AuthService } from 'src/app/services/auth.service';
import { LookupValueDTO } from 'src/app/DTOs/lookupValueDTO';

@Component({
  templateUrl: './employee.component.html',
})
export class AppEmployeeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  searchText: any;
  persons: PersonDTO[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'surname',
    'idNumber',
    'email',
    'mobile',
    'address',
    'action',
  ];
  dataSource = new MatTableDataSource(this.persons);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(public dialog: MatDialog, public datePipe: DatePipe,private _personService: PersonService,private authService: AuthService) { }
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
    this._personService.getAllUsers().subscribe({
      next: (response) => {
        if (response) {
          this.dataSource.data = response as PersonDTO[];
          this.persons = [];
          this.persons = response as PersonDTO[]
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
  addRowData(row_obj: UserRegistrationDTO): void {

    this.authService.register(row_obj).subscribe(
      response => {       
        // Handle successful registration
        console.log(response);
        //////////////////////////////////////////////////////
        var personDTO =new PersonDTO();
        personDTO.id = row_obj.id,
        personDTO.name = row_obj.name,
        personDTO.surname = row_obj.surname,
        personDTO.idNumber = row_obj.idNumber
        personDTO.email = row_obj.email,
        personDTO.mobile = row_obj.mobile,
        personDTO.address = row_obj.address
        this.persons.push(personDTO);
        ////////////////////////////////////////////////////
        // this.dataSource.data.push(personDTO);
        // this.dataSource.data.unshift({
        //   id: row_obj.id,
        //   name: row_obj.name,
        //   surname: row_obj.surname,
        //   idNumber: row_obj.idNumber,
        //   email: row_obj.email,
        //   mobile: row_obj.mobile,
        //   address: row_obj.address
        // });
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
  updateRowData(row_obj: PersonDTO): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value: any) => {
      if (value.id === row_obj.id) {
        value.name = row_obj.name;
        value.surname = row_obj.surname;
        value.idNumber = row_obj.idNumber;
        value.email = row_obj.email;
        value.mobile = row_obj.mobile;
        value.address = row_obj.address;
      }
      this._personService.updateUserData(row_obj).subscribe({
        next: (response) => {
          if (response) {
         console.log(response);
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });
      this.loadUserListData();
      return true;
    });
  }

  // tslint:disable-next-line - Disables all
  deleteRowData(row_obj: PersonDTO): boolean | any {
    // this.dataSource.data = this.dataSource.data.filter((value: any) => {
    //   return value.id !== row_obj.id;
    // });
    this._personService.deleteUser(row_obj).subscribe({
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
  userRegistrationDTO: UserRegistrationDTO = new UserRegistrationDTO();
  // tslint:disable-next-line - Disables all
  local_data: PersonDTO;
  username:string;
  password:string;
  confirmPassword:string;
  userRoleId:number;
  selectedImage: any = '';
  joiningDate: any = '';
  DropDownValues: LookupValueDTO[] = [];
  constructor(
    public datePipe: DatePipe,
    public dialogRef: MatDialogRef<AppEmployeeDialogContentComponent>,
    private authService: AuthService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: PersonDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
    // if (this.local_data.DateOfJoining !== undefined) {
    //   this.joiningDate = this.datePipe.transform(
    //     new Date(this.local_data.DateOfJoining),
    //     'yyyy-MM-dd',
    //   );
    // }
    // if (this.local_data.imagePath === undefined) {
    //   this.local_data.imagePath = 'assets/images/profile/user-1.jpg';
    // }
  }
  ngOnInit(): void {
  this.getDropdownValues();
  
  }
  getDropdownValues() {
    var userRoleResponse = this.authService.getLookupValues().subscribe(
      response => {
        if (response != null) {
          this.DropDownValues = response.map((item: any) => {
            const lookupValue: LookupValueDTO = new LookupValueDTO();
            lookupValue.Id = item.id;
            lookupValue.Name = item.name;
            lookupValue.Description = item.description;
            lookupValue.LookupGroupValueId = item.lookupGroupValueId;
            lookupValue.LookupGroupValueValue = item.lookupGroupValueValue;
            lookupValue.LookupListValueId = item.lookupListValueId;
            lookupValue.LookupListValueValue = item.lookupListValueValue;
            lookupValue.DateCreated = item.dateCreated;
            return lookupValue;
          });
          console.log(this.DropDownValues);
        }
      },
      error => {
        // Handle error
        console.error(error);
      }
    );
  }
  doAction(): void {
    if(this.action == "Add")
      {
        this.userRegistrationDTO.ConfirmPassword = this.confirmPassword;
        this.userRegistrationDTO.Password = this.password;
        this.userRegistrationDTO.Username = this.username;
        this.userRegistrationDTO.UserRole = this.userRoleId;
        this.userRegistrationDTO.name = this.local_data.name;
        this.userRegistrationDTO.surname = this.local_data.surname;
        this.userRegistrationDTO.idNumber = this.local_data.idNumber;
        this.userRegistrationDTO.email = this.local_data.email;
        this.userRegistrationDTO.mobile = this.local_data.mobile;
        this.userRegistrationDTO.address = this.local_data.address;
        this.dialogRef.close({ event: this.action, data: this.userRegistrationDTO });
      }else
      {
        this.dialogRef.close({ event: this.action, data: this.local_data });
      }
   
  }
  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  // selectFile(event: any): void {
  //   if (!event.target.files[0] || event.target.files[0].length === 0) {
  //     // this.msg = 'You must select an image';
  //     return;
  //   }
  //   const mimeType = event.target.files[0].type;
  //   if (mimeType.match(/image\/*/) == null) {
  //     // this.msg = "Only images are supported";
  //     return;
  //   }
  //   // tslint:disable-next-line - Disables all
  //   const reader = new FileReader();
  //   reader.readAsDataURL(event.target.files[0]);
  //   // tslint:disable-next-line - Disables all
  //   reader.onload = (_event) => {
  //     // tslint:disable-next-line - Disables all
  //     this.local_data.imagePath = reader.result;
  //   };
  // }
}
