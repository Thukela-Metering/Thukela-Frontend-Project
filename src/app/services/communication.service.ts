import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO } from '../DTOs/operationalResultDTO';
import { PdfDTO } from '../DTOs/pdfDTO';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
   private apiUrl = 'http://localhost:80/api'; 
  //private apiUrl = 'https://thukelanewbackendtesting.co.za/api';
  constructor(private http: HttpClient) { }

  sendEmail(pdfDto: PdfDTO, emailData: any, templateNum: number): Observable<OperationalResultDTO<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Sending email with headers:', headers);

    const url = `${this.apiUrl}/Communication/Email?emailData=${encodeURIComponent(emailData)}&templateNum=${templateNum}`;

    return this.http.post<OperationalResultDTO<any>>(url, pdfDto, { headers });
  }

  sendEmailWithBlob(formData: FormData, templateNum: number): Observable<OperationalResultDTO<any>> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    console.log('Sending email with headers:', headers);

    // Manually log FormData entries
    for (const pair of (formData as any).entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    formData.append('templateNum', templateNum.toString());

    return this.http.post<OperationalResultDTO<any>>(`${this.apiUrl}/Communication/EmailWithBlob`, formData, { headers });
  }
}
