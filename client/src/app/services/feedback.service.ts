import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private apiUrl = 'http://localhost:5000/api/feedbacks'; 

  constructor(private http: HttpClient) { }

  // ✅ Ajouter un feedback pour un blog
addFeedback(blogId: string, feedback: Feedback): Observable<Feedback> {
  return this.http.post<Feedback>(`${this.apiUrl}/blog/${blogId}`, feedback);
}

getFeedbacksByBlogId(blogId: string): Observable<Feedback[]> {
  return this.http.get<Feedback[]>(`${this.apiUrl}/blog/${blogId}`);
}
}
