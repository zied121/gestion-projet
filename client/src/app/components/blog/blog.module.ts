import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { BlogRoutingModule } from './blog-routing.module';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { BlogFormComponent } from './blog-form/blog-form.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { CategorieListComponent } from './categorie-list/categorie-list.component';
import { BlogCategoryComponent } from './blog-category/blog-category.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { MatInputModule } from '@angular/material/input';


import { DatePipe, SlicePipe } from '@angular/common';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BlogRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatInputModule,
    BlogListComponent,
    BlogDetailComponent,
    BlogFormComponent,
    FeedbackFormComponent,
    BlogDetailComponent,
    CategorieListComponent,
    BlogCategoryComponent,
    ImageUploadComponent


  ]

})
export class BlogModule { }
