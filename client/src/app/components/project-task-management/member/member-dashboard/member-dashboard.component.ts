import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../../services/project.service';
import { TaskService } from '../../../../services/task.service';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {KanbanBoardComponent} from '../kanban-board/kanban-board.component';
import {TaskModalComponent} from '../../task/task-modal/task-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
interface ActivityLog {
  userName: string;
  action: string;
  timestamp: Date;
}
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
  selectedProjectId: string = '';
  totalTasks = 0;
  overdueTasks: any[] = [];
  todayTasks: any[] = [];
  recentActivities: ActivityLog[] = [];
  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    let userid = localStorage.getItem('userId') || '';
    this.projectService.getProjectsForCurrentMember(userid).subscribe((projects) => {
      this.projects = projects;
      console.log('Projects loaded:', this.projects);
      if (projects.length > 0) {
        this.selectedProjectId = projects[0]._id;
      }
      this.loadTasksForProject(this.selectedProjectId);
      this.loadActivities();
    });

  }


  onProjectChange(event: any): void {
    this.selectedProjectId = event.target.value;

    // Recharger les tâches pour ce projet
    this.loadTasksForProject(this.selectedProjectId);
    this.loadActivities();
  }

  loadTasksForProject(projectId: string) {
    this.taskService.getTasksByProject(projectId).subscribe(tasks => {
      this.todayTasks = tasks.filter(task => this.isTaskToday(task));
      this.overdueTasks = tasks.filter(task => this.isTaskOverdue(task));
      this.totalTasks = tasks.length;
      // mettre à jour aussi si besoin autres données
    });
  }

// Fonctions helpers
  isTaskToday(task: any): boolean {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    return due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate() &&
      task.status !== 'Done';
  }

  isTaskOverdue(task: any): boolean {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    return due < today && task.status !== 'Done';
  }
  loadActivities() {
    this.taskService.getTasksByProject(this.selectedProjectId).subscribe(tasks => {
      console.log('Activities loaded:', tasks.map(t => t.activityLogs)) ;
      this.recentActivities = tasks
        .flatMap(t => t.activityLogs) // flatten all activity logs into one array
        .map((a: { user: { nom: any }; action: any; timestamp: string | number | Date }) => ({
          userName: a.user?.nom || 'Inconnu',
          action: a.action,
          timestamp: new Date(a.timestamp)
        }));
    });
  }

  formatDate(date: Date) {
    return date.toLocaleString();
  }

  openTaskModal(task: any = null): void {
    const ref = this.modalService.open(TaskModalComponent);
    ref.componentInstance.task = task;
    ref.componentInstance.assignee = task?.assignee?.map((a: { nom: any; })=>(a.nom));
    console.log("task", task?.assignee?.map((a: { nom: any; })=>(a.nom)));

    ref.componentInstance.projectId = this.selectedProjectId; // Passer le contexte projet
    ref.closed.subscribe(() =>  {this.loadTasksForProject(this.selectedProjectId),
    this.loadActivities();});
  }
}
