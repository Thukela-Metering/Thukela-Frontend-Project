import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BuildingAccountSearchResultDTO, ProductDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://e1d7091f2954de03.p61.rt3.io/api';

  constructor(private http: HttpClient) {}

  searchBuildingAccount(query: string): Observable<BuildingAccountSearchResultDTO[]> {
    return this.http.get<BuildingAccountSearchResultDTO[]>(`${this.apiUrl}/Filter/search?query=${query}`);
  }

  searchProduct(query: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.apiUrl}/Filter/searchProduct?query=${query}`);
  }
}