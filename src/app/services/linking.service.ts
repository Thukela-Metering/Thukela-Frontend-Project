import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingRepresentativeLinkDTO } from "../DTOs/buildingRepLinkDTO";
import { OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
  providedIn: 'root'
})
export class BuildingLinkingService {
  constructor(private http: HttpClient) { }

    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://311c9a10eacd09a8.p61.rt3.io/api';

  addNewBuildingLinkToRepresentative(buildingToSave: BuildingRepresentativeLinkDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Linking`, buildingToSave);
      return getResponse;
    }
  }
  getAllBuildingRepresentativeLinks(activeLinks: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    {
      const params = new HttpParams().set('isactive', activeLinks.toString());
      var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Linking`, { params });
      return getResponse;
    }
  }
  checkIfBuildingHasRepresentative(buildingId: number): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Linking/BuildingLink/${buildingId}`);
  }
  updateBuildingRepresentativeLink(linkDTO: BuildingRepresentativeLinkDTO): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Linking`, linkDTO);
  }

}