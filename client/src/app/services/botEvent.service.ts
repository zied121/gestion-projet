import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BotEventService {
  private baseUrl = 'http://localhost:5000/api/chat';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  sendBotQuery(query: string): Observable<any> {
    const body = { query };
    return this.http.post(this.baseUrl, body, {
      headers: this.getAuthHeaders()
    });
  }
}
