import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Feedback } from '../../../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:5000/api/feedbacks';

  constructor(private http: HttpClient) { }

  // Nouvelle méthode pour le feedback global
  submitFeedback(feedbackData: any): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/global`, feedbackData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Méthodes existantes (gardées pour compatibilité)
  getFeedbacksByBlog(blogId: string): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/blog/${blogId}`);
  }

  createFeedback(blogId: string, comment: string): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/blog/${blogId}`, { comment });
  }

  updateFeedback(id: string, comment: string): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.apiUrl}/${id}`, { comment });
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Gestion d'erreur centralisée
  private handleError(error: HttpErrorResponse) {
    console.error('Error:', error);
    return throwError(() => new Error('Une erreur est survenue. Veuillez réessayer.'));
  }
}