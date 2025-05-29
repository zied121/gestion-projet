import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

interface AiResponse {
  generated: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:5000/api';  // endpoint backend

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  generateTitleOrDescription(input: string, type: 'title' | 'description'): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.apiUrl}/generate-title-desc`, { input, type }, {headers: this.getAuthHeaders() });
  }
  getDeepSeekResponse(message: string): Observable<string> {
    const body = {
      prompt: message,
      // model: 'deepseek/deepseek-v3',
    };
    return this.http.post<string>(`${this.apiUrl}/ai/chat`, body,{headers: this.getAuthHeaders() });
  }
}
