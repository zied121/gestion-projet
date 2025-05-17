import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../../services/project.service';
import {DatePipe, NgIf} from '@angular/common';
import {Project} from '../../../../../../models/project.model';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  imports: [
    DatePipe,
    NgIf
  ],
  standalone: true,
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  members: any[] | undefined = [];

  constructor(private route: ActivatedRoute, private projectService: ProjectService) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.projectService.getProjectById(projectId).subscribe((data) => {
        this.project = data;

      });

    }
    this.members = this.project?.members?.map(a=>(a.nom));
  }
}
