import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { OperationalResultDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  
  private apiUrl = 'http://localhost:8080/api'; // Replace with your API URL
  //private apiUrl = 'https://thukelameteringproduction.co.za/api';

  constructor(private http: HttpClient) { }

  getDebitorReport(startDate: Date, endDate: Date): Observable<OperationalResultDTO<TransactionDTO>> {
    // Only format the end date to 'MM-dd-yyyy'
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

     const params = new HttpParams()
      .set('startDate', formattedStartDate)  // Use ISO string for both
      .set('endDate', formattedEndDate);  // Use ISO string for both
     
      console.log("The from date : " + formattedStartDate)
      console.log("The to date : " + formattedEndDate)
    return this.http.get<OperationalResultDTO<TransactionDTO>>(
      `${this.apiUrl}/Reports/DebitorSummaryReport`, { params }
    );
  }

  // Format date to 'MM-dd-yyyy' which might be what the backend needs
  private formatDateMMDDYYYY(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = date.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const year = date.getFullYear();
    return `${month}-${day}-${year}`; // Return the date as 'MM-dd-yyyy'
  }
}
