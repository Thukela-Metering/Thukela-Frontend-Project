import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonDTO } from '../DTOs/personDTO';
import { OperationalResultDTO, TransactionDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  //private apiUrl = 'http://localhost:8080/api';
  private apiUrl = 'https://thukelameteringproduction.co.za/api';

  constructor(private http: HttpClient) { }
  //credentials: { username: string, password: string }


  getUserRoleByUserId(id: string): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Roles/GetUserRoleWithUserId/${id}`);
    return getResponse;
  }

}
