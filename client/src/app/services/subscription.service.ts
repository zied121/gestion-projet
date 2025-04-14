import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private baseUrl = `http://localhost:5000/api/subscription`;

  constructor(private http: HttpClient) {}

  createSubscription(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, data);
  }
  updateSubscription(id: string, type: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, { type });
  }

  cancelSubscription(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cancel/${id}`);
  }

  getInvoices(customerId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/${customerId}`);
  }
}
