import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { InvoiceService } from 'src/app/services/invoice.service';
import { InvoiceDTO } from 'src/app/DTOs/invoiceDTO';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppAddInvoiceComponent } from './add-invoice.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html'
})
export class AppInvoiceListComponent implements OnInit, AfterViewInit {
  allComplete: boolean = false;
  invoices: InvoiceDTO[] = [];
  invoiceList: MatTableDataSource<InvoiceDTO>;
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
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private _invoiceService: InvoiceService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadInvoicesListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    this.loadInvoicesListData();
    const dialogRef = this.dialog.open(AppAddInvoiceComponent, {
      width: '500px',
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.event === 'Add') {
          this.loadInvoicesListData();
        } else if (result.event === 'Update') {
          this.loadInvoicesListData();
        } else if (result.event === 'Delete') {
          this.loadInvoicesListData();
        }
      }
    });
  }

  loadInvoicesListData(): void {
    this.invoices = [
      {
        isActive: true,
        guid: '',
        id: 1,
        ref: 'INV-001',
        status: 'Paid',
        orderDate: new Date('2023-01-01'),
        billFrom: 'Company A',
        billTo: 'Customer A',
        billFromAddress: 'Address A',
        billToAddress: 'Address B',
        items: [
          { itemName: 'Service A', unitPrice: 5000, units: 3, itemTotal: 15000 }
        ],
        totalCost: 15000,
        completed: false
      },
      {
        isActive: true,
        guid: '',
        id: 2,
        ref: 'INV-002',
        status: 'Pending',
        orderDate: new Date('2023-02-01'),
        billFrom: 'Company B',
        billTo: 'Customer B',
        billFromAddress: 'Address C',
        billToAddress: 'Address D',
        items: [
          { itemName: 'Service B', unitPrice: 2000, units: 3, itemTotal: 6000 }
        ],
        totalCost: 6000,
        completed: false
      },
      {
        isActive: true,
        guid: '',
        id: 3,
        ref: 'INV-003',
        status: 'Overdue',
        orderDate: new Date('2023-03-01'),
        billFrom: 'Company C',
        billTo: 'Customer C',
        billFromAddress: 'Address E',
        billToAddress: 'Address F',
        items: [
          { itemName: 'Service C', unitPrice: 3500, units: 1, itemTotal: 3500 }
        ],
        totalCost: 3500,
        completed: false
      }
    ];
    this.dataSource.data = this.invoices;
    this.invoiceList = this.dataSource;
  }

  updateAllComplete(): void {
    this.allComplete = this.invoiceList != null && this.invoiceList.data.every((t) => t.completed);
  }

  someComplete(): boolean {
    if (this.invoiceList == null) {
      return false;
    }
    return this.invoiceList.data.filter((t) => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean): void {
    this.allComplete = completed;
    if (this.invoiceList == null) {
      return;
    }
    this.invoiceList.data.forEach((t) => (t.completed = completed));
  }

  filter(filterValue: string): void {
    this.invoiceList.filter = filterValue.trim().toLowerCase();
  }

  deleteInvoice(row: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.invoiceList.data = this.invoiceList.data.filter((invoice) => invoice.id !== row);
    }
  }
}
