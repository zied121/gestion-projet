import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../../guards/auth.guard';
import { adminGuard } from '../../../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ':projectId'
  },
  {
    path: ':projectId',
    loadComponent: () =>
      import('./task-list/task-list.component').then(m => m.TaskListComponent),

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule {}
