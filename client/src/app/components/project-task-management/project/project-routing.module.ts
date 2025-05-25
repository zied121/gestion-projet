import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './project-list/project-list.component';
import { authGuard } from '../../../guards/auth.guard';
import { adminGuard } from '../../../guards/admin.guard';
import { TaskListComponent } from '../task/task-list/task-list.component';
const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project-list/project-list.component').then(m => m.ProjectListComponent),

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}
