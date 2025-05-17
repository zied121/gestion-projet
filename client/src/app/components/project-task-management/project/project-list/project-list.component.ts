import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../services/project.service';
import { ProjectModalComponent } from '../project-modal/project-modal.component';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ProjectDetailComponent} from '../project-detail/project-detail.component';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {AssignUsersModalComponent} from '../assign-users-modal/assign-users-modal.component';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  imports: [
    NgForOf,
    FormsModule,
    NgIf,
    NgClass,
    ProjectCardComponent,
    RouterLink,
    DatePipe
  ],
  standalone: true,
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: any[] = [];
  expandedProjectId: string | null = null;
  useCardView = false;

  constructor(private projectService: ProjectService, private modalService: NgbModal,private router: Router) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
    });
  }

  calculateProgress(tasks: any[]): string {
    const completed = tasks.filter(t => t.status === 'DONE').length;
    return `${completed}/${tasks.length}`;
  }

  openProjectModal(project?: any) {
    const modalRef = this.modalService.open(ProjectModalComponent, { size: 'lg' });
    if (project) modalRef.componentInstance.project = { ...project };
    modalRef.closed.subscribe(() => this.loadProjects());
  }

  openProjectDetail(project: any) {
    const modalRef = this.modalService.open(ProjectDetailComponent, { size: 'lg' });
    modalRef.componentInstance.project = project;
  }

  deleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(() => this.loadProjects());
    }
  }

 toggleExpand(projectId: string) {
    if (this.expandedProjectId === projectId) {
      this.expandedProjectId = null;
    } else {
      this.expandedProjectId = projectId;
      const project = this.projects.find(p => p._id === projectId);
      if (project && project.members) {
        this.projectService.getProjectUsers(projectId).subscribe(users => {
          console.log(users);
          project.members = users;
        });
      }
    }
  }

assignUsers(projectId: string) {
  const modalRef = this.modalService.open(AssignUsersModalComponent, { size: 'lg' });
  modalRef.componentInstance.projectId = projectId;
  modalRef.closed.subscribe(() => this.loadProjects());
}

}
