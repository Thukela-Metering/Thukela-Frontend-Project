import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO } from '../DTOs/operationalResultDTO';
import { TransactionDTO } from '../DTOs/transactionDTO';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }

    private apiUrl = 'http://localhost:80/api';
  
    // getAllInvoices(active:boolean):Observable<OperationalResultDTO<TransactionDTO>> {
    //   {
    //     const params = new HttpParams().set('isactive', active.toString());
    //     var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoices`, { params });      
    //     return getResponse;
    //   }
    // }
  }