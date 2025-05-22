import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TaskRoutingModule } from './task-routing.module';

import { TaskListComponent } from './task-list/task-list.component';
import { TaskModalComponent } from './task-modal/task-modal.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskCardComponent } from './task-card/task-card.component';
import { AssignUsersModalComponent } from './assign-users-modal/assign-users-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule,
    TaskRoutingModule,
    TaskListComponent,
    TaskModalComponent,
    TaskDetailComponent,
    TaskCardComponent,
    AssignUsersModalComponent
  ]
})
export class TaskModule {}
