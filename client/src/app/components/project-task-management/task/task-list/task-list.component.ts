import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '../../../../services/task.service';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { AssignUsersModalComponent } from '../assign-users-modal/assign-users-modal.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  expandedTaskId: string | null = null;
  projectId: string | null = null;
  protected projectname: any;
  constructor(private taskService: TaskService,
              private modalService: NgbModal,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('projectId');
      this.loadTasks();

    });
  }

  loadTasks(): void {
    if (this.projectId) {
      this.taskService.getTasksByProject(this.projectId).subscribe(tasks => {
        this.tasks = tasks;
       this.projectname = this.tasks[0].project.name;
      });
    } else {
      this.taskService.getTasks().subscribe(tasks => {
        this.tasks = tasks;
        this.projectname = this.tasks[0].project.name;
      });
    }
  }

  openTaskModal(task: any = null): void {
    const ref = this.modalService.open(TaskModalComponent);
    ref.componentInstance.task = task;
    ref.componentInstance.assignee = task?.assignee?.map((a: { nom: any; })=>(a.nom));
    console.log("task", task?.assignee?.map((a: { nom: any; })=>(a.nom)));

    ref.componentInstance.projectId = this.projectId; // Passer le contexte projet
    ref.closed.subscribe(() => this.loadTasks());
  }
  openTaskDetail(task: any) {
    const ref = this.modalService.open(TaskDetailComponent, { size: 'lg' });
    ref.componentInstance.task = task;
    ref.componentInstance.assignee = task.assignee.map((a: { nom: any; })=>(a.nom));
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
  }

  assignUsers(taskId: string) {
    const ref = this.modalService.open(AssignUsersModalComponent);
    ref.componentInstance.taskId = taskId;
    ref.closed.subscribe(() => this.loadTasks());
  }

  toggleExpand(taskId: string) {
    this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
  }
}

