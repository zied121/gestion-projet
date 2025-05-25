import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';
    import { HttpClientModule } from '@angular/common/http';
    import { RouterModule } from '@angular/router';
    import { AppComponent } from './app.component';
    import { TaskListComponent } from './components/task/task-list.component';
    import { ProjectListComponent } from './components/project/project-list.component';
    import { TaskService } from './services/task.service';
    import { ProjectService } from './services/project.service';
    import { routes } from './app.routes';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

    @NgModule({
      imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(routes),
        AppComponent,
        TaskListComponent,
        ProjectListComponent,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,

      ],

      providers: [TaskService, ProjectService]
    })
    export class AppModule { }
