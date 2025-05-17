import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../../services/blog.service';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Blog } from '../../../../../models/blog.model';
import {RouterLink} from '@angular/router';
import {DatePipe, NgForOf, NgIf, SlicePipe} from '@angular/common';

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
  blogs: any[] = [];
  filteredBlogs: Blog[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = true;

  // Contrôle unique pour la recherche
  searchControl = new FormControl('');
  sortOption = 'newest';

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
    this.setupSearch();
  }

  getAuthorName(author: string | { username: string }): string {
    if (typeof author === 'string') {
      return author;
    }
    return author?.username || 'Auteur inconnu';
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
        this.blogs = response.blogs;
        this.filteredBlogs = [...this.blogs];
        this.currentPage = page;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let results = [...this.blogs];

    // Filtrage
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      results = results.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm)
      );
    }

    // Tri
    results = this.sortBlogs(results);
    this.filteredBlogs = results;
  }

  private sortBlogs(blogs: any[]): Blog[] {
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

  likeBlog(blogId: string): void {
    if (!blogId) return;

    this.blogService.likeBlog(blogId).subscribe({
      next: (response) => {
        const index = this.blogs.findIndex(b => b._id === blogId);
        if (index !== -1) {
          this.blogs[index].likeCount = response.likeCount;
          this.applyFilters();
        }
      },
      error: (err) => console.error('Error liking blog:', err)
    });
  }



}
