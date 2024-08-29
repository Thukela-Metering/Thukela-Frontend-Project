import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchResultDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

 //  private baseUrl = 'http://localhost:8080/api'; ///api/Filter/search

  private apiUrl = 'https://thukelameteringproduction.co.za/api';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResultDTO[]> {
    return this.http.get<SearchResultDTO[]>(`${this.apiUrl}/Filter/search?query=${query}`);
  }
}