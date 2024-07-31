import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { map, catchError, of, forkJoin } from 'rxjs';
import { InvoiceDTO } from 'src/app/DTOs/InvoiceDTO';
import { OperationalResultDTO } from 'src/app/DTOs/operationalResultDTO';

import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppAddInvoiceComponent } from '../add-invoice.component';
import { AppInvoiceViewComponent } from '../view-invoice.component';
import { TransactionDTO } from 'src/app/DTOs/transactionDTO';
import { CommunicationService } from 'src/app/services/communication.service';

@Component({
  selector: 'app-process-invoice',
  templateUrl: './process-invoice.component.html',
})
export class ProcessInvoiceComponent implements OnInit, AfterViewInit {
  allComplete: boolean = false;
  invoices: InvoiceDTO[] = [];
  buildingOwnerNames: { [key: number]: string } = {}; // Mapping of buildingOwnerId to buildingOwnerName
  displayedColumns: string[] = [
    'chk',
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
    private _emailService: CommunicationService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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

  openDialog(action: string, invoiceGuid?: string): void {
    if (invoiceGuid) {
      // Fetch the invoice by GUID and open the dialog with the fetched data
      this._invoiceService.getInvoiceByGuid(invoiceGuid).subscribe({
        next: (response: OperationalResultDTO<TransactionDTO>) => {
          if (response && response.data) {
            const obj = { action, invoice: response.data.invoicesDTOs?.find(inv => inv.guid === invoiceGuid) };
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
        },
        error: (error) => {
          console.error('There was an error fetching the invoice!', error);
        },
      });
    } else {
      const obj = { action };
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
  }

  openInvoiceDialog(invoiceId: number): void {
    const invoice = this.invoices.find((inv) => inv.id === invoiceId);

    if (invoice) {
      this.dialog.open(AppInvoiceViewComponent, {
        width: '1600px', // You can adjust the width as needed
        data: invoice,
      });
    }
  }

  loadInvoicesListData(): void {
    this._invoiceService.getRecurringInvoices(new Date(Date.now())).subscribe({
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
                // Ensure PaymentMethod and ReferenceNumber are populated
                if (!invoice.paymentMethod) {
                  invoice.paymentMethod = 'DefaultPaymentMethod'; // Replace with actual default or retrieved value
                }
                if (!invoice.referenceNumber) {
                  invoice.referenceNumber = 'DefaultReferenceNumber'; // Replace with actual default or retrieved value
                }
                return invoice;
              }),
              catchError((error) => {
                console.error('There was an error!', error);
                return of(invoice);
              })
            )
          );
  
          // Wait for all owner requests to complete
          forkJoin(ownerRequests).subscribe((updatedInvoices) => {
            this.dataSource.data = updatedInvoices;
            this.dataSource.sort = this.sort; // Refresh the sort after data load
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

  processSelectedInvoices(): void {
    const selectedInvoices = this.invoices.filter(invoice => invoice.completed);
    if (selectedInvoices.length > 0) {
      this._emailService.processInvoices(selectedInvoices).subscribe({
        next: (response: OperationalResultDTO<TransactionDTO>) => {
          if (response && response.success) {
            this.snackbarService.openSnackBar('Selected invoices processed successfully', 'Close');
            this.loadInvoicesListData();
          } else {
            this.snackbarService.openSnackBar('Failed to process selected invoices', 'Close');
          }
        },
        error: (error) => {
          console.error('There was an error processing the selected invoices!', error);
          this.snackbarService.openSnackBar('Failed to process selected invoices', 'Close');
        }
      });
    } else {
      this.snackbarService.openSnackBar('No invoices selected for processing', 'Close');
    }
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
        return '#a3e4a1';
      case 1:
        return '#f5a2a2';
      case 2:
        return '#fff6a2';
      default:
        return '';
    }
  }
}
