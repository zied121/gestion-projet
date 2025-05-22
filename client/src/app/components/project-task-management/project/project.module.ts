import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { ProjectRoutingModule } from './project-routing.module';

import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectModalComponent } from './project-modal/project-modal.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { AssignUsersModalComponent } from './assign-users-modal/assign-users-modal.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule,
    ProjectRoutingModule,
    ProjectListComponent,
    ProjectModalComponent,
    ProjectDetailComponent,
    ProjectCardComponent,
    AssignUsersModalComponent
  ]
})
export class ProjectModule {}
