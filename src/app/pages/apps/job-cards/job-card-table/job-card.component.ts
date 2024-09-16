import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { PdfDTO } from 'src/app/DTOs/pdfDTO';
import { PdfService } from 'src/app/services/pdf.service';
import { PdfPreviewComponent } from '../../invoice/pdf-preview/pdf-preview.component';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingAccountDTO, BuildingOwnerDTO } from 'src/app/DTOs/dtoIndex';
import { BuildingAccountService } from 'src/app/services/building-account.service';

@Component({
    selector: 'app-jobCard-table',
    templateUrl: './job-card.component.html',
})
export class AppJobCardTableComponent implements OnInit, AfterViewInit {
    public selectedJobCard: JobCardDTO | null = null;
    @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
    manageActiveJobCards: boolean = true;
    pdfDataUrl: string = '';
    retrievedBuildings: BuildingOwnerDTO[] = [];
    foundOwnerAccount: BuildingOwnerDTO | undefined;
    retrievedAccounts: BuildingAccountDTO[] = [];
    showPdfPreview: boolean = false;
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
        private lookupService: LookupValueManagerService, private pdfService: PdfService, private cdr: ChangeDetectorRef, private _buildingOwnerService: BuildingOwnerService, private _buildingAccountService: BuildingAccountService ) { }

    ngOnInit(): void {
        this.loadJobCardListData();
    }

    selectJobCard(jobCard: JobCardDTO): void {
        this.selectedJobCard = jobCard;
        console.log('Selected Job Card:', this.selectedJobCard);
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

    async openDialog(action: string, obj: any): Promise<void> {
        if (action === 'Preview') {
            await this.loadBuildingOwnerListData();
            await this.loadBuildingAccount();
        }
        setTimeout(async () => {
        //
        obj.action = action;
        if (action === 'Preview') {
            this.generatePDF('preview');
            this.showPdfPreview = true;
            this.cdr.detectChanges();
        }
        else{
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
    },300);
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

    //get owner
    loadBuildingOwnerListData(): void {
        this._buildingOwnerService.getBuildingOwnerAccountByBuildingId(this.selectedJobCard?.buildingId! ?? 0, true).subscribe({
          next: (response: any) => {
            this.retrievedBuildings = response.data?.buildingOwnerAccountDTOs ?? [];
            this.foundOwnerAccount = this.retrievedBuildings.find(owner => owner.buildingId === this.selectedJobCard!.buildingId);
          },
          error: (error) => {
            console.error('There was an error!', error);
          }
        });
      }

    //get account
    loadBuildingAccount(): void {
        this._buildingAccountService.getBuildingAccountByBuildingId(this.selectedJobCard!.buildingId ?? 0).subscribe({
          next: (response: any) => {
            this.retrievedAccounts = response.data?.buildingAccountDTOs ?? [];
          }
        });
      }

    //pdf logic
    private async generatePDF(action: 'preview'): Promise<void> {
        const pdfDto = this.getPdfDto();
    
        try {
            const response = await this.pdfService.generateJobCardPdf(pdfDto).toPromise();
            const pdfBlob = new Blob([response || ""], { type: 'application/pdf' });
    
            if (action === 'preview') {
                const pdfUrl = URL.createObjectURL(pdfBlob);
                this.pdfDataUrl = pdfUrl;
                this.openPdfPreview();
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.snackbarService.openSnackBar("Error generating PDF", "dismiss");
        }
    }    

    private getPdfDto(): PdfDTO {
        const selectedOwner = this.retrievedBuildings.find(owner => owner.buildingId === this.selectedJobCard!.buildingId);
        const foundCatgeory = this.mapCategoryToString(this.selectedJobCard!.categoryId);
        return {
            invoiceDate: this.convertToSAST(new Date(this.selectedJobCard!.date)),
            dueDate: this.convertToSAST(new Date(this.selectedJobCard!.date!)),
            customerName: selectedOwner?.name || 'N/A',
            customerAddress: selectedOwner?.address || 'N/A',
            customerPhone: selectedOwner?.contactNumber || 'N/A',
            customerEmail: selectedOwner?.email || 'N/A',
            taxNumber: this.retrievedAccounts.find(account => account.buildingId === this.selectedJobCard!.buildingId)?.buildingTaxNumber || 'N/A',
            category: foundCatgeory, 
            jobDescription: this.selectedJobCard!.description, 
            accountNumber: this.selectedJobCard!.accountNumber || "", 
            note: this.selectedJobCard!.notes || "", 
            referenceNumber: this.selectedJobCard!.referenceNumber || "0", 
        };
    }    

    openPdfPreview(): void {
        const dialogRef = this.dialog.open(PdfPreviewComponent, {
          width: '80vw',
          height: '80vh',
          data: { pdfDataUrl: this.pdfDataUrl }
        });
    }

    private convertToSAST(date: Date): Date {
        // Get the UTC time from the date
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
      
        // Calculate the SAST time (UTC + 2 hours)
        const sastOffset = 2 * 60 * 60000; // 2 hours in milliseconds
        const sastTime = utcTime + sastOffset;
      
        // Return the new Date object with the adjusted SAST time
        return new Date(sastTime);
      } 
}
