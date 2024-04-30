import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonDTO } from '../DTOs/userDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:80/api';
  constructor(private http: HttpClient) { }
//credentials: { username: string, password: string }
  getAllUsers(): Observable<any> {
    {
      var getResponse = this.http.get(`${this.apiUrl}/Person`);      
      return getResponse;
    }
  }
  updateUserData(personData:PersonDTO): Observable<any>{
    var response = this.http.put(`${this.apiUrl}/Person/${personData.id}`,personData)
    return response;
  }
  getUserById(userId:string){
    var getResponse = this.http.get(`${this.apiUrl}/Person/${userId}`);      
    return getResponse;
  }
  deleteUser(personData:PersonDTO): Observable<any>{
    var response = this.http.delete(`${this.apiUrl}/Person/${personData.id}`)
    return response;
  }
  
}
