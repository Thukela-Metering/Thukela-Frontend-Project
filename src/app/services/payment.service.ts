import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO, TransactionDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) { }
  // private apiUrl = 'http://localhost:80/api';
  private apiUrl = 'https://thukelanewbackendtesting.co.za/api';

  getAllPayments(isActive:boolean):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      const params = new HttpParams().set('isactive', isActive.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount`, {params});
      return getResponse;
    }
  }
getPaymentInvoiceItems(accountId: string): Observable<OperationalResultDTO<TransactionDTO>> {
  return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Payment/getInvoiceItemsForPayment?accountId=${accountId}`);
}

  
}
