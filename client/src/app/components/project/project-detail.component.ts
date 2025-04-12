import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import {DatePipe, NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  imports: [
    NgClass,
    NgForOf,
    DatePipe
  ],
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  projectId: string = '';
  tasks: any[] = [];
  project: any;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadProject();
    this.loadTasks();
  }

  loadProject() {
    this.projectService.getProjectById(this.projectId).subscribe(p => this.project = p);
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res.filter((task: { project: string; }) => task.project === this.projectId);
    });
  }

  // 👉 Méthode à ajouter ici :
  statusClass(status: string): string {
    switch(status.toUpperCase()) {
      case 'TO DO': return 'todo';
      case 'IN PROGRESS': return 'inprogress';
      case 'DONE': return 'done';
      default: return '';
    }
  }
}
