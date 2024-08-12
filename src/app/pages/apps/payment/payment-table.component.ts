import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentDTO } from 'src/app/DTOs/paymentDTO';

@Component({
  selector: 'app-payment-table',
  templateUrl: './payment-table.component.html',
  encapsulation: ViewEncapsulation.None // Disable view encapsulation
})
export class PaymentTableComponent implements OnInit {
  payments: PaymentDTO[] = [];
  displayedColumns: string[] = [
    'paymentDate',
    'bookNumber',
    'accountName',
    'amount'
  ];

  dataSource = new MatTableDataSource<PaymentDTO>(this.payments);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPaymentData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'paymentDate':
          return new Date(item.paymentDate);
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

  loadPaymentData(): void {
    this.paymentService.getPayments().subscribe({
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

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
