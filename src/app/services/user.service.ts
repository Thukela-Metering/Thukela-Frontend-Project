import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonDTO } from '../DTOs/personDTO';
import { UserDataDTO } from '../DTOs/userDataDTO';
import { OperationalResultDTO, TransactionDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // private apiUrl = 'http://localhost:8080/api';
 private apiUrl = 'https://thukelameteringproduction.co.za/api';

  constructor(private http: HttpClient) { }
//credentials: { username: string, password: string }
  getAllPersons(): Observable<any> {
    {
      var getResponse = this.http.get(`${this.apiUrl}/Person`);      
      return getResponse;
    }
  }
  getUserDataList(isactive:boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      const params = new HttpParams().set('isactive', isactive.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/getUserListData`,{ params });      
      return getResponse;
    }
  }
  getUserDataEmployeeList(isactive:boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      const params = new HttpParams().set('isactive', isactive.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/getEmployeeUserListData`,{ params });      
      return getResponse;
    }
  }
  updatePersonData(personData:PersonDTO): Observable<OperationalResultDTO<TransactionDTO>>{
    var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/${personData.id}`,personData)
    return response;
  }
  updateUserData(personData:UserDataDTO): Observable<OperationalResultDTO<TransactionDTO>>{
    var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/updateUserData/${personData.guid}`,personData)
    return response;
  }
  getUserById(userId:string){
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/${userId}`);      
    return getResponse;
  }
  getPersonSystemUserDetail(userId:string): Observable<OperationalResultDTO<TransactionDTO>>{
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/getSysUser/${userId}`);      
    return getResponse;
  }
  deleteUser(personData:PersonDTO): Observable<OperationalResultDTO<TransactionDTO>>{
    var response = this.http.delete<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/delete/${personData.id}`)
    return response;
  }
  deleteUserData(userDataDTO:UserDataDTO):Observable<OperationalResultDTO<TransactionDTO>>
  {
    var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Person/userData/delete`,userDataDTO)
    return response;
  }
  
}
