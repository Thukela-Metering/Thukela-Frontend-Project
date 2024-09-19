import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { badDeptDTO, OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';

@Injectable({
    providedIn: 'root'
})
export class BadDeptService {

   // private apiUrl = 'http://localhost:8080/api';
 private apiUrl = 'https://thukelameteringproduction.co.za/api';
    constructor(private http: HttpClient) { }

    getAllBadDept(isActive: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BadDept/All?isActive=${isActive}`);
        return getResponse;
    }

    getbadDeptForAccount(int: number): Observable<OperationalResultDTO<TransactionDTO>> {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BadDept/${int}`);
        return getResponse;
    }

    createBadDept(badDept: badDeptDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BadDept/Create`, badDept);
        return getResponse;
    }
}
