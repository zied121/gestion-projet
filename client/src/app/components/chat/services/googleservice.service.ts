// google-meet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthStatus {
  isAuthenticated: boolean;
}

export interface MeetResponse {
  meetLink: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMeetService {
  private googleAuthUrl = 'http://localhost:5000/google'; // For auth endpoints
  private roomsUrl = 'http://localhost:5000/rooms'; // For room endpoints

  constructor(private http: HttpClient) {}

  checkAuthStatus(): Observable<AuthStatus> {
    return this.http.get<AuthStatus>(`${this.googleAuthUrl}/auth-status`);
  }

  createMeeting(roomId: string): Observable<MeetResponse> {
    return this.http.post<MeetResponse>(`${this.roomsUrl}/${roomId}/start-call`, {});
  }

  revokeAuth(): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.googleAuthUrl}/revoke-auth`, {});
  }
}