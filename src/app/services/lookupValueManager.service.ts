import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingOwnerDTO, LookupValueDTO, OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
    providedIn: 'root'
})
export class LookupValueManagerService {
    constructor(private http: HttpClient) { }

    private apiUrl = 'http://localhost:8080/api';

 // private apiUrl = 'https://thukelameteringproduction.co.za/api';

    addNewLookupValue(lookupValueToSave: LookupValueDTO): Observable<OperationalResultDTO<TransactionDTO>> 
        {
            var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager`, lookupValueToSave);
            return getResponse;
        }
      
    
    getLookupValueById(Id:number): Observable<OperationalResultDTO<TransactionDTO>>
    {
        var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager`, Id);
        return getResponse;
    }
    getLookupValueList(lookupGroupValue: string, lookupListValue: string): Observable<OperationalResultDTO<TransactionDTO>>
    {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager/GetSpecificListLookupValues`, {
            params: {
                lookupGroupValue: lookupGroupValue,
                lookupListValue: lookupListValue
            }
        });
        return getResponse;
    }
    getAllLists(): Observable<OperationalResultDTO<TransactionDTO>>
    {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager/GetAllLists`);
        return getResponse;
    }
    getAllGroups(): Observable<OperationalResultDTO<TransactionDTO>>
    {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager/GetAllGroups`);
        return getResponse;
    }
    
}