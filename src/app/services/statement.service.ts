import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO, FilterDTO, TransactionDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class StatementService {
  constructor(private http: HttpClient) { }

    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://6k2nti3up32q.connect.remote.it/api';


  getByAccountId(filterDTO: FilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByAccountId`, filterDTO);
  }

  getByAccountGuid(filterDTO: FilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByAccountGuid`);
      return getResponse;
    }
  }
  getByOwnerId(filterDTO: FilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByOwnerId`);
      return getResponse;
    }
  }
  getByOwnerGuid(filterDTO: FilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByOwnerGuid`);
      return getResponse;
    }
  }
}