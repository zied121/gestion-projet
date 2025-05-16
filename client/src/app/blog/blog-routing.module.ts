import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogFormComponent } from './blog-form/blog-form.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'blogs', component: BlogListComponent },
  { path: 'blogs/create', component: BlogFormComponent },
  { path: 'blogs/:id', component: BlogDetailComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
