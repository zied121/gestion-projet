import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';
// import { AssignUsersModalComponent } from '../assign-users-modal/assign-users-modal.component';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  standalone: true,
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent {
  @Input() project: any;
  @Input() progress: string = '0/0';

  constructor(private modalService: NgbModal) {}

  openDetails() {
    const ref = this.modalService.open(ProjectDetailComponent, { size: 'lg' });
    ref.componentInstance.project = this.project;
  }

  // openAssign() {
  //   const ref = this.modalService.open(AssignUsersModalComponent, { size: 'md' });
  //   ref.componentInstance.projectId = this.project._id;
  // }
}
