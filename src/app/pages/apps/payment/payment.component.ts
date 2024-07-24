import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PaymentDTO } from 'src/app/DTOs/paymentDTO';
import { BuildingAccountDTO, PaymentInvoiceItemDTO } from 'src/app/DTOs/dtoIndex';
import { BuildingAccountService } from 'src/app/services/building-account.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  accountId: string;
  invoices: PaymentInvoiceItemDTO[] = [];
  payment: PaymentDTO = new PaymentDTO();
  accountDTO: BuildingAccountDTO = new BuildingAccountDTO();
  selectedPaymentDate: Date = new Date();
  dataSource = new MatTableDataSource<PaymentInvoiceItemDTO>();
  displayedColumns: string[] = ['id', 'invoiceReference', 'invoiceAmount', 'amountAlreadyPaid', 'invoiceNumber', 'invoiceDate', 'outstandingAmount', 'paymentAmount'];
  customAmount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private paymentService: PaymentService,
    private buildingAccountService: BuildingAccountService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.accountId = params['id'];
      this.fetchInvoices(this.accountId);
      this.fetchAccountDTO();
    });
  }

  fetchInvoices(accountId: string): void {
    this.paymentService.getPaymentInvoiceItems(accountId).subscribe(data => {
      this.invoices = data.data?.paymentInvoiceItemDTOs ?? [];
      this.calculateOutstandingAmounts();
      this.dataSource.data = this.invoices;
      console.log(this.invoices);
    });
  }
  fetchAccountDTO(): void {
    this.buildingAccountService.getBuildingAccountById(Number(this.accountId)).subscribe({
      next: (data) => {
        this.accountDTO = data.data?.buildingAccountDTOs![0] ?? new BuildingAccountDTO();
        !this.accountDTO.isInCredit ? this.accountDTO.accountRunningBalance = this.accountDTO.accountRunningBalance! * -1 : this.accountDTO.accountRunningBalance
        console.log(data.data?.buildingAccountDTOs![0])
      },
      error: (error) => {
        console.error('There was an error!', error);
      }

    }
    )
  }

  calculateOutstandingAmounts(): void {
    this.invoices.forEach(invoice => {
      const outstandingAmount = (invoice.invoiceAmount || 0) - (invoice.amountAlreadyPayed || 0);
      invoice.outstandingAmount = outstandingAmount < 0 ? 0 : outstandingAmount;
    });
  }

  distributeAmount(): void {
    let remainingAmount = this.customAmount;
    this.invoices.forEach(invoice => {
      const outstandingAmount = invoice.outstandingAmount;
      if (remainingAmount > 0) {
        if (remainingAmount >= outstandingAmount!) {
          invoice.paymentAmount = outstandingAmount;
          remainingAmount -= outstandingAmount!;
        } else {
          invoice.paymentAmount = remainingAmount;
          remainingAmount = 0;
        }
      } else {
        invoice.paymentAmount = 0;
      }
    });
    this.dataSource.data = this.invoices;
  }

  async savePayments(): Promise<void> {
    try {
      for (const invoice of this.invoices) {
        if (invoice.paymentAmount! > 0) {
          const outstandingAmount = invoice.outstandingAmount! - (invoice.paymentAmount || 0);
          const paymentDTO: PaymentDTO = {
            amount: invoice.paymentAmount || 0,
            paymentDate: this.selectedPaymentDate,
            paymentMethod: 1, // Assuming a default payment method, modify as needed
            invoiceReference: invoice.invoiceReference,
            invoiceId: parseInt(invoice.id),
            buildingAccountId: parseInt(this.accountId),
            isActive: true,
            outstandingAmount: outstandingAmount || 0
          };

          const response = await this.paymentService.createPayment(paymentDTO).toPromise();

          if (!response!.success) {
            throw new Error(response!.message);
          }
        }
      }

      this.snackbarService.openSnackBar('Payments saved successfully', "dismiss", 3000);
      this.fetchInvoices(this.accountId);
    } catch (error) {
      console.error('Error saving payments:', error);
      this.snackbarService.openSnackBar('Error saving payments', "dismiss", 3000);
    }
  }
}