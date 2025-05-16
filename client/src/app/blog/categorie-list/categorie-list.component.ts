import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie.model';

@Component({
  selector: 'app-categorie-list',
  templateUrl: './categorie-list.component.html',
  styleUrls: ['./categorie-list.component.css']
})
export class CategorieListComponent implements OnInit {
  categories: Categorie[] = [];

  constructor(private categorieService: CategorieService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getCategories().subscribe(
      data => this.categories = data,
      error => console.error('Error fetching categories', error)
    );
  }
}