import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';

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
    return this.http.post(API_URL, { ...projectData }, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création du projet :', error);
        return throwError(() => new Error('Échec de la création du projet. Veuillez réessayer.'));
      })
    );
  }

  getProjectUsers(projectId: string): Observable<any> {
    return this.http.get(`${API_URL}/${projectId}/users`, { headers: this.getAuthHeaders() });
  }

  updateProject(projectId: string, projectData: any): Observable<any> {
    return this.http.put(`${API_URL}/${projectId}`,{ ...projectData }, { headers: this.getAuthHeaders() });
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${API_URL}/${projectId}`, { headers: this.getAuthHeaders() });
  }

  assignUsers(projectId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${API_URL}/${projectId}/assign-users`, { userIds }, { headers: this.getAuthHeaders() });
  }

  getProjectsForCurrentMember(userId: string): Observable<any> {
    return this.http.get<any[]>(`${API_URL}/member/${userId}`, { headers: this.getAuthHeaders() });
  }

}
