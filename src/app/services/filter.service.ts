import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchResultDTO } from '../DTOs/dtoIndex';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
   private baseUrl = 'http://localhost:80/api'; ///api/Filter/search
  //private baseUrl = 'https://thukelanewbackendtesting.co.za/api';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResultDTO[]> {
    return this.http.get<SearchResultDTO[]>(`${this.baseUrl}/Filter/search?query=${query}`);
  }
}