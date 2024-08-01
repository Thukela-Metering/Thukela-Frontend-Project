import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PdfDTO } from '../DTOs/pdfDTO';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiUrl = 'http://localhost:80/api'; 

  constructor(private http: HttpClient) { }

  generateInvoicePdf(pdfDto: PdfDTO): Observable<Blob> {
    var resposne = this.http.post(`${this.apiUrl}/pdf/invoice`, pdfDto, { responseType: 'blob' });
    return resposne;
  }

  generateCreditNotePdf(pdfDto: PdfDTO): Observable<Blob> {
    var resposne = this.http.post(`${this.apiUrl}/pdf/CreditNote`, pdfDto, { responseType: 'blob' });
    return resposne;
  }
}
