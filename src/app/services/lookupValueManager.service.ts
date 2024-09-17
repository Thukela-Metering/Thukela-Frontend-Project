import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { tap, map } from "rxjs/operators";
import { BuildingOwnerDTO, LookupValueDTO, OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
  providedIn: 'root'
})
export class LookupValueManagerService {
    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://thukelameteringproduction.co.za/api';

  private lookupValues: LookupValueDTO[] = []; // Cache for lookup values
  private lookupValuesLoaded = false; // Flag to check if values are loaded

  constructor(private http: HttpClient) {
    this.loadLookupValuesFromSession(); // Load lookup values from sessionStorage at service initialization
  }

  // Load lookup values from sessionStorage if available
  private loadLookupValuesFromSession(): void {
    const storedValues = sessionStorage.getItem('lookupValues');
    if (storedValues) {
      this.lookupValues = JSON.parse(storedValues);
      this.lookupValuesLoaded = true; // Mark as loaded since we have values in sessionStorage
    }
  }

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

  // Fetch lookup values if not already loaded
  getAllLookupValues(): Observable<OperationalResultDTO<TransactionDTO>> {
    if (this.lookupValuesLoaded && this.lookupValues.length > 0) {
      return of({
        success: true,
        data: { lookupValueDTOs: this.lookupValues }
      } as OperationalResultDTO<TransactionDTO>); // Return cached values
    }

    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager/GetAllLookups`)
      .pipe(
        tap(response => {
          if (response.success && response.data?.lookupValueDTOs) {
            this.lookupValues = response.data.lookupValueDTOs;
            this.lookupValuesLoaded = true;
            sessionStorage.setItem('lookupValues', JSON.stringify(this.lookupValues)); // Save to sessionStorage
          }
        })
      );
  }

  // Get description for a specific ID
  getDescriptionById(id: number): string | undefined {
    if (!this.lookupValuesLoaded) {
      this.loadLookupValuesFromSession(); // Ensure values are loaded from session if available
    }
    const lookup = this.lookupValues.find(lv => lv.id === id);
    return lookup ? lookup.description : undefined;
  }

  // Clear cached data on logout
  clearLookupCache(): void {
    this.lookupValues = [];
    this.lookupValuesLoaded = false;
    sessionStorage.removeItem('lookupValues'); // Clear sessionStorage on logout
  }
  // Get all lists
  getAllLists(): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager/GetAllLists`);
  }

  // Get all groups
  getAllGroups(): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/LookupValueManager/GetAllGroups`);
  }
}
