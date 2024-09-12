import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationalResultDTO } from '../DTOs/operationalResultDTO';
import { JobCardDTO } from '../DTOs/jobCardDTO'; // Assuming you have a JobCardDTO defined
import { TransactionDTO } from '../DTOs/transactionDTO';

@Injectable({
  providedIn: 'root'
})
export class JobCardService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Get all job cards
  getAllJobCards(isActive: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
    const params = new HttpParams().set('isactive', isActive.toString() ?? "true");
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/JobCard/All`, { params });
  }

  // Get job cards by employee Guid
  getJobCardsForEmployee(employeeGuid: string): Observable<OperationalResultDTO<TransactionDTO>> {
    const params = new HttpParams().set('userGuid', employeeGuid);
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/JobCard/ForEmployee`, { params });
  }

  // Get job card by ID
  getJobCardById(id: number): Observable<OperationalResultDTO<TransactionDTO>> {
    return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/JobCard/ById/${id}`);
  }

  // Create a new job card
  createJobCard(jobCardData: JobCardDTO): Observable<OperationalResultDTO<JobCardDTO>> {
    return this.http.post<OperationalResultDTO<JobCardDTO>>(`${this.apiUrl}/JobCard/Create`, jobCardData);
  }

  // Update an existing job card
  updateJobCard(jobCardData: JobCardDTO): Observable<OperationalResultDTO<JobCardDTO>> {
    return this.http.put<OperationalResultDTO<JobCardDTO>>(`${this.apiUrl}/JobCard/Update/${jobCardData.id}`, jobCardData);
  }

  // Delete a job card
  deleteJobCard(jobCardData: JobCardDTO): Observable<OperationalResultDTO<JobCardDTO>> {
    return this.http.put<OperationalResultDTO<JobCardDTO>>(`${this.apiUrl}/JobCard/Delete/${jobCardData.id}`, jobCardData);
  }
}
