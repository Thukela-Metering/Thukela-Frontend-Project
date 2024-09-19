import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO, StatementFilterDTO, TransactionDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class StatementService {
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8080/api'; // Replace with your API URL
  //private apiUrl = 'https://thukelameteringproduction.co.za/api';


  getByAccountId(filterDTO: StatementFilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByAccountId`, filterDTO);
  }

  getByAccountGuid(filterDTO: StatementFilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByAccountGuid`);
      return getResponse;
    }
  }
  getByOwnerId(filterDTO: StatementFilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByOwnerId`);
      return getResponse;
    }
  }
  getByOwnerGuid(filterDTO: StatementFilterDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Statement/GetByOwnerGuid`);
      return getResponse;
    }
  }
}