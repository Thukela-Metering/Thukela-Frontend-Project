import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { OperationalResultDTO } from "../DTOs/operationalResultDTO";
import { TransactionDTO } from "../DTOs/transactionDTO";
import { QuotesDTO } from "../DTOs/QuotesDTO";
import { TempClientDTO } from "../DTOs/tempClientDTO";

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  constructor(private http: HttpClient) { }
  
  private apiUrl = 'http://localhost:8080/api'; // Replace with your API URL
  //private apiUrl = 'https://thukelameteringproduction.co.za/api';

  getAllQuotes(active: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      const params = new HttpParams().set('isactive', active.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Quotes`, { params });
      return getResponse;
    }
  }

  getQuoteByGuid(guid: string): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Quotes/${guid}`);
      return getResponse;
    }
  }

  createTempClient(TempClient: TransactionDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Quotes/TempClient`, TempClient);
    return getResponse;
  }

  createQuote(quote: TransactionDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Quotes`, quote);
    return getResponse;
  }

  getTempClientById(guid: string): Observable<OperationalResultDTO<TempClientDTO>> {
    var getResponse = this.http.get<OperationalResultDTO<TempClientDTO>>(`${this.apiUrl}/Quotes/TempClient/${guid}`);
    return getResponse;
  }

  updateQuote(transaction: TransactionDTO): Observable<OperationalResultDTO<any>> {
    var getResponse = this.http.put<OperationalResultDTO<any>>(`${this.apiUrl}/Quotes`, transaction);
    return getResponse;
  }

  updateQuoteToInvoiceStatus(transaction: TransactionDTO): Observable<OperationalResultDTO<any>> {
    var getResponse = this.http.put<OperationalResultDTO<any>>(`${this.apiUrl}/Quotes/UpdateToInvoiceStatus`, transaction);
    return getResponse;
  }

}