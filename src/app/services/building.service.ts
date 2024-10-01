import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingDTO } from "../DTOs/buildingDTO";
import { OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  constructor(private http: HttpClient) { }

    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://1ed5a077899b845a.p61.rt3.io/api';

  getAllBuildings(active: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      const params = new HttpParams().set('isactive', active.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building`, { params });
      return getResponse;
    }
  }
  addNewBuilding(buildingToSave: BuildingDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building`, buildingToSave);
      return getResponse;
    }
  }
  updateBuildingData(buildingData: BuildingDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building/${buildingData.id}`, buildingData)
    return response;
  }

  getBuildingById(buildingId: string): Observable<OperationalResultDTO<TransactionDTO>> {
    var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building/${buildingId}`);
    return getResponse;
  }

  deleteBuilding(BuildingData: BuildingDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Building/delete/${BuildingData.id}`, BuildingData)
    return response;
  }

}