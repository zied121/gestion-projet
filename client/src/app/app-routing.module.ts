import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './blog/blog-detail/blog-detail.component';
import { BlogFormComponent } from './blog/blog-form/blog-form.component';
import { FeedbackFormComponent } from './blog/feedback-form/feedback-form.component';
import { BlogCategoryComponent } from './blog/blog-category/blog-category.component';
import { CategorieListComponent } from './blog/categorie-list/categorie-list.component';


const routes: Routes = [
  { path: 'blogs', component: BlogListComponent },
  { path: 'blogs/create', component: BlogFormComponent },
  { path: 'blogs/:id', component: BlogDetailComponent },
  { path: '', redirectTo: 'blogs', pathMatch: 'full' },
  { path: '**', redirectTo: 'blogs' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }