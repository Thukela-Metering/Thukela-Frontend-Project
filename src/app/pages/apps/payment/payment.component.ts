import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionDTO } from 'src/app/DTOs/transactionDTO';
import { PaymentInvoiceItemDTO } from 'src/app/DTOs/dtoIndex';
import { PaymentService } from 'src/app/services/payment.service';



  @Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
  })
  export class PaymentComponent implements OnInit {
    accountId: string;
    invoices: PaymentInvoiceItemDTO[] = [];
    dataSource = new MatTableDataSource<PaymentInvoiceItemDTO>();
    displayedColumns: string[] = ['id', 'invoiceDate', 'invoiceAmount', 'amountAlreadyPaid', 'invoiceNumber', 'invoiceReference', 'paymentAmount'];
    customAmount: number = 0;
  
    constructor(private route: ActivatedRoute, private http: HttpClient,private paymentService: PaymentService,) {}
  
    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.accountId = params['id'];
        this.fetchInvoices(this.accountId);
      });
    }
  
    fetchInvoices(accountId: string): void {
this.paymentService.getPaymentInvoiceItems(accountId).subscribe(data => {
    this.invoices = data.data?.PaymentInvoiceItemDTOs ?? [];
    this.dataSource.data = this.invoices;
  });
    //   this.http.get<TransactionDTO>(`/api/invoices/${accountId}`).subscribe(data => {
    //     this.invoices = data.PaymentInvoiceItemDTOs ?? [];
    //     this.dataSource.data = this.invoices;
    //   });

      console.log(this.invoices);
    }
  
    distributeAmount(): void {
      let remainingAmount = this.customAmount;
      this.invoices.forEach(invoice => {
        const outstandingAmount = invoice.invoiceAmount - invoice.amountAlreadyPaid;
        if (remainingAmount > 0) {
          if (remainingAmount >= outstandingAmount) {
            invoice.paymentAmount = outstandingAmount;
            remainingAmount -= outstandingAmount;
          } else {
            invoice.paymentAmount = remainingAmount;
            remainingAmount = 0;
          }
        } else {
          invoice.paymentAmount = 0;
        }
      });
      this.dataSource.data = this.invoices; // Update data source
    }
  
    savePayments(): void {
      const payments = this.invoices.map(invoice => ({
        invoiceId: invoice.id,
        paymentAmount: invoice.paymentAmount || 0
      }));
  
      this.http.post('/api/payments', payments).subscribe(response => {
        console.log('Payments saved successfully');
      });
    }
  }