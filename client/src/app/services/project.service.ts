import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api/projects';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProjects(): Observable<any> {
    return this.http.get(API_URL, { headers: this.getAuthHeaders() });
  }

  getProjectById(projectId: string): Observable<any> {
    return this.http.get(`${API_URL}/${projectId}`, { headers: this.getAuthHeaders() });
  }

  createProject(projectData: any): Observable<any> {
    return this.http.post(API_URL, projectData, { headers: this.getAuthHeaders() });
  }

  updateProject(projectId: string, projectData: any): Observable<any> {
    return this.http.put(`${API_URL}/${projectId}`, projectData, { headers: this.getAuthHeaders() });
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${API_URL}/${projectId}`, { headers: this.getAuthHeaders() });
  }
}
