import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingDTO } from "../DTOs/buildingDTO";
import { BuildingRepresentativeLinkDTO } from "../DTOs/buildingRepLinkDTO";
import { OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
    providedIn: 'root'
  })
  export class BuildingLinkingService {
    constructor(private http: HttpClient) { }
   // private apiUrl = 'http://localhost:80/api';
    private apiUrl = 'https://thukelanewbackendtesting.co.za/api';

    addNewBuildingLinkToRepresentative(buildingToSave:BuildingRepresentativeLinkDTO):Observable<OperationalResultDTO<TransactionDTO>>{{
        var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Linking`,buildingToSave);      
        return getResponse;
    }
  }
}