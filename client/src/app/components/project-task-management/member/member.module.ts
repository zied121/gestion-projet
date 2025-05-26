import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { MemberRoutingModule } from './ member-routing.module';
import { MemberDashboardComponent } from './member-dashboard/member-dashboard.component';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import {NgChartsModule} from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    NgChartsModule,
    NgbModalModule,
    MemberRoutingModule,
    MemberDashboardComponent,
    KanbanBoardComponent,

  ],
  declarations: [

  ]
})
export class MemberModule {}
