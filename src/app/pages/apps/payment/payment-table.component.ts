import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentDTO } from 'src/app/DTOs/paymentDTO';
import { FilterDTO, PaymentInvoiceItemDTO } from 'src/app/DTOs/dtoIndex';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-payment-table',
  templateUrl: './payment-table.component.html',
  encapsulation: ViewEncapsulation.None // Disable view encapsulation
})
export class PaymentTableComponent implements OnInit {
  payments: PaymentDTO[] = [];
  isActive: boolean = true;
  isInactive: boolean = false;
  filterDTO: FilterDTO = new FilterDTO();
  selectedFromDate = new Date();
  selectedToDate = new Date();
  private snackbarService: SnackbarService;
  selectedPaymentToReverse: PaymentDTO = new PaymentDTO();
  paymentInvoiceItemDTO: PaymentInvoiceItemDTO[] = []
  displayedColumns: string[] = [
    'paymentDate',
    'bookNumber',
    'accountName',
    'amount',
    'action'
  ];

  dataSource = new MatTableDataSource<PaymentDTO>(this.payments);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.selectedFromDate = new Date();
    this.selectedToDate = new Date();
    this.initializeFilterDates();
 
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'paymentDate':
          return new Date(item.paymentDate).getTime(); // Sorting by date timestamp
        case 'bookNumber':
          return item.bookNumber.toLowerCase();
        case 'accountName':
          return item.accountName.toLowerCase();
        case 'amount':
          return item.amount;
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

    // Optional: Automatically load payment data after initializing dates
    this.loadPaymentData();
  }
  loadPaymentData(): void {
    this.filterDTO.fromDate = this.selectedFromDate.toISOString();
    this.filterDTO.toDate = this.selectedToDate.toISOString();
    this.filterDTO.booleanFilterValue = this.isActive ? true:false;
    this.paymentService.getPayments(this.filterDTO).subscribe({
      next: (response: any) => {
        this.payments = response.data.paymentDTOs || [];
        this.dataSource.data = this.payments;
        console.log(this.payments);
      },
      error: (error: any) => {
        console.error('There was an error fetching payments!', error);
      }
    });
  }
  onCheckboxChange(changedCheckbox: string) {
    if (changedCheckbox === 'active') {
      if (this.isActive) {
        this.isInactive = false; // Uncheck Inactive if Active is checked
      }
    } else if (changedCheckbox === 'inactive') {
      if (this.isInactive) {
        this.isActive = false; // Uncheck Active if Inactive is checked
      }
    }

    // Call the method to load payment data based on the current selection
    this.loadPaymentData();
  }

  reversePayment(obj: any) {
    this.selectedPaymentToReverse.accountName = obj.accountId,
      this.selectedPaymentToReverse.amount = obj.amount,
      this.selectedPaymentToReverse.amountOfRemainingCredit = obj.amountOfRemainingCredit,
      this.selectedPaymentToReverse.bookNumber = obj.bookNumber,
      this.selectedPaymentToReverse.buildingAccountId = obj.buildingAccountId,
      this.selectedPaymentToReverse.dateCreated = obj.dateCreated,
      this.selectedPaymentToReverse.dateDeleted = obj.dateDeleted,
      this.selectedPaymentToReverse.dateLastUpdated = obj.dateLastUpdated,
      this.selectedPaymentToReverse.guid = obj.guid,
      this.selectedPaymentToReverse.id = obj.id,
      this.selectedPaymentToReverse.isActive = obj.isActive,
      this.selectedPaymentToReverse.outstandingAmount = obj.outstandingAmount,
      this.selectedPaymentToReverse.paymentAmount = obj.paymentAmount,
      this.selectedPaymentToReverse.paymentDate = obj.paymentDate,
      this.selectedPaymentToReverse.paymentMethod = obj.paymentMethod
    console.log(this.selectedPaymentToReverse);
    this.getPaymentInvoiceItems();

    this.selectedPaymentToReverse.InvoicesPayed = this.paymentInvoiceItemDTO;


    this.paymentService.reversePayment(this.selectedPaymentToReverse).subscribe(response => {
      if (response.success) {
        this.snackbarService.openSnackBar("Reversed payment successfully", "dismiss");
      } else {
        this.snackbarService.openSnackBar("Payment could not be reversed!", "dismiss");
      }
    });
  }
  getPaymentInvoiceItems() {
    this.paymentService.getPaymentInvoiceItems(this.selectedPaymentToReverse.buildingAccountId.toString()).subscribe(response => {
      if (response.success) {
        this.paymentInvoiceItemDTO = response.data?.paymentInvoiceItemDTOs ?? [];
      }
    })
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
  filter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
