import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEventModel, EventModel, UpdateEventModel } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:5000/api/events';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getEventsByUser(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/list`, {
      headers: this.getAuthHeaders()
    });
  }

  createEvent(data: CreateEventModel): Observable<any> {
    console.log('Creating event with data:', data);
    return this.http.post(`${this.baseUrl}/create`, data, {
      headers: this.getAuthHeaders()
    });
  }
  updateEvent(id: string, data: UpdateEventModel): Observable<any> {
    console.log('Updating event with data:', data);
    return this.http.put(`${this.baseUrl}/update/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

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