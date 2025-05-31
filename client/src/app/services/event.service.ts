// service/event.service.ts - Corrections pour l'upload de fichiers

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEventModel, EventModel, UpdateEventModel } from '../models/event.model';
import { tap as rxjsTap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:5000/api/events';

  constructor(private http: HttpClient) {}

  // Headers pour JSON (sans Content-Type pour FormData)
  private getAuthHeaders(includeContentType: boolean = true): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: any = {
      'Authorization': `Bearer ${token}`
    };
    
    // Ne pas définir Content-Type pour FormData - le navigateur le fait automatiquement
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return new HttpHeaders(headers);
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

  // Méthode corrigée pour la création d'événements avec fichiers
  createEvent(data: any): Observable<any> {
    console.log('Creating event with data:', data);

    // Si c'est un FormData, ne pas ajouter Content-Type
    if (data instanceof FormData) {
      const headers = this.getAuthHeaders(false); // Sans Content-Type
      return this.http.post(`${this.baseUrl}/create`, data, { 
        headers: headers
      });
    } else {
      // Pour les données JSON normales
      const headers = this.getAuthHeaders(true); // Avec Content-Type
      return this.http.post(`${this.baseUrl}/create`, data, { 
        headers: headers
      });
    }
  }

  // Méthode corrigée pour la mise à jour d'événements avec fichiers
  updateEvent(id: string, data: any): Observable<any> {
    console.log('Updating event with data:', data);

    // Si c'est un FormData, ne pas ajouter Content-Type
    if (data instanceof FormData) {
      const headers = this.getAuthHeaders(false); // Sans Content-Type
      return this.http.put(`${this.baseUrl}/update/${id}`, data, { 
        headers: headers
      });
    } else {
      // Pour les données JSON normales
      const headers = this.getAuthHeaders(true); // Avec Content-Type
      return this.http.put(`${this.baseUrl}/update/${id}`, data, { 
        headers: headers
      });
    }
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getEventById(id: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders()
    }).pipe(
        rxjsTap(event => console.log('API Response:', event))
    );
  }

  deleteParticipant(eventId: string, participantId: string): Observable<any> {
    return this.http.delete(
        `${this.baseUrl}/${eventId}/participants/${participantId}`,
        { headers: this.getAuthHeaders() }
    );
  }

  updateParticipantResponse(eventId: string, responseData: { response: string; message?: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/update_participant/${eventId}`, responseData, {
      headers: this.getAuthHeaders()
    });
  }

  getEventWithParticipants(eventId: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.baseUrl}/${eventId}/participants`, {
      headers: this.getAuthHeaders()
    }).pipe(
      rxjsTap(event => console.log('Event with participants:', event))
    );
  }

  searchEvents(types: string[], search: string): Observable<EventModel[]> {
    let params = new HttpParams();

    if (types && types.length > 0) {
      types.forEach(type => {
        params = params.append('type', type);
      });
    }

    if (search) {
      params = params.append('search', search);
    }

    return this.http.get<EventModel[]>(`${this.baseUrl}/search`, {
      params: params,
      headers: this.getAuthHeaders()
    });
  }

  getParticipantStatus(eventId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${eventId}/participant-status`, {
      headers: this.getAuthHeaders()
    });
  }
}