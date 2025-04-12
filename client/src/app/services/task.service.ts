import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api/tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTasks(): Observable<any> {
    return this.http.get(API_URL, { headers: this.getAuthHeaders() });
  }

  getTaskById(taskId: string): Observable<any> {
    return this.http.get(`${API_URL}/${taskId}`, { headers: this.getAuthHeaders() });
  }

  createTask(taskData: any): Observable<any> {
    return this.http.post(API_URL, taskData, { headers: this.getAuthHeaders() });
  }

  updateTask(taskId: string, taskData: any): Observable<any> {
    return this.http.put(`${API_URL}/${taskId}`, taskData, { headers: this.getAuthHeaders() });
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${API_URL}/${taskId}`, { headers: this.getAuthHeaders() });
  }
}
