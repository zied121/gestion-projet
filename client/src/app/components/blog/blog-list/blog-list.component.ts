import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../../services/blog.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Blog } from '../../../../../models/blog.model';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgForOf, NgIf, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NgForOf,
    NgIf,
    SlicePipe,
    DatePipe
  ],
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = true;
  isLikedMap: { [key: string]: boolean } = {}; // Gestion des likes

  searchControl = new FormControl('');
  sortOption = 'newest';

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBlogs();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  loadBlogs(page: number = 1): void {
    this.isLoading = true;
    this.blogService.getBlogs(page).subscribe({
      next: (response) => {
        console.log('BlogList', response);
        this.blogs = response.blogs.map(blog => ({
          ...blog,
          isLiked: false // Initialisation du statut like
        }));
        this.filteredBlogs = [...this.blogs];
        this.currentPage = page;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        console.log('BlogList', this.blogs);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.isLoading = false;
      }
    });
  }

  likeBlog(blogId: string): void {
    if (!blogId) return;

    this.blogService.likeBlog(blogId).subscribe({
      next: (response) => {
        const index = this.blogs.findIndex(b => b._id === blogId);
        if (index !== -1) {
          this.blogs[index] = {
            ...this.blogs[index],
            likeCount: response.likeCount,
            isLiked: !this.blogs[index].isLiked
          };
          this.applyFilters();
        }
      },
      error: (err) => console.error('Error liking blog:', err)
    });
  }

  deleteBlog(blogId: string): void {
    if (!blogId) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce blog ?')) {
      this.blogService.deleteBlog(blogId).subscribe({
        next: () => {
          this.blogs = this.blogs.filter(blog => blog._id !== blogId);
          this.filteredBlogs = this.filteredBlogs.filter(blog => blog._id !== blogId);
          alert('Blog supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Échec de la suppression: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  editBlog(blogId: string): void {
    this.router.navigate(['/blogs/edit', blogId]);
  }

  private applyFilters(): void {
    let results = [...this.blogs];
    const searchTerm = this.searchControl.value?.toLowerCase() || '';

    if (searchTerm) {
      results = results.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredBlogs = this.sortBlogs(results);
  }

  private sortBlogs(blogs: Blog[]): Blog[] {
    switch (this.sortOption) {
      case 'newest':
        return [...blogs].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return [...blogs].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'popular':
        return [...blogs].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      default:
        return blogs;
    }
  }

  onSortChange(option: string): void {
    this.sortOption = option;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadBlogs(page);
    }
  }
}
