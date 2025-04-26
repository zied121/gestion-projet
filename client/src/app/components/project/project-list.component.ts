import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../../../models/project.model';
import {DatePipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  imports: [
    DatePipe,
    NgForOf
  ],
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: res => this.projects = res,
      error: err => console.error('Error loading projects', err)
    });
  }

  openProject(projectId: string | undefined): void {
    this.router.navigate(['/project', projectId]);
  }
}
