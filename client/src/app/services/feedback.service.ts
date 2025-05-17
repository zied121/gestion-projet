import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../../../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:5000/api/feedbacks';

  constructor(private http: HttpClient) { }

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
}
