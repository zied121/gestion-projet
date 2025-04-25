import { Component, Input, OnInit } from '@angular/core';
import { BlogService } from '../services/blog.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
})
export class BlogFormComponent implements OnInit {
  blogData = {
    title: '',
    content: ''
  };

  isEditMode = false;
  blogId = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.blogId;

    if (this.isEditMode) {
      this.blogService.getBlogById(this.blogId).subscribe({
        next: (blog) => {
          this.blogData = blog;
        },
        error: (error) => {
          this.errorMessage = `Erreur lors du chargement du blog: ${error}`;
        }
      });
    }
  }

  onSubmit(): void {
    // Affichage des données envoyées pour débogage
    console.log('Données envoyées au backend:', this.blogData);

    // Validation du formulaire côté client
    if (!this.blogData.title || !this.blogData.content) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.isEditMode) {
      this.blogService.updateBlog(this.blogId, this.blogData).subscribe({
        next: () => {
          this.successMessage = 'Blog modifié avec succès !';
          setTimeout(() => this.router.navigate(['/blogs']), 2000); // Redirection après 2 secondes
        },
        error: (error) => {
          this.errorMessage = `Erreur lors de la modification du blog: ${error}`;
        }
      });
    } else {
      this.blogService.createBlog(this.blogData).subscribe({
        next: () => {
          this.successMessage = 'Blog publié avec succès !';
          setTimeout(() => this.router.navigate(['/blogs']), 2000); // Redirection après 2 secondes
        },
        error: (error) => {
          this.errorMessage = `Erreur lors de la création du blog: ${error}`;
        }
      });
    }
  }
}
