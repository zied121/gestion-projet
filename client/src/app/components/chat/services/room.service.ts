import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Room {
  name: string;
  owner: { nom: string , _id: string };

}
@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = 'http://localhost:5000/api/rooms';

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

  createRoom(data: any,projectId:string  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/RoomForProject/${projectId}`, data, { headers: this.getAuthHeaders() });
  }

  updateRoom(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/UpdateRoom/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteRoom/${id}`, { headers: this.getAuthHeaders() });
  }
}
