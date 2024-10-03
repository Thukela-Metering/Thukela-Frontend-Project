import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilterDTO, OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class CreditNoteService {

    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://6k2nti3up32q.connect.remote.it/api';

  constructor(private http: HttpClient) { }

  getAllCreditNotes(filterDTO: FilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/creditNote/GetAllCreditNotes`,filterDTO);
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
