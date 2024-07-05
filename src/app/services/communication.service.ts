import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO } from '../DTOs/operationalResultDTO';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private apiUrl = 'http://localhost:80/api'; 

  constructor(private http: HttpClient) { }

  sendEmail(payload: FormData): Observable<OperationalResultDTO<any>> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    console.log('Sending email with headers:', headers);

    // Manually log FormData entries
    for (const pair of (payload as any).entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    return this.http.post<OperationalResultDTO<any>>(`${this.apiUrl}/Communication/Email`, payload, { headers });
  }
}

