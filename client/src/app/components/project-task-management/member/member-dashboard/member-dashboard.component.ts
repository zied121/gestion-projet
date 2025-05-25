import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../../services/project.service';
import { TaskService } from '../../../../services/task.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {KanbanBoardComponent} from '../kanban-board/kanban-board.component';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.component.html',
  imports: [
    FormsModule,
    NgForOf,
    KanbanBoardComponent,
    NgIf
  ],
  styleUrls: ['./member-dashboard.component.scss']
})
export class MemberDashboardComponent implements OnInit {
  projects: any[] = [];
  selectedProjectId: string | null = null;

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    let userid = localStorage.getItem('userId') || '';
    this.projectService.getProjectsForCurrentMember(userid).subscribe((projects) => {
      this.projects = projects;
      if (projects.length > 0) {
        this.selectedProjectId = projects[0]._id;
      }
    });
  }

  onProjectChange(event: any): void {
    this.selectedProjectId = event.target.value;
  }
}
