import { Component, Input } from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone: true,
  templateUrl: './task-card.component.html',
  imports: [
    NgForOf
  ],
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task: any;
  @Input() progress: string = '0%';
}
