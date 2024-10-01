import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterDTO, OperationalResultDTO, PaymentInvoiceItemDTO, TransactionDTO } from '../DTOs/dtoIndex';
import { PaymentDTO } from '../DTOs/paymentDTO';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) { }

    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://b30615ba44f55a1e.p60.rt3.io/api';

  getPayments(filterDTO: FilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {   
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Payment/GetPayments`, filterDTO); 
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

  reversePayment(payment: PaymentDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Payment/ReversePayment`, payment);
    return getResponse;
  }
}
