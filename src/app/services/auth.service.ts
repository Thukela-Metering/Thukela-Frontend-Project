import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDataDTO } from '../DTOs/userDataDTO';
import { LookupGroupDTO } from '../DTOs/lookupGroupDTO';
import { LookupListDTO } from '../DTOs/lookupListDTO';
import { LookupValueDTO } from '../DTOs/lookupValueDTO';
import { userLoginDTO } from '../DTOs/userLoginDTO';
import { OperationalResultDTO, TransactionDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isauthenticated: boolean = false;


  //private apiUrl = 'http://localhost:8080/api'; // Replace with your API URL


  private apiUrl = 'https://thukelameteringproduction.co.za/api';
 // private apiUrl = 'https://thukelanewbackendtesting.co.za/api'; // Replace with your API URL


  constructor(private http: HttpClient) { }

  login(credentials: userLoginDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signout`, {});
  }

  checkIfIsLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    this.isauthenticated = token !== null && token !== '';
    return this.isauthenticated;
  }

  register(userData: UserDataDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Auth/register`, userData);
  }

  getLookupValues(): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Roles`);
  }

  getGroupLookups(): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Roles/Groups`);
  }

  getListLookups(): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Roles/Lists`);
  }

  saveNewGroup(dataToSave: LookupGroupDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Roles/SaveNewGroup`, dataToSave);
  }

  saveNewList(dataToSave: LookupListDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Roles/SaveNewList`, dataToSave);
  }

  saveNewLookupValue(dataToSave: LookupValueDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Roles/SaveLookupValue`, dataToSave);
  }
}
