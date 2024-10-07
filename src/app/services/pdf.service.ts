import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PdfDTO } from '../DTOs/pdfDTO';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
    //private apiUrl = 'http://localhost:8080/api';
    private apiUrl = 'https://thukelameteringproduction.co.za/api';

  constructor(private http: HttpClient) { }

  generateInvoicePdf(pdfDto: PdfDTO): Observable<Blob> {
    var response = this.http.post(`${this.apiUrl}/pdf/invoice`, pdfDto, { responseType: 'blob' });
    return response;
  }

  generateCreditNotePdf(pdfDto: PdfDTO): Observable<Blob> {
    var response = this.http.post(`${this.apiUrl}/pdf/CreditNote`, pdfDto, { responseType: 'blob' });
    return response;
  }

  generateStatementPdf(pdfDto: PdfDTO): Observable<Blob> {
    var response = this.http.post(`${this.apiUrl}/pdf/Statement`, pdfDto, { responseType: 'blob' });
    return response;
  }

  generateQuotePdf(pdfDto: PdfDTO): Observable<Blob> {
    var response = this.http.post(`${this.apiUrl}/pdf/Quote`, pdfDto, { responseType: 'blob' });
    return response;
  }

  generateJobCardPdf(pdfDto: PdfDTO): Observable<Blob> {
    var response = this.http.post(`${this.apiUrl}/pdf/JobCard`, pdfDto, { responseType: 'blob' });
    return response;
  }

  generateDebitorsReportPdf(pdfDto: PdfDTO): Observable<Blob> {
    var response = this.http.post(`${this.apiUrl}/pdf/DebitorsReport`, pdfDto, { responseType: 'blob' });
    return response;
  }

}
