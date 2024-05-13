import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonDTO } from '../DTOs/personDTO';
import { UserDataDTO } from '../DTOs/userDataDTO';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:80/api';
  constructor(private http: HttpClient) { }
//credentials: { username: string, password: string }
  getAllPersons(): Observable<any> {
    {
      var getResponse = this.http.get(`${this.apiUrl}/Person`);      
      return getResponse;
    }
  }
  getUserDataList(isactive:boolean): Observable<any> {
    {
      const params = new HttpParams().set('isactive', isactive.toString());
      var getResponse = this.http.get(`${this.apiUrl}/Person/getUserListData`,{ params });      
      return getResponse;
    }
  }
  updatePersonData(personData:PersonDTO): Observable<any>{
    var response = this.http.put(`${this.apiUrl}/Person/${personData.id}`,personData)
    return response;
  }
  updateUserData(personData:UserDataDTO): Observable<any>{
    var response = this.http.put(`${this.apiUrl}/Person/updateUserData/${personData.id}`,personData)
    return response;
  }
  getUserById(userId:string){
    var getResponse = this.http.get(`${this.apiUrl}/Person/${userId}`);      
    return getResponse;
  }
  getPersonSystemUserDetail(userId:string): Observable<any>{
    var getResponse = this.http.get(`${this.apiUrl}/Person/getSysUser/${userId}`);      
    return getResponse;
  }
  deleteUser(personData:PersonDTO): Observable<any>{
    var response = this.http.delete(`${this.apiUrl}/Person/delete/${personData.id}`)
    return response;
  }
  deleteUserData(userDataDTO:UserDataDTO):Observable<any>
  {
    var response = this.http.put(`${this.apiUrl}/Person/userData/delete`,userDataDTO)
    return response;
  }
  
}
