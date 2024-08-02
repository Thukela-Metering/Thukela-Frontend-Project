import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO } from '../DTOs/operationalResultDTO';
import { TransactionDTO } from '../DTOs/transactionDTO';
import { InvoiceDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }

     private apiUrl = 'http://localhost:80/api';
    //private apiUrl = 'https://thukelanewbackendtesting.co.za/api';
  
    getAllInvoices(active:boolean):Observable<OperationalResultDTO<TransactionDTO>> {
      {
        const params = new HttpParams().set('isactive', active.toString());
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice`, { params });      
        return getResponse;
      }
    }

    getRecurringInvoices(sendDate: Date):Observable<OperationalResultDTO<TransactionDTO>> {
      {
        const params = new HttpParams().set('sendDate', sendDate.toDateString());
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice/Recurring`, { params });      
        return getResponse;
      }
    }

    getInvoiceByGuid(guid:string):Observable<OperationalResultDTO<TransactionDTO>> {
      {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice/${ guid }`);      
        return getResponse;
      }
    }

    createInvoice(invoiceData: TransactionDTO): Observable<OperationalResultDTO<TransactionDTO>> {
      var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice`, invoiceData);
      return getResponse;
    }
    
    updateInvoice(invoiceData: TransactionDTO): Observable<OperationalResultDTO<TransactionDTO>> {
      var getResponse = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice`, invoiceData);
      return getResponse;
    }

    getLastInvoiceReference(accountNumber: string): Observable<OperationalResultDTO<string>> {
      const params = new HttpParams().set('accountNum', accountNumber)
      var getResponse = this.http.get<OperationalResultDTO<string>>(`${this.apiUrl}/Invoice/Reference/`, {params});
      return getResponse;
    }
  }