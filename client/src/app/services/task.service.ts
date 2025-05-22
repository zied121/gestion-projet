import { Injectable } from '@angular/core';
      import { HttpClient, HttpHeaders } from '@angular/common/http';
      import { Observable } from 'rxjs';

      @Injectable({
        providedIn: 'root'
      })
      export class TaskService {
        private baseUrl = 'http://localhost:5000/api/tasks';

        constructor(private http: HttpClient) {}

        private getAuthHeaders(): HttpHeaders {
          const token = localStorage.getItem('token');
          return new HttpHeaders({
            'Authorization': `Bearer ${token}`
          });
        }

        createTask(taskData: any): Observable<any> {
          return this.http.post<any>(`${this.baseUrl}`, taskData, { headers: this.getAuthHeaders() });
        }

        getTasks(params?: { projectId: string }): Observable<any[]> {
          return this.http.get<any[]>(`${this.baseUrl}`, { headers: this.getAuthHeaders(), params });
        }

        getTaskById(taskId: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/${taskId}`, { headers: this.getAuthHeaders() });
      }

        updateTask(taskId: string, taskData: any): Observable<any> {
          return this.http.put<any>(`${this.baseUrl}/${taskId}`, taskData, { headers: this.getAuthHeaders() });
        }

        deleteTask(taskId: string): Observable<void> {
          return this.http.delete<void>(`${this.baseUrl}/${taskId}`, { headers: this.getAuthHeaders() });
        }

        addSubtask(parentTaskId: string, subtaskData: any): Observable<any> {
          return this.http.post<any>(`${this.baseUrl}/${parentTaskId}/subtasks`, subtaskData, { headers: this.getAuthHeaders() });
        }

        addCommentToTask(taskId: string, commentData: { text: string }): Observable<any> {
          return this.http.post<any>(`${this.baseUrl}/${taskId}/comments`, commentData, { headers: this.getAuthHeaders() });
        }

        assignUsersToTask(taskId: string, userIds: string[]): Observable<any> {
          return this.http.post<any>(`${this.baseUrl}/${taskId}/assign-users`, userIds, { headers: this.getAuthHeaders() });
        }

        getTasksByProject(projectId: string): Observable<any[]> {
          return this.http.get<any[]>(`${this.baseUrl}/project/${projectId}`, { headers: this.getAuthHeaders() });
        }
        assignUsers(taskId: string, userIds: string[]): Observable<any> {
          return this.http.post(`${this.baseUrl}/${taskId}/assign-users`, { userIds }, { headers: this.getAuthHeaders() });
        }
        updateTaskStatus(taskId: string, status: string) {
          return this.http.patch(`${this.baseUrl}/${taskId}/status`, { status }, { headers: this.getAuthHeaders() });
        }

        // updateTaskStatus(taskId: string, status: string) {
        //   return this.http.patch(`${this.baseUrl}/${taskId}/status`, { status }, { headers: this.getAuthHeaders() });
        // }

      }
