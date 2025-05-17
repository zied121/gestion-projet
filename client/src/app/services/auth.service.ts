import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginPayload {
  email: string;
  motDePasse: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload);
  }

  signup(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, payload);
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getRole(): string | null {
    return localStorage.getItem('role');
  }


  getUserRole(): string | null {
    const Role = this.getRole();
    if (!Role) {
      return null;
    }
    return Role;
}

forgetPassword(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/forget`, { email });
}
  getCurrentUserRole(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role || '';
  }

}
