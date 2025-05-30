import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
// Définition du modèle de Message
export interface Message {
  _id: string;
  //sender: { nom: string , _id: string };
  sender:String
  SenderName: string;
  content: string;
  file?: string | null;
  likes?: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = 'http://localhost:5000/api/message'; // Remplace par l'URL de ton API backend
private RoomsUrl = 'http://localhost:5000/api/rooms'; // Pour les endpoints liés aux rooms
  constructor(private http: HttpClient) {}

  getMessagesByRoom(roomId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/getMessagesByRoom/${roomId}`);
  }
  sendMessage(formData: FormData): Observable<Message> {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';

    // Get token from storage or use fallback
    const token = localStorage.getItem('token') || staticToken;  // Default to static if no token

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Message>(`${this.apiUrl}/createMsgWS`, formData, { headers });
  }

  updateMessage(id: string, data: { content: string }): Observable<Message> {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
        const token = localStorage.getItem('token') || staticToken;  // Default to static if no token

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Message>(`${this.apiUrl}/updateMsg/${id}`, data, { headers });
  }
  deleteMessage(id: string) {

    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
    const token = localStorage.getItem('token') || staticToken;  // Default to static if no token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<{ message: string, id: string }>(`${this.apiUrl}/deleteMsg/${id}`, { headers });
  }
  toggleLike(id: string) {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
    const token = localStorage.getItem('token') || staticToken;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.patch<Message>(`${this.apiUrl}/toggleLike/${id}`, {}, { headers });
  }

  pinMessage(id: string) {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
    const token = localStorage.getItem('token') || staticToken;  // Default to static if no token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<Message>(`${this.apiUrl}/pin/${id}`, {}, { headers });
  }
getLastMessageByRoom(roomId: string): Observable<Message | null> {
    return this.http.get<Message>(`${this.RoomsUrl}/room/${roomId}/last`).pipe(
      catchError(error => {
        console.error(`Error fetching last message for room ${roomId}:`, error);
        // Return null instead of throwing error to prevent breaking the UI
        return of(null);
      })
    );
  }
   markMessagesAsSeen(roomId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${roomId}/seen`, {});
  }

  // NEW: Get unread message count for a room
  getUnreadCount(roomId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${roomId}/unread-count`);
  }

  // NEW: Get all unread counts for user's rooms
  getAllUnreadCounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/unread-counts`);
  }
}
