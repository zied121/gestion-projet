import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, tap, throwError} from 'rxjs';

const API_URL = 'http://localhost:5000/api/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userProfileSubject = new BehaviorSubject<any>(null);
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // assuming you store token here
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

getProfile(email: string, motDePasse: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  const params = { email, motDePasse };
  return this.http.get<any>(`${API_URL}/getone`, { headers, params }).pipe(
    tap((response) => {
      this.userProfileSubject.next(response);
      console.log(this.userProfileSubject);
    }),
    catchError((error) => {
      console.error('Erreur lors de la requête :', error);
      return throwError(error);
    })
  );
}


  addUser(userData: any,organisationid:any): Observable<any> {
    return this.http.post(`${API_URL}/add/${organisationid}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${API_URL}/update/${userId}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: string,organisationid:any): Observable<any> {
    return this.http.delete(`${API_URL}/delete/${organisationid}/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}`, {
      headers: this.getAuthHeaders()
    });
  }





}
