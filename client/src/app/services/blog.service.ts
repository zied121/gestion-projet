import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Blog } from '../../../models/blog.model';
import { Comment } from '../../../models/blog.model';
import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:5000/api/blogs';

  constructor(private http: HttpClient, private auth: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // assuming you store token here
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }





  // Méthode privée pour gérer les erreurs
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  // Valide que l'ID existe et n'est pas 'undefined'
  private validateId(id: string): void {
    if (!id || id === 'undefined') {
      throw new Error('Invalid ID provided');
    }
  }

  getBlogs(page: number = 1, limit: number = 10): Observable<{ blogs: Blog[], totalPages: number }> {
    return this.http.get<{ blogs: Blog[], totalPages: number }>(
      `${this.apiUrl}?page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getBlogById(id: string): Observable<{ blog: any }> {
    this.validateId(id);
    return this.http.get<{ blog: any }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  createBlog(formData: FormData): Observable<any> {
    return this.http.post(
      this.apiUrl,
      formData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateBlog(id: string, formData: FormData): Observable<Blog> {
    return this.http.put<Blog>(
      `${this.apiUrl}/${id}`,
      formData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erreur mise à jour blog:', error);
        return throwError(() => error);
      })
    );
  }

  deleteBlog(id: string): Observable<{ message: string }> {
    this.validateId(id);
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  likeBlog(id: string): Observable<{ likeCount: number, likes: string[] }> {
    this.validateId(id);
    return this.http.post<{ likeCount: number, likes: string[] }>(
      `${this.apiUrl}/like/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getRecommendedBlogs(id: string): Observable<Blog[]> {
    this.validateId(id);
    return this.http.get<Blog[]>(
      `${this.apiUrl}/${id}/recommendations`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getPopularBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(
      `${this.apiUrl}/popular`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getBlogComments(blogId: string, page: number = 1, limit: number = 10): Observable<{ comments: Comment[], totalCount: number }> {
    this.validateId(blogId);
    return this.http.get<{ comments: Comment[], totalCount: number }>(
      `${this.apiUrl}/${blogId}/comments?page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  addComment(blogId: string, content: string): Observable<Comment> {
    this.validateId(blogId);
    return this.http.post<Comment>(
      `${this.apiUrl}/${blogId}/comments`,
      { content },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateComment(blogId: string, commentId: string, content: string): Observable<Comment> {
    this.validateId(blogId);
    this.validateId(commentId);
    return this.http.put<Comment>(
      `${this.apiUrl}/${blogId}/comments/${commentId}`,
      { content },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteComment(blogId: string, commentId: string): Observable<{ message: string }> {
    this.validateId(blogId);
    this.validateId(commentId);
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${blogId}/comments/${commentId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  addTagsToBlog(blogId: string, tags: string[]): Observable<Blog> {
    this.validateId(blogId);
    return this.http.put<Blog>(
      `${this.apiUrl}/${blogId}/tags`,
      { tags },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  uploadImage(image: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<{ imageUrl: string }>(
      `${this.apiUrl}/upload`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }
}
