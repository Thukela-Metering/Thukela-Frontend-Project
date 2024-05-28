import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingOwnerDTO, OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
    providedIn: 'root'
})
export class BuildingOwnerService {
    constructor(private http: HttpClient) { }

    private apiUrl = 'http://localhost:80/api';

    addNewBuildingOwner(buildingOwnerToSave: BuildingOwnerDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        {
            var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount`, buildingOwnerToSave);
            return getResponse;
        }
    }
    getAllBuildingOwners(): Observable<OperationalResultDTO<TransactionDTO>> {
        {
            var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount`);      
            return getResponse;
        }
    }
    updateBuildingOwnerData(buildingData:BuildingOwnerDTO):Observable<OperationalResultDTO<TransactionDTO>>{
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount/${buildingData.id}`,buildingData)
        return response;
      }
      
     
      deleteBuildingOwner(BuildingData:BuildingOwnerDTO): Observable<OperationalResultDTO<TransactionDTO>>{
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount/delete/${BuildingData.id}`,BuildingData)
        return response;
      }
}