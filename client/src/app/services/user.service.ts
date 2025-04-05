import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // assuming you store token here
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  getProfile(): Observable<any> {
    return this.http.get(`${API_URL}/getone`, {
      headers: this.getAuthHeaders()
    });
  }

  addUser(userData: any,organisationid:any): Observable<any> {
    return this.http.post(`${API_URL}/add/${organisationid}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(userId: string, userData: any,organisationid:any): Observable<any> {
    return this.http.put(`${API_URL}/update/${organisationid}/${userId}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: string,organisationid:any): Observable<any> {
    return this.http.delete(`${API_URL}/delete/${organisationid}/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }



  


}
