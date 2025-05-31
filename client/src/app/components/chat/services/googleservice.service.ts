import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleMeetService {

  private baseUrl = 'http://localhost:5000/api/google';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

 loginWithGoogle(): Observable<void> {
  return this.http.get(`${this.baseUrl}/login`, {
    headers: this.getAuthHeaders(),
    responseType: 'text',
  }).pipe(
    map((googleRedirectUrl: string) => {
      window.location.href = googleRedirectUrl;
    })
  );
}
}
