import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonDTO } from '../DTOs/userDto';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:80/api';
  constructor(private http: HttpClient) { }
//credentials: { username: string, password: string }
  

  getUserRoleByUserId(id:string){
    var getResponse = this.http.get(`${this.apiUrl}/Roles/GetUserRoleWithUserId/${id}`);      
    return getResponse;
  }
  
}
