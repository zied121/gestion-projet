// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// interface LoginPayload {
//   email: string;
//   motDePasse: string;
// }

// interface LoginResponse {
//   user: User;
//   token: string;
// }

// export interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   organisationId: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private currentUserSubject: BehaviorSubject<User | null>;
//   public currentUser: Observable<User | null>;
//   private baseUrl = 'http://localhost:5000/api';

//   constructor(private http: HttpClient) {
//     const storedUser = localStorage.getItem('currentUser');
//     this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
//     this.currentUser = this.currentUserSubject.asObservable();
//   }

//   login(payload: LoginPayload): Observable<LoginResponse> {
//     return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
//       map(response => {
//         if (response.user && response.token) {
//           localStorage.setItem('currentUser', JSON.stringify(response.user));
//           localStorage.setItem('token', response.token);
//           localStorage.setItem('role', response.user.role);
//           this.currentUserSubject.next(response.user);
//         }
//         return response;
//       })
//     );
//   }

//   signup(payload: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}/signup`, payload);
//   }

//   logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('currentUser');
//     localStorage.removeItem('role');
//     this.currentUserSubject.next(null);
//   }

//   isLoggedIn(): boolean {
//     return !!this.getCurrentUser();
//   }

//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }

//   getRole(): string | null {
//     const user = this.getCurrentUser();
//     return user ? user.role : null;
//   }

//   getUserRole(): string | null {
//     return this.getRole();
//   }

//   verifyOtp(payload: { email: string; otp: string }): Observable<any> {
//     return this.http.post(`${this.baseUrl}/verify-otp`, payload);
//   }

//   forgetPassword(email: string): Observable<any> {
//     return this.http.post(`${this.baseUrl}/forget`, { email });
//   }

//   public getCurrentUser(): User | null {
//     const storedUser = localStorage.getItem('currentUser');
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       this.currentUserSubject.next(user);
//       return user;
//     }
//     return null;
//   }

//   isAdmin(): boolean {
//     const user = this.getCurrentUser();
//     return user ? user.role === 'admin' : false;
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface LoginPayload {
  email: string;
  motDePasse: string;
}

interface LoginResponse {
  token: string;
}
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organisationId: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {



    private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
     this.currentUser = this.currentUserSubject.asObservable();}

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


verifyOtp(payload: { email: string; otp: string }): Observable<any> {
  return this.http.post(`${this.baseUrl}/verify-otp`, payload);
}
forgetPassword(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/forget`, { email });
}





  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }


  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === 'admin' : false;
  }



}


