import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface OperationalResultDTO<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  //private apiUrl = 'http://localhost:8080/api'; // Update with your actual API URL
  private apiUrl = 'https://1ed5a077899b845a.p61.rt3.io/api';

  constructor(private http: HttpClient) {}

  importData(formData: FormData): Observable<OperationalResultDTO<boolean>> {
    var getResponse = this.http.post<OperationalResultDTO<boolean>>(`${this.apiUrl}/DataImport/Import`, formData);
    return getResponse;
}
}
