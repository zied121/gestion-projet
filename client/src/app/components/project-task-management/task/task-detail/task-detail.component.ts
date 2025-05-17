import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {DatePipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  templateUrl: './task-detail.component.html',
  imports: [
    NgForOf,
    DatePipe
  ],
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent {
  @Input() task: any;
  @Input() assignee: any;

  constructor(public activeModal: NgbActiveModal) {
  }
}
