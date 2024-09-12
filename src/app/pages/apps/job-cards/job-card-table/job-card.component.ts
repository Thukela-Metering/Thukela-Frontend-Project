import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { JobCardDTO } from 'src/app/DTOs/jobCardDTO'; // Ensure you have this DTO defined
import { JobCardService } from 'src/app/services/jobcard.service';
import { AppJobCardModalComponent } from '../job-card-modal/job-card-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { JobcardStatus } from 'src/app/DTOs/enums';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { LookupValueManagerService } from 'src/app/services/lookupValueManager.service';

@Component({
    selector: 'app-jobCard-table',
    templateUrl: './job-card.component.html',
})
export class AppJobCardTableComponent implements OnInit, AfterViewInit {
    @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
    manageActiveJobCards: boolean = true;
    jobCardStatuses = Object.keys(JobcardStatus)
        .filter(key => isNaN(Number(key)))  // Filter out the numeric keys
        .map(key => ({ label: key, value: JobcardStatus[key as keyof typeof JobcardStatus] }));
    jobCardList: JobCardDTO[] = [];
    displayedColumns: string[] = [
        'referenceNumber',
        'accountNumber',
        'category',
        'date',
        'status',
        'action'
    ];
    categoryDescriptions: { [key: number]: string } = {};
    dataSource = new MatTableDataSource<JobCardDTO>(this.jobCardList);
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private jobCardService: JobCardService, public dialog: MatDialog, private snackbarService: SnackbarService,
        private lookupService: LookupValueManagerService ) { }

    ngOnInit(): void {
        this.loadJobCardListData();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'referenceNumber':
                    return item.referenceNumber?.trim().toLowerCase() || '';
                case 'accountNumber':
                    return item.accountNumber?.trim().toLowerCase() || '';
                case 'category':
                    return item.categoryId! || 0;
                case 'date':
                    return item.date;
                case 'status':
                    return item.status;
                default:
                    return (item as any)[property];
            }
        };
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    mapStatusToString(status: JobcardStatus | undefined): string {
        switch (status) {
            case JobcardStatus.Completed:
                return 'Completed';
            case JobcardStatus.InProgress:
                return 'In Progress';
            case JobcardStatus.NotStarted:
                return 'Not Started';
            default:
                return 'Unknown';
        }
    }
    mapCategoryToString(categoryId: number | undefined): string {
        return this.lookupService.getDescriptionById(categoryId!) || 'unknown';
      }
    getStatusColor(status: JobcardStatus | undefined): string {
        switch (status) {
            case JobcardStatus.Completed:
                return '#0ccf19';
            case JobcardStatus.NotStarted:
                return '#ab031d';
            case JobcardStatus.InProgress:
                return '#ad6f11';
            default:
                return 'transparent';
        }
    }
    loadJobCardListData(): void {
        this.jobCardList = [];
        this.dataSource.data = [];
        this.jobCardService.getAllJobCards(this.manageActiveJobCards).subscribe({
            next: (response) => {
                if (response && response.data) {
                    if (response.success) {
                        console.log('Here is the response for all job cards:', response);
                        this.jobCardList = response.data.jobCardDTOs ?? [];
                        this.dataSource.data = response.data.jobCardDTOs ?? [];

                    }
                }
            },
            error: (error) => {
                console.error('There was an error!', error);
            },
        });
    }



    updateActionJobCard(jobCard: JobCardDTO): void {
        this.openDialog("Update", jobCard)
        console.log('Updating job card:', jobCard);
    }

    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppJobCardModalComponent, {
            data: obj,
        });

        dialogRef.afterClosed().subscribe((result) => {
            // this.loadBuildingAccountListData();

            if (result && result.event) {
                if (result.event === 'Add') {
                    //  this.addRowData(result.data);     
                    this.manageActiveJobCards = true;
                    this.loadJobCardListData();

                } else if (result.event === 'Update') {
                    this.updateJobCard(result.data);
                    this.manageActiveJobCards = true;
                    this.loadJobCardListData();
                } else if (result.event === 'Delete') {
                    this.deleteJobCard(result.data);
                    this.manageActiveJobCards = false;
                    this.loadJobCardListData();
                }
            }
            this.loadJobCardListData();
        });
    }

    updateJobCard(jobCard: JobCardDTO): void {
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
    deleteJobCard(jobCard: JobCardDTO): void {
        // You can define this method for deleting job cards
        console.log('Deleting job card:', jobCard);
    }
}
