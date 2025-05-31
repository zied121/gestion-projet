import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Room} from '../../../../../models/room.model';
// export interface Room {
//   _id: string;
//   id: string;
//   projectId: string;
//   name: string;
//   owner: { nom: string , _id: string };
//
// }
interface StartCallResponse {
  meetLink: string;
  success: boolean;
  error?: string;
}
interface AuthCheckResponse {
  authenticated: boolean;
  expiresAt?: number;
}
interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  Status: string;
  image?: string;
}

// export interface Room {
//   name: string;
//   owner: { nom: string , _id: string };
//
// }
//import {Room} from '../../../../../models/room.model'; // Adjust the import path as necessary
@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = 'http://localhost:5000/api/rooms';
  private apiUserUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // assuming you store token here
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  // Pour récupérer toutes les rooms
  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }
  getallRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/allrooms`, { headers: this.getAuthHeaders() });
  }
  getRoomsByUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getRoomsPerUser`, { headers: this.getAuthHeaders() });
  }
  getRoomsPerowner(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getRoomsPerowner`, { headers: this.getAuthHeaders() });
  }

  getRoomById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getRoomById/${id}`,{
      headers: this.getAuthHeaders()
    });
  }
  getRoomUsers(roomId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getRoomUsers/${roomId}`, { headers: this.getAuthHeaders() });
  }

  createRoom(data: FormData, projectId: string): Observable<any> {
    console.log(data);
    return this.http.post(`${this.apiUrl}/RoomForProject/${projectId}`, data, { headers: this.getAuthHeaders() })

  }

  updateRoom(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/UpdateRoom/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteRoom/${id}`, { headers: this.getAuthHeaders() });
  }
  startCall(roomId: string): Observable<StartCallResponse> {
    return this.http.post<StartCallResponse>(
      `${this.apiUrl}/${roomId}/start-call`,
      {}
    );
  }
/*
  initiateGoogleAuth(): void {
    window.location.href = 'http://localhost:5000/google/login';
  }
*/
initiateGoogleAuth(roomId?: string): void {
  const state = roomId ? encodeURIComponent(roomId) : '';
  window.location.href = `http://localhost:5000/google/login?state=${state}`;
}

 checkGoogleAuth(): Observable<AuthCheckResponse> {
    return this.http.get<AuthCheckResponse>(
      `${this.apiUrl}/google/verify-session`,
      { withCredentials: true }
    );
  }

  createPrivateRoom(otherUserId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/createPrivateRoom`, {
      otherUserId: otherUserId
    }, { headers: this.getAuthHeaders() });
  }

 getUsersByOrganization(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/organization`);
  }

  searchRooms(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/searchRoom?query=${query}` , {
      headers: this.getAuthHeaders()
    });
  }
}
