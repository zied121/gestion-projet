import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categorie, Blog } from '../models/categorie.model';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = 'http://localhost:5000/api/categories';

  constructor(private http: HttpClient) { }

  // Récupérer toutes les catégories
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  // Récupérer les blogs par catégorie
  getBlogsByCategory(categoryId: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/categorie/${categoryId}`);
  }

  // Ajouter une nouvelle catégorie
  addCategorie(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie);
  }
}