import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Blog, Comment } from '../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  comments: Comment[] = [];
  blogId: string = '';
  newComment: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id') || '';
    if (this.blogId) {
      this.loadBlog();
    } else {
      this.router.navigate(['/blogs']);
    }
  }
  loadBlog(): void {  
    this.blogService.getBlog(this.blogId).subscribe({  
        next: (blog: Blog) => {  
            this.blog = blog;  
        },  
        error: (err: any) => {  
            console.error('Erreur lors du chargement du blog:', err);  
            this.errorMessage = 'Impossible de charger le blog';  
        }  
    });  
}


  likeBlog(): void {
    if (!this.blog) return;
    
    this.blogService.likeBlog(this.blog._id).subscribe({
      next: (updatedBlog) => {
        if (this.blog) {
          this.blog.likes = updatedBlog.likes;
          this.blog.likedByUser = updatedBlog.likedByUser;
        }
      },
      error: (err) => {
        this.errorMessage = 'Vous devez être connecté pour aimer un blog';
        console.error(err);
      }
    });
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.blog) return;

    this.blogService.addComment(this.blog._id, this.newComment).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'ajout du commentaire';
        console.error(err);
      }
    });
  }

  deleteComment(commentId: string): void {
    if (!this.blog) return;

    if (confirm('Supprimer ce commentaire ?')) {
      this.blogService.deleteComment(this.blog._id, commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c._id !== commentId);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error(err);
        }
      });
    }
  }

  deleteBlog(): void {
    if (!this.blog) return;

    if (confirm('Supprimer définitivement ce blog ?')) {
      this.blogService.deleteBlog(this.blog._id).subscribe({
        next: () => {
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression du blog';
          console.error(err);
        }
      });
    }
  }

  // Méthode pour afficher le nom de l'auteur
  getAuthorName(): string {
    if (!this.blog) return 'Anonyme';
    return typeof this.blog.author === 'string' ? this.blog.author : this.blog.author?.username || 'Anonyme';
  }
}