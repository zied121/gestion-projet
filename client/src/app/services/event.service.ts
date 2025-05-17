import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventModel } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:5000/api/events';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ GET: all events for the current user
  getEventsByUser(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ GET: all events (admin/overview)
  getAllEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/list`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ POST: create an event
  createEvent(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ PUT: update an existing event
  updateEvent(id: string, data: Partial<EventModel>): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ DELETE: remove an event
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getEventById(id: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
