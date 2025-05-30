import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategorieService } from '../../../services/categorie.service';
import { Blog } from '../../../../../models/blog.model';

@Component({
  selector: 'app-blog-category',
  standalone: true,
  templateUrl: './blog-category.component.html'
})
export class BlogCategoryComponent implements OnInit {
  blogs: any[] = [];
  categoryId!: string;

  constructor(
    private route: ActivatedRoute,
    private categorieService: CategorieService
  ) { }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.params['id'];
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.categorieService.getBlogsByCategory(this.categoryId).subscribe(
      data => this.blogs = data,
      error => console.error('Error fetching blogs', error)
    );
  }
}
