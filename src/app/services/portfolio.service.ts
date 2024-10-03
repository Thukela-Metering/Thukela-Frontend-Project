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
    
    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://6k2nti3up32q.connect.remote.it/api';

    updateBuildingData(buildingData: BuildingDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building/${buildingData.id}`, buildingData);
        return response;
    }

    getPortfolioBuildingById(buildingId: number): Observable<OperationalResultDTO<TransactionDTO>> {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Portfolio/CompletePortfolio`, {
            params: {
                buildingId: buildingId
            }
        });
        return getResponse;
    }

    deleteBuilding(BuildingData: BuildingDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building/delete/${BuildingData.id}`, BuildingData);
        return response;
    }

    getBuildingOwnerAccountById(id: number, isActive: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
        const params = new HttpParams()
            .set('isActive', isActive.toString());

        return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount/${id}`, { params });
    }
}
