import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class CreditNoteService {

   private apiUrl = 'http://localhost:8080/api';
  //private apiUrl = 'https://thukelanewbackendtesting.co.za/api';
  constructor(private http: HttpClient) { }

  getAllCreditNotes(isActive: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/creditNote?isActive=${isActive}`);
    return getResponse;
  }

  getCreditNoteByGuid(guid: string): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/CreditNote/${guid}`);
    return getResponse;
  }

  createCreditNote(transactionDto: TransactionDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/CreditNote`, transactionDto);
    return getResponse;
  }

  deleteCreditNote(transactionDto: TransactionDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: transactionDto
    };
    var getResponse = this.http.delete<OperationalResultDTO<TransactionDTO>>(this.apiUrl, httpOptions);
    return getResponse;
  }
}
