import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  private handleError = (error: HttpErrorResponse) => {
    console.error('HTTP Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server Error: ${error.status} ${error.statusText}`;
    }

    return throwError(() => ({
      ...error,
      message: errorMessage
    }));
  };

  // ✅ GET: all events for the current user
  getEventsByUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ GET: all events (admin/overview)
  getAllEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/list`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ GET: single event by ID
  getEventById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ POST: create an event
  createEvent(data: CreateEventModel): Observable<any> {
    console.log('Service: Creating event with data:', data);
    
    // Clean the data before sending
    const cleanData = this.cleanEventData(data);
    
    return this.http.post(`${this.baseUrl}/create`, cleanData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ PUT: update an existing event
  updateEvent(id: string, data: Partial<UpdateEventModel>): Observable<any> {
    console.log('Service: Updating event with ID:', id, 'Data:', data);
    
    // Clean the data before sending
    const cleanData = this.cleanEventData(data);
    
    return this.http.put(`${this.baseUrl}/update/${id}`, cleanData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ POST: add participants to an existing event
  addParticipants(eventId: string, data: { participants: string[] }): Observable<any> {
    console.log('Service: Adding participants to event:', eventId, 'Participants:', data);
    
    return this.http.post(`${this.baseUrl}/${eventId}/add-participants`, data, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ DELETE: remove an event
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ PUT: respond to event invitation (accept/refuse)
  respondToEvent(eventId: string, response: { accept?: boolean; refuse?: boolean; message?: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${eventId}/respond`, response, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Helper method to clean event data before sending to backend
  private cleanEventData(data: any): any {
    const cleanData = { ...data };
    
    // Remove undefined and null values
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined || cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    // Handle empty strings
    if (cleanData.description === '') {
      cleanData.description = '';
    }
    if (cleanData.emplacement === '') {
      cleanData.emplacement = '';
    }
    if (cleanData.lien === '') {
      cleanData.lien = '';
    }

    // Ensure participants is an array
    if (cleanData.participants && !Array.isArray(cleanData.participants)) {
      cleanData.participants = [];
    }

    // Ensure rappel is an array
    if (cleanData.rappel && !Array.isArray(cleanData.rappel)) {
      cleanData.rappel = [];
    }

    // Handle boolean values properly
    if (cleanData.isRecurring !== undefined) {
      cleanData.isRecurring = Boolean(cleanData.isRecurring);
    }

    // Handle recurrence properly
    if (cleanData.type_recurrence === 'none') {
      cleanData.isRecurring = false;
    }

    console.log('Cleaned data:', cleanData);
    return cleanData;
  }
}