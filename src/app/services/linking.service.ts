import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingDTO } from "../DTOs/buildingDTO";
import { BuildingRepresentativeLinkDTO } from "../DTOs/buildingRepLinkDTO";

@Injectable({
    providedIn: 'root'
  })
  export class BuildingLinkingService {
    constructor(private http: HttpClient) { }
    private apiUrl = 'http://localhost:80/api';

    addNewBuildingLinkToRepresentative(buildingToSave:BuildingRepresentativeLinkDTO):Observable<any>{{
        var getResponse = this.http.post(`${this.apiUrl}/Linking`,buildingToSave);      
        return getResponse;
    }
  }
}