import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO } from '../DTOs/operationalResultDTO';
import { TransactionDTO } from '../DTOs/transactionDTO';
import { BuildingAccountDTO } from '../DTOs/BuildingAccountDTO';

@Injectable({
  providedIn: 'root'
})
export class BuildingAccountService {
  constructor(private http: HttpClient) { }
   private apiUrl = 'http://localhost:8080/api';
  
 // private apiUrl = 'https://thukelameteringproduction.co.za/api';

  getAllBuildingAccounts(isActive:boolean):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      const params = new HttpParams().set('isactive', isActive.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount`, {params});
      return getResponse;
    }
  }
  getBuildingAccountByGuid(buildingAccountId:string):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount/${buildingAccountId}`);
      return getResponse;
    }
  }
  getBuildingAccountById(buildingAccountId:number):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount/id/${buildingAccountId}`);
      return getResponse;
    }
  }
  getBuildingAccountByBuildingId(buildingId:number):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount/Building/${buildingId}`);
      return getResponse;
    }
  }
  addNewBuildingAccount(buildingAccountToSave:BuildingAccountDTO):Observable<OperationalResultDTO<TransactionDTO>>{
    {
    var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount`,buildingAccountToSave);
    return getResponse;
    }
  }
  updateBuildingAccount(buildingAccountData:BuildingAccountDTO):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount/${buildingAccountData.id}`, buildingAccountData);
      return getResponse;
    }
  }
  deleteBuildingAccount(buildingAccountData:BuildingAccountDTO):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount/Delete/${buildingAccountData.id}`,buildingAccountData);
      return getResponse;
    }
  }
}
