import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingDTO } from "../DTOs/buildingDTO";

@Injectable({
    providedIn: 'root'
  })
  export class BuildingService {
    constructor(private http: HttpClient) { }

    private apiUrl = 'http://localhost:80/api';
  
    getAllBuildings(active:boolean): Observable<any> {
      {
        const params = new HttpParams().set('isactive', active.toString());
        var getResponse = this.http.get(`${this.apiUrl}/Building`, { params });      
        return getResponse;
      }
    }
    addNewBuilding(buildingToSave:BuildingDTO):Observable<any>{{
        var getResponse = this.http.post(`${this.apiUrl}/Building`,buildingToSave);      
        return getResponse;
    }
}
    updateBuildingData(buildingData:BuildingDTO): Observable<any>{
      var response = this.http.put(`${this.apiUrl}/Building/${buildingData.id}`,buildingData)
      return response;
    }
    
    getBuildingById(buildingId:string){
      var getResponse = this.http.get(`${this.apiUrl}/Building/${buildingId}`);      
      return getResponse;
    }
   
    deleteBuilding(BuildingData:BuildingDTO): Observable<any>{
      var response = this.http.put(`${this.apiUrl}/Building/delete/${BuildingData.id}`,BuildingData)
      return response;
    }
    
  }