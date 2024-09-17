import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO, PaymentInvoiceItemDTO, TransactionDTO } from '../DTOs/dtoIndex';
import { PaymentDTO } from '../DTOs/paymentDTO';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8080/api';
  //private apiUrl = 'https://thukelameteringproduction.co.za/api';

  getAllPayments(isActive: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      const params = new HttpParams().set('isactive', isActive.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount`, { params });
      return getResponse;
    }
  }

  getPayments(): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Payment`);
    return getResponse;
  }

  getPaymentInvoiceItems(accountId: string): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Payment/getInvoiceItemsForPayment?accountId=${accountId}`);
    return getResponse;
  }

  createPayment(payment: PaymentDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Payment`, payment);
    return getResponse;
  }
}
