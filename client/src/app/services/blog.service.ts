import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Blog } from '../models/blog.model';
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BlogService {
  // URL directe (version simple pour débutant)
  private apiUrl = 'http://localhost:5000/api/blogs';

  constructor(private http: HttpClient) { }

  getBlog(blogId: string): Observable<Blog> {  
    return this.http.get<Blog>(`/api/blogs/${blogId}`);  
}  

  // Récupérer tous les blogs (version basique)
  getBlogs(page: number = 1, limit: number = 6): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Récupérer un blog par ID
  getBlogById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Créer un blog (version simplifiée)
  createBlog(blogData: { title: string, content: string }): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blogData)
      .pipe(catchError(this.handleError));
  }

  // Mettre à jour un blog
  updateBlog(id: string, blogData: { title: string, content: string }): Observable<Blog> {
    return this.http.put<Blog>(`${this.apiUrl}/${id}`, blogData)
      .pipe(catchError(this.handleError));
  }

  // Supprimer un blog
  deleteBlog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Ajouter un commentaire (version simple)
  addComment(blogId: string, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${blogId}/comments`, { content: comment })
      .pipe(catchError(this.handleError));
  }

  // Gestion basique des erreurs
  private handleError(error: any) {
    console.error('Une erreur est survenue:', error);
    let errorMessage = 'Erreur inconnue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 404) {
      errorMessage = 'Blog non trouvé';
    } else if (error.status === 401) {
      errorMessage = 'Connectez-vous pour effectuer cette action';
    }

    return throwError(() => new Error(errorMessage));
  }

  likeBlog(blogId: string): Observable<any> {  
    return this.http.post(`/api/blogs/${blogId}/like`, {});  
  }  
  
  deleteFeedback(commentId: string): Observable<any> {  
    return this.http.delete(`/api/comments/${commentId}`);  
  }  


  deleteComment(blogId: string, commentId: string): Observable<any> {  
    return this.http.delete(`/api/blogs/${blogId}/comments/${commentId}`);  
}  
}