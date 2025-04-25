import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { BlogFormComponent } from './blog-form/blog-form.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { MarkdownModule } from 'ngx-markdown';  

import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';  // pour les services HTTP
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [

    AppComponent,
    BlogListComponent,
    BlogDetailComponent,
    BlogFormComponent,
    FeedbackFormComponent

  ],

  imports: [
    CommonModule, 
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    MarkdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
