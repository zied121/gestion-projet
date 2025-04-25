import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogFormComponent } from './blog-form/blog-form.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';

const routes: Routes = [
  { path: 'blogs/:page', component: BlogListComponent },  
  { path: 'blog-form', component: BlogFormComponent },
  { path: 'blog-detail/:id', component: BlogDetailComponent },
  { path: '', redirectTo: '/blogs/1', pathMatch: 'full' },  // Redirection vers la première page de blogs
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
