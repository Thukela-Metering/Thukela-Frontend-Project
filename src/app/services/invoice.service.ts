import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO } from '../DTOs/operationalResultDTO';
import { TransactionDTO } from '../DTOs/transactionDTO';
import { FilterDTO, InvoiceDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }


  private apiUrl = 'http://localhost:8080/api'; // Replace with your API URL
  //private apiUrl = 'https://thukelameteringproduction.co.za/api';
  
  getAllInvoices(filterDTO: FilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {     
      var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice/GetAllInvoices`, filterDTO);
      return getResponse;
    }
  }

  getRecurringInvoices(sendDate: Date): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      const params = new HttpParams().set('sendDate', sendDate.toDateString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice/Recurring`, { params });
      return getResponse;
    }
  }

  getInvoiceByGuid(guid: string): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Invoice/${guid}`);
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
    var getResponse = this.http.get<OperationalResultDTO<string>>(`${this.apiUrl}/Invoice/Reference/`, { params });
    return getResponse;
  }
}