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
  private apiUrl = 'http://localhost:80/api';

  getAllBuildingAccounts():Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount`);
      return getResponse;
    }
  }
  getBuildingAccountById(buildingAccountId:string):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount/${buildingAccountId}`);
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
      var getResponse = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount`, buildingAccountData);
      return getResponse;
    }
  }
  deleteBuildingAccount(buildingAccountData:BuildingAccountDTO):Observable<OperationalResultDTO<TransactionDTO>>{
    {
      var getResponse = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingAccount/Delete`,buildingAccountData);
      return getResponse;
    }
  }
}
