import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  private baseUrl = 'http://localhost:5000/api/organisation';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  onCreateWorkspace(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data, { headers: this.getAuthHeaders() });
  }

  onJoinWorkspace(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/join`, data, { headers: this.getAuthHeaders() });
  }

  checkOrganisation(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check`, {
      headers: this.getAuthHeaders()
    });
  }

  getOrganisationById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrganisationById(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getAllOrganisations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/organisations`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteOrganisationById(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

getAllUsersByOrganisation(organisationId: string, page = 1, limit = 10): Observable<any> {
  return this.http.get(`${this.baseUrl}/getall/${organisationId}?page=${page}&limit=${limit}`, {
    headers: this.getAuthHeaders()
  });
}

getOrganisationAnalytics(): Observable<any> {
  return this.http.get(`${this.baseUrl}/analytics`, {
    headers: this.getAuthHeaders()
  });
}

  // getAllUsersByOrganisation(organisationId: string): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/getall/${organisationId}`, {
  //     headers: this.getAuthHeaders()
  //   });
  // }


  getOrganizations():Observable<any> {
    return this.http.get(`${this.baseUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

    deleteOrganization(id: string): Observable<any> {
      return this.http.delete(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders()
      });
    }

}
