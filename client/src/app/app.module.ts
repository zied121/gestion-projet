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

    @NgModule({
      imports: [
        BrowserModule,
        NgChartsModule,
        HttpClientModule,
        RouterModule.forRoot(routes),
        AppComponent,
        ProjectListComponent
      ],
      providers: [ProjectService]
    })
    export class AppModule { }
