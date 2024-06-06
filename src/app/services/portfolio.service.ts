import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingDTO } from "../DTOs/buildingDTO";
import { OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
    providedIn: 'root'
  })
  export class PortfolioService {
    constructor(private http: HttpClient) { }

    private apiUrl = 'http://localhost:80/api';
  
    updateBuildingData(buildingData:BuildingDTO):Observable<OperationalResultDTO<TransactionDTO>>{
      var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building/${buildingData.id}`,buildingData)
      return response;
    }
    
    getPortfolioBuildingById(buildingId:number):Observable<OperationalResultDTO<TransactionDTO>>{
      var getResponse =  this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Portfolio/CompletePortfolio`, {
        params: {
          buildingId: buildingId
        }
      });      
      return getResponse;
    }
   
    deleteBuilding(BuildingData:BuildingDTO): Observable<OperationalResultDTO<TransactionDTO>>{
      var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building/delete/${BuildingData.id}`,BuildingData)
      return response;
    }
    
  }