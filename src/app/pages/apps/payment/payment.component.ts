import { Component, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PaymentDTO } from 'src/app/DTOs/paymentDTO';
import { BuildingAccountDTO, PaymentInvoiceItemDTO } from 'src/app/DTOs/dtoIndex';
import { BuildingAccountService } from 'src/app/services/building-account.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  encapsulation: ViewEncapsulation.None // Disable view encapsulation
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
  appliedCredits: Map<string, number> = new Map(); // Track applied credits

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private paymentService: PaymentService,
    private buildingAccountService: BuildingAccountService,
    private snackbarService: SnackbarService,
    private cdRef: ChangeDetectorRef
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
      this.dataSource.paginator = this.paginator; // Initialize paginator with the data source
      console.log(this.invoices);
    });
  }

  fetchAccountDTO(): void {
    this.buildingAccountService.getBuildingAccountById(Number(this.accountId)).subscribe({
      next: (data) => {
        this.accountDTO = data.data?.buildingAccountDTOs![0] ?? new BuildingAccountDTO();
        if (!this.accountDTO.isInCredit) {
          this.accountDTO.accountRunningBalance = this.accountDTO.accountRunningBalance! * -1;
        }
        console.log(data.data?.buildingAccountDTOs![0]);

        if (this.accountDTO.isInCredit) {
          this.displayedColumns.unshift('select'); // Add the select column
        }

        this.cdRef.detectChanges(); // Trigger change detection
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
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

  distributeCredit(invoice: PaymentInvoiceItemDTO): void {
    const previouslyAppliedCredit = this.appliedCredits.get(invoice.id) || 0;
    let remainingCredit = this.accountDTO.accountRunningBalance! + previouslyAppliedCredit;

    if (invoice.isSelected) {
      const outstandingAmount = invoice.outstandingAmount! - invoice.paymentAmount!;
      let creditToApply = Math.min(outstandingAmount, remainingCredit);

      invoice.paymentAmount! += creditToApply;
      remainingCredit -= creditToApply;
      this.appliedCredits.set(invoice.id, creditToApply);
    } else {
      remainingCredit = this.accountDTO.accountRunningBalance! + previouslyAppliedCredit;
      invoice.paymentAmount! -= previouslyAppliedCredit;
      this.appliedCredits.delete(invoice.id);
    }

    this.accountDTO.accountRunningBalance = remainingCredit;
    this.dataSource.data = [...this.invoices]; // Trigger change detection
    this.cdRef.detectChanges();
  }


  async savePayments(): Promise<void> {
    try {
      var paymentRemainder = this.customAmount;
      var newPaymentDTOToSave = new PaymentDTO();
      for (const invoice of this.invoices) {
        if (invoice.paymentAmount! > 0) {
          const outstandingAmount = invoice.outstandingAmount! - (invoice.paymentAmount || 0);
          paymentRemainder -= invoice.paymentAmount!;
          invoice.outstandingAmount = outstandingAmount;
          newPaymentDTOToSave.InvoicesPayed?.push(invoice)
        }
      }
     // newPaymentDTOToSave.outstandingAmount = paymentRemainder;
      newPaymentDTOToSave.paymentDate = this.selectedPaymentDate;
      newPaymentDTOToSave.amount = this.customAmount || 0;
      newPaymentDTOToSave.buildingAccountId = parseInt(this.accountId);
      newPaymentDTOToSave.isActive = true;
      const response = await this.paymentService.createPayment(newPaymentDTOToSave).toPromise();

      if (!response!.success) {
        throw new Error(response!.message);
      }

      console.log("This is the payment amount remaining : ");
      console.log(paymentRemainder);
      this.snackbarService.openSnackBar('Payments saved successfully', "dismiss", 3000);
      this.fetchInvoices(this.accountId);
    } catch (error) {
      console.error('Error saving payments:', error);
      this.snackbarService.openSnackBar('Error saving payments', "dismiss", 3000);
    }
  }

  submit() {
    this.buildingAccountService.updateBuildingAccount(this.accountDTO).subscribe({
      next: (data) => {
        if (!data.success) {
          this.snackbarService.openSnackBar('Error saving data. Redo the process or contact support', "dismiss", 5000);
        } else {
          console.log("building account updated. Result:");
          console.log(data);
          this.snackbarService.openSnackBar('Building account updated! saving payments', "dismiss", 3000);
          this.savePayments();
        }
      },
      error: (error) => {
        console.error('Error saving payments:', error);
        this.snackbarService.openSnackBar('Error updating building account', "dismiss", 3000);
      }
    })
  }
}
