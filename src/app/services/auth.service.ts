import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { userRegistrationDTO } from '../DTOs/userRegistrationDTO';
import { LookupGroupDTO } from '../DTOs/lookupGroupDTO';
import { LookupListDTO } from '../DTOs/lookupListDTO';
import { LookupValueDTO } from '../DTOs/lookupValueDTO';
import { userLoginDTO } from '../DTOs/userLoginDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isauthenticated:boolean = false;
  private apiUrl = 'http://localhost:80/api'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  login(credentials: userLoginDTO): Observable<any> {
    var postResponse =this.http.post(`${this.apiUrl}/auth/login`, credentials);
    return postResponse;
  }
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signout`, {});
  }

  checkIfIsLoggedIn():boolean
  {
    var token = localStorage.getItem('token');
    if(token != null && token !='')
    {
      this.isauthenticated = true;
    }else
    {
      this.isauthenticated = false;    
    }
    return this.isauthenticated;
  }

  register(userData: userRegistrationDTO): Observable<any> {
    var postResponse =  this.http.post(`${this.apiUrl}/Auth/register`, userData);
    return postResponse;
  }
getLookupValues(): Observable<any> {
  var getResponse = this.http.get(`${this.apiUrl}/Roles`)
  return getResponse;
}
  getGroupLookups(): Observable<any> {
  var getResponse = this.http.get(`${this.apiUrl}/Roles/Groups`)
  return getResponse;
  }
  getListLookups(): Observable<any> {
    var getResponse = this.http.get(`${this.apiUrl}/Roles/Lists`)
  return getResponse;
  }
  saveNewGroup(dataToSave:LookupGroupDTO): Observable<any> {
    var saveResult = this.http.post(`${this.apiUrl}/Roles/SaveNewGroup`, dataToSave);
    return saveResult;
  }
  saveNewList(dataToSave:LookupListDTO): Observable<any> {
    var saveResult = this.http.post(`${this.apiUrl}/Roles/SaveNewList`, dataToSave);
    return saveResult;
  }

  saveNewLookupValue(dataToSave:LookupValueDTO): Observable<any> 
  {
    var saveResult = this.http.post(`${this.apiUrl}/Roles/SaveLookupValue`, dataToSave);
    return saveResult;
  }
}