import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../services/project.service';
import { ProjectModalComponent } from '../project-modal/project-modal.component';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { AssignUsersModalComponent } from '../assign-users-modal/assign-users-modal.component';
import {Router, RouterLink} from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import {NgForOf, NgIf, NgClass, DatePipe} from '@angular/common';
import {NgChartsModule} from 'ng2-charts';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  imports: [
    NgChartsModule,
    NgIf,
    NgClass,
    DatePipe,
    ProjectCardComponent,
    NgForOf,
    RouterLink
  ],
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: any[] = [];
  expandedProjectId: string | null = null;
  useCardView = false;
  taskStatusChartData: ChartData = { labels: [], datasets: [] };
  memberStatsChartData: ChartData = { labels: [], datasets: [] };

  constructor(
    private projectService: ProjectService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
      this.updateDashboardCharts(data);
    });
  }

updateDashboardCharts(projects: any[]) {
  const taskStatusCounts: { [key: string]: number } = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
  const memberStats: { [key: string]: number } = {};

  projects.forEach((project: { tasks: { status: string }[]; members: { nom: string }[] }) => {
    project.tasks.forEach((task: { status: string }) => {
      taskStatusCounts[task.status]++;
    });

    project.members.forEach((member: { nom: string }) => {
      memberStats[member.nom] = memberStats[member.nom] ? memberStats[member.nom] + 1 : 1;
    });
  });

  // Update Task Status Chart
  this.taskStatusChartData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      data: [taskStatusCounts['To Do'], taskStatusCounts['In Progress'], taskStatusCounts['Done']],
      backgroundColor: ['#ffb3b3', '#ffcc00', '#99ff99']
    }]
  };

  // Update Member Stats Chart
  this.memberStatsChartData = {
    labels: Object.keys(memberStats),
    datasets: [{
      data: Object.values(memberStats),
      backgroundColor: '#66b3ff'
    }]
  };
}

  taskStatusChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.raw + ' Tâches';
          }
        }
      }
    }
  };

  memberStatsChartOptions: ChartOptions = {
    responsive: true,
    indexAxis: 'x',
    plugins: {
      legend: {
        display: false
      }
    }
  };

  calculateProgress(tasks: any[]): string {
    const completed = tasks.filter((t) => t.status === 'Done').length;
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
      const project = this.projects.find((p) => p._id === projectId);
      if (project && project.members) {
        this.projectService.getProjectUsers(projectId).subscribe((users) => {
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

  // onProjectChange(event: any): void {
  //   this.selectedProjectId = event.target.value;
  //   this.loadProjects(); // Re-load projects when a new project is selected
  // }
}
