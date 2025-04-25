import { Component, OnInit } from '@angular/core';
import { BlogService } from '../services/blog.service';
import { Blog } from '../models/blog.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'] // Changé en .css pour plus de simplicité
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  errorMessage: string = '';
  searchTerm: string = '';

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Récupère le numéro de page depuis l'URL
    this.route.params.subscribe(params => {
      this.currentPage = params['page'] ? Number(params['page']) : 1;
      this.loadBlogs();
    });
  }

  // Charge les blogs depuis l'API
  loadBlogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.blogService.getBlogs(this.currentPage).subscribe({
      next: (response) => {
        this.blogs = response.blogs;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Impossible de charger les blogs. Veuillez réessayer.';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  // Filtre les blogs selon la recherche
  filteredBlogs(): Blog[] {
    if (!this.searchTerm) return this.blogs;
    
    const search = this.searchTerm.toLowerCase();
    return this.blogs.filter(blog => 
      blog.title.toLowerCase().includes(search) || 
      blog.content.toLowerCase().includes(search)
    );
  }

  // Change de page
  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.router.navigate(['/blogs', newPage]);
    }
  }

  // Supprime un blog
  deleteBlog(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce blog ?')) {
      this.blogService.deleteBlog(id).subscribe({
        next: () => {
          this.loadBlogs(); // Recharge la liste après suppression
        },
        error: (error) => {
          this.errorMessage = 'Échec de la suppression';
          console.error(error);
        }
      });
    }
  }
  navigateToBlog(blogId: string): void {
    this.router.navigate(['/blogs', blogId]);
  }

}