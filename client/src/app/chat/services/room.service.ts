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

  // Pour récupérer toutes les rooms
  getRooms(): Observable<any[]> {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY'; 
        const token = localStorage.getItem('token') || staticToken; 

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}`,  { headers });
  }
  getRoomsByUser(): Observable<any[]> {
    const token = localStorage.getItem('token'); 

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/getRoomsPerUser`, { headers });
  }
  getRoomById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }  
}
