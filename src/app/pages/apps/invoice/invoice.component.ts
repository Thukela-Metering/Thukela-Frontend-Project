import { Component, AfterViewInit, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppAddInvoiceComponent } from './add-invoice.component';
import { MatDialog } from '@angular/material/dialog';
import { FilterDTO, InvoiceDTO, OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { AppInvoiceViewComponent } from './view-invoice.component'; // Import the view component
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { LoaderService } from 'src/app/services/lottieLoader.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html'
})
export class AppInvoiceListComponent implements OnInit, AfterViewInit {
  allComplete: boolean = false;
  invoices: InvoiceDTO[] = [];
  filterDTO: FilterDTO = new FilterDTO();
  selectedFromDate = new Date();
  selectedToDate = new Date();
  buildingOwnerNames: { [key: number]: string } = {}; // Mapping of buildingOwnerId to buildingOwnerName
  displayedColumns: string[] = [
    'ref',
    'item', 
    'billTo',
    'totalCost', 
    'status', 
    'action'
  ];

  dataSource = new MatTableDataSource<InvoiceDTO>(this.invoices);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private _invoiceService: InvoiceService,
    private _ownerService: BuildingOwnerService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
  //  this.loaderService.show();
  this.initializeFilterDates();
    this.loadInvoicesListData();
   
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Customize sorting for specific columns
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'item':
          return item.items![0]?.itemName?.toLowerCase() || '';
        case 'billTo':
          return this.buildingOwnerNames[item.buildingOwnerId ?? 0]?.toLowerCase() || '';
        case 'totalCost':
          return item.grandTotal;
        case 'ref':
          return item.referenceNumber;
        case 'status':
          return item.status;
        default:
          return (item as any)[property];
      }
    };
  }
  initializeFilterDates(): void {
    const today = new Date();

    // First day of the current month in UTC
    this.selectedFromDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

    // Today's date in UTC
    this.selectedToDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }
  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AppAddInvoiceComponent, {
      width: '1600px',
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadInvoicesListData();
      }
    });

    const componentInstance = dialogRef.componentInstance;
    componentInstance.saveClicked.subscribe(() => {
      this.loadInvoicesListData();
    });
  }

  openInvoiceDialog(invoiceId: number): void {
    const invoice = this.invoices.find((inv) => inv.id === invoiceId);

    if (invoice) {
   const dialogRef =   this.dialog.open(AppInvoiceViewComponent, {
        width: '1600px', // You can adjust the width as needed
        data: invoice,
      });
   
      dialogRef.afterClosed().subscribe((result) => {
       if (result) {
        this.loadInvoicesListData();
       }
    });
  }
  }

  calculateRunningBalance(invoice: InvoiceDTO): number {
    let runningBalance = invoice.grandTotal;
    invoice.items?.forEach(item => {
      if (item.isCreditNote) {
        runningBalance! -= (item.creditNoteLineValue) * 1.15;
      }
    });
    return runningBalance!;
  }

  loadInvoicesListData(): void {
    this.filterDTO.fromDate = this.selectedFromDate.toISOString();
    this.filterDTO.toDate = this.selectedToDate.toISOString();
    this.filterDTO.booleanFilterValue =true;
    this._invoiceService.getAllInvoices(this.filterDTO).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response && response.data) {
          console.log('data received from backend:', response.data.invoicesDTOs);
          this.invoices = response.data.invoicesDTOs ?? [];
  
          // Fetch owners for each invoice
          const ownerRequests = this.invoices.map((invoice) => 
            this._ownerService.getBuildingOwnerAccountByBuildingId(invoice.buildingId || 0, true).pipe(
              map((response: any) => {
                const owner = response.data?.buildingOwnerAccountDTOs[0] || null;
                if (owner) {
                  this.buildingOwnerNames[invoice.buildingOwnerId ?? 0] = owner.name; // Populate the mapping
                }
                return invoice;
              }),
              catchError((error) => {
                console.error('There was an error!', error);
                return of(invoice);
              })
            )
          );
  
          forkJoin(ownerRequests).subscribe((updatedInvoices) => {
            this.dataSource.data = [];
            this.dataSource.data = updatedInvoices.map(invoice => {
              invoice.runningBalance = this.calculateRunningBalance(invoice);
              return invoice;
            });
            this.dataSource.sort = this.sort;
          });
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }  

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data, filter) => {
      const ownerName = this.buildingOwnerNames[data.buildingOwnerId ?? 0]?.toLowerCase() || '';
      return ownerName.includes(filter) || (data.items![0]?.itemName?.toLowerCase() || '').includes(filter) || (data.referenceNumber?.toLowerCase() || '').includes(filter);
    };
    this.dataSource.filter = filterValue;
  }  

  updateAllComplete(): void {
    this.allComplete = this.dataSource.data != null && this.dataSource.data.every((t) => t.completed);
  }

  someComplete(): boolean {
    if (this.dataSource.data == null) {
      return false;
    }
    return this.dataSource.data.filter((t) => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean): void {
    this.allComplete = completed;
    if (this.dataSource.data == null) {
      return;
    }
    this.dataSource.data.forEach((t) => (t.completed = completed));
  }

  mapStatusToString(status: number): string {
    switch (status) {
      case 0:
        return 'Paid';
      case 1:
        return 'Unpaid';
      case 2:
        return 'Partially Paid';
      default:
        return '';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#0ccf19';
      case 1:
        return '#ab031d';
      case 2:
        return '#ad6f11';
      default:
        return '';
    }
  }
}
