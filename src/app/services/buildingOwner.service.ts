import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingOwnerDTO, OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
    providedIn: 'root'
})
export class BuildingOwnerService {
    constructor(private http: HttpClient) { }

    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://1ed5a077899b845a.p61.rt3.io/api';


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

    updateBuildingOwnerData(buildingData: BuildingOwnerDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount/${buildingData.id}`, buildingData)
        return response;
    }

    deleteBuildingOwner(BuildingData: BuildingOwnerDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount/delete/${BuildingData.id}`, BuildingData)
        return response;
    }

    getBuildingOwnerAccountByBuildingId(id: number, isActive: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
        const params = new HttpParams()
            .set('isActive', isActive.toString());

        return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/BuildingOwnerAccount/${id}`, { params });
    }
}
