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

  createEvent(data: any): Observable<any> {
    console.log('Creating event with data:', data);
    return this.http.post(`${this.baseUrl}/create`, data, {
      headers: this.getAuthHeaders()
    });
  }
  updateEvent(id: string, data: any): Observable<any> {
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

 
 

  // Dans event.service.ts

// Ajoutez ces deux nouvelles méthodes
// Dans event.service.ts

// Ajoutez ces deux nouvelles méthodes
// Dans event.service.ts
// event.service.ts
searchEvents(types: string[], search: string): Observable<EventModel[]> {
  let params = new HttpParams();
  
  // Envoyez chaque type séparément avec le même paramètre 'type'
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
// Dans event.service.ts
getParticipantStatus(eventId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/${eventId}/participant-status`, {
    headers: this.getAuthHeaders()
  });
}

}



function tap(arg0: (event: any) => void): import("rxjs").OperatorFunction<EventModel, EventModel> {
  throw new Error('Function not implemented.');
}