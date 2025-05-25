import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';
    import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
    import { RouterModule } from '@angular/router';
    import { AppComponent } from './app.component';
   // import { TaskListComponent } from './components/task/task-list.component';
    import { ProjectListComponent } from './components/project-task-management/project/project-list/project-list.component';
   // import { TaskService } from './services/task.service';
    import { ProjectService } from './services/project.service';
    import { routes } from './app.routes';
import {NgChartsModule} from 'ng2-charts';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

    @NgModule({
      imports: [
        BrowserModule,
        NgChartsModule,
        HttpClientModule,
        RouterModule.forRoot(routes),
        AppComponent,
        ProjectListComponent,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
      ],
      providers: [ProjectService]
    })
    export class AppModule { }
