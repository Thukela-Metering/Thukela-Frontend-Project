import { Component, Inject, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SnackbarService } from "src/app/services/snackbar.service";
import { JobCardService } from "src/app/services/jobcard.service";
import { BuildingAccountDTO, BuildingDTO, BuildingOwnerDTO, JobCardDTO, JobcardStatus, LookupValueDTO, OperationalResultDTO, TransactionDTO, UserDataDTO } from "src/app/DTOs/dtoIndex";
import { UserService as PersonService } from 'src/app/services/user.service';
import { AuthService } from "src/app/services/auth.service";
import { LookupValueManagerService } from "src/app/services/lookupValueManager.service";
import { BuildingService } from "src/app/services/building.service";
import { PortfolioService } from "src/app/services/portfolio.service";

@Component({
    selector: 'app-jobCard-modal',
    templateUrl: './job-card-modal.component.html',
})

export class AppJobCardModalComponent implements OnInit {
    jobCardForm: FormGroup;
    action: string;
    jobCardDTO: JobCardDTO = new JobCardDTO();
    local_data: JobCardDTO;
    jobCardStatuses = Object.keys(JobcardStatus)
        .filter(key => isNaN(Number(key)))  // Filter out the numeric keys
        .map(key => ({ label: key, value: JobcardStatus[key as keyof typeof JobcardStatus] }));
    persons: UserDataDTO[] = [];
    DropDownDivisionValues: LookupValueDTO[] = [];
    filteredBuildings: BuildingDTO[] = [];
    DropDownCategoryValues: LookupValueDTO[] = [];
    selectedBuilding: BuildingDTO | null = null;
    selectedBuildingId: number = 0;
    buildingFilterCtrl: FormControl = new FormControl();
    transactionData: TransactionDTO;
    selectedBuildingAccount: BuildingAccountDTO;
    selectedOwnerAccount: BuildingOwnerDTO;
    buildings: BuildingDTO[] = [];
    constructor(
        private fb: FormBuilder,
        @Optional() public dialogRef: MatDialogRef<AppJobCardModalComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: JobCardDTO,
        private jobCardService: JobCardService,
        private snackbarService: SnackbarService,
        private _personService: PersonService,
        private lookupValueService: LookupValueManagerService,
        private _buildingService: BuildingService,
        private portfolioService: PortfolioService,
        private snackBar: SnackbarService,
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action ? this.local_data.action : "Add";
    }

    ngOnInit(): void {
        this.jobCardForm = this.fb.group({
            buildingId: ['', Validators.required],
            accountNumber: ['', Validators.required],
            categoryId: ['', Validators.required],
            divisionId: [''],
            description: [''],
            employeeGuid: [''],
            date: ['', Validators.required],
            status: ['', Validators.required],
            notes: [''],
            isActive:[''],
        });

        this.jobCardForm.patchValue(this.local_data);
        this.loadUserListData();
        this.getLookupValues();
    }

    GetAccountInfo(event: any) {
        this.selectedBuildingId = event.value;
        this.getSelectedBuildingAccount();
    }
    getSelectedBuildingAccount() {
        this.portfolioService.getPortfolioBuildingById(this.selectedBuildingId).subscribe({
            next: (response: any) => {
                if (response.success) {
                    console.log(response);
                    this.transactionData = response.data!;
                    if (this.transactionData!.buildingAccountDTOs![0] == null) {
                        this.selectedBuildingAccount = new BuildingAccountDTO();

                    } else {
                        this.selectedBuildingAccount = this.transactionData!.buildingAccountDTOs![0];
                        this.jobCardDTO.accountNumber = this.selectedBuildingAccount.bookNumber!;

                        this.jobCardForm.patchValue({
                            accountNumber: this.selectedBuildingAccount.bookNumber,
                        });
                    }
                    if (this.transactionData!.buildingOwnerAccountDTOs![0] == null) {
                    } else {
                        this.selectedOwnerAccount = this.transactionData!.buildingOwnerAccountDTOs![0];
                        this.selectedOwnerAccount.action = "Update";
                    }
                } else {
                    this.snackBar.openSnackBar('Failed to load building data', 'Close', 3000);
                }

            },
            error: (error) => {
                this.transactionData = new TransactionDTO();
                this.snackBar.openSnackBar('Error loading building data', 'Close', 3000);
                console.error('Error loading building data:', error);
            }
        });
    }
    getLookupValues() {
        this.lookupValueService.getLookupValueList("Division", "Division").subscribe(
            (response: OperationalResultDTO<TransactionDTO>) => {
                if (response.success) {
                    if (response.data != null) {
                        this.DropDownDivisionValues = response.data.lookupValueDTOs!.map((item: any) => {
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
                console.log(response);
            },
            error => {
                // Handle error
                console.error(error);
            }
        );

        this.lookupValueService.getLookupValueList("JobCardCategoryGroup", "JobCardCategoryList").subscribe(
            (response: OperationalResultDTO<TransactionDTO>) => {
                if (response.success) {
                    if (response.data != null) {
                        this.DropDownCategoryValues = response.data.lookupValueDTOs!.map((item: any) => {
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
                console.log(response);
            },
            error => {
                // Handle error
                console.error(error);
            }
        );

        this._buildingService.getAllBuildings(true).subscribe({
            next: (response: any) => {
                if (response) {
                    this.buildings = response.data?.buildingDTOs ?? [];
                    this.buildings.sort((a, b) => this.customSort(a.name!, b.name!));
                    this.filteredBuildings = this.buildings;
                }
            },
            error: (error) => {
                console.error('There was an error!', error);
            }
        });
    }
    customSort(nameA: string, nameB: string): number {
        const trimmedNameA = nameA.trim();
        const trimmedNameB = nameB.trim();

        const isNumberA = /^\d/.test(trimmedNameA);
        const isNumberB = /^\d/.test(trimmedNameB);

        if (isNumberA && isNumberB) {
            return trimmedNameA.localeCompare(trimmedNameB, undefined, { numeric: true });
        } else if (isNumberA) {
            return -1;
        } else if (isNumberB) {
            return 1;
        } else {
            return trimmedNameA.localeCompare(trimmedNameB); // Alphabetical order
        }
    }
    doAction(): void {
        this.jobCardDTO = { ...this.jobCardForm.value };
        var referenceNumberToUse = this.jobCardDTO.accountNumber.concat("/");
        this.jobCardDTO.referenceNumber = referenceNumberToUse;

        if (this.action === "Add") {
            this.addJobCard(this.jobCardDTO);

        } else if (this.action === "Update") {
            this.jobCardDTO.id = this.local_data.id;
            this.jobCardDTO.isActive = true;
            this.UpdateJobCard(this.jobCardDTO);
        }else if(this.action === "Delete")
            {
                this.jobCardDTO.id = this.local_data.id;
                this.jobCardDTO.isActive = false;
                this.DeleteJobCard(this.jobCardDTO);
            }
        if (this.dialogRef) {
            this.dialogRef.close({ event: this.action, data: this.jobCardDTO });
        }
    }

    onCancel(): void {
        this.jobCardForm.reset();
        this.dialogRef.close({ event: 'Cancel' });
    }
    mapStatusToString(status: number): string {
        switch (status) {
            case 0:
                return 'Completed';
            case 1:
                return 'Not Started';
            case 2:
                return 'In Progress';
            default:
                return '';
        }
    }
    loadUserListData(): void {
        this._personService.getUserDataEmployeeList(true).subscribe({
            next: (response: OperationalResultDTO<TransactionDTO>) => {
                if (response) {
                    this.persons = response.data?.userDataDTOs ?? [];
                }
            },
            error: (error) => {
                console.error('There was an error!', error);
            }
        });
    }
    addJobCard(jobCard: JobCardDTO): void {
        jobCard.status = Number(jobCard.status);
        this.jobCardService.createJobCard(jobCard).subscribe(
            response => {
                if (response.success) {
                    this.snackbarService.openSnackBar('Job Card created successfully', 'Close');
                }
            },
            error => {
                this.snackbarService.openSnackBar('Error creating Job Card', 'Close');
                console.error('There was an error!', error);
            }
        );
    }
    UpdateJobCard(jobCard: JobCardDTO): void {
        jobCard.status = Number(jobCard.status);
        this.jobCardService.updateJobCard(jobCard).subscribe(
            response => {
                if (response.success) {
                    this.snackbarService.openSnackBar('Job Card updated successfully', 'Close');
                }
            },
            error => {
                this.snackbarService.openSnackBar('Error updating Job Card', 'Close');
                console.error('There was an error!', error);
            }
        );
    }
    DeleteJobCard(jobCard: JobCardDTO): void {
        jobCard.status = Number(jobCard.status);
        this.jobCardService.deleteJobCard(jobCard).subscribe(
            response => {
                if (response.success) {
                    this.snackbarService.openSnackBar('Job Card Deleted successfully', 'Close');
                }
            },
            error => {
                this.snackbarService.openSnackBar('Error Deleting Job Card', 'Close');
                console.error('There was an error!', error);
            }
        );
    }
}