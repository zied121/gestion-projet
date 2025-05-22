import {Component, Input, OnChanges, OnInit} from '@angular/core';
import { TaskModalComponent } from '../../task/task-modal/task-modal.component';
import { TaskService } from '../../../../services/task.service';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ProjectService } from '../../../../services/project.service';
import {DatePipe, NgClass, NgForOf} from '@angular/common';
import {coerceStringArray} from '@angular/cdk/coercion';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  imports: [
    NgForOf,
    CdkDropList,
    NgClass,
    CdkDrag,
    DatePipe
  ],
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnChanges {
  @Input() projectId!: string;

  // Liste principale des tâches récupérées
  tasks: any[] = [];

  // Colonnes à afficher (ordre et statut)
  columns = [
    {label: 'TO DO', status: 'To Do', iconClass: 'status-todo'},
    {label: 'IN PROGRESS', status: 'In Progress', iconClass: 'status-progress'},
    {label: 'DONE', status: 'Done', iconClass: 'status-done'}
  ];

  constructor(private taskService: TaskService, private modalService: NgbModal) {
  }

  get connectedDropLists(): string[] {
    return this.columns.map(col => col.status);
  }

  getDropListId(status: string): string {
    return `list-${status.replace(/\s/g, '').toLowerCase()}`;
  }

  get dropListIds(): string[] {
    return this.columns.map(c => this.getDropListId(c.status));
  }


  ngOnChanges(): void {
    if (this.projectId) {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    this.taskService.getTasksByProject(this.projectId).subscribe((data) => {
      this.tasks = data;
      console.log('Tasks loaded:', this.tasks);
    });
  }

  getTasksByStatus(status: string): any[] {
    return this.tasks.filter(task => task.status === status);
  }

  drop(event: CdkDragDrop<any[]>, newStatus: string): void {
    const prevList = event.previousContainer.data;
    const currList = event.container.data;

    const task = prevList[event.previousIndex];
    if (task.status === newStatus) return;

    // Mise à jour locale pour UX immédiat
    task.status = newStatus;
    task.organisation = localStorage.getItem('organisation') || '';
    console.log(newStatus);


    this.taskService.updateTaskStatus(task._id, newStatus).subscribe(() => {
      transferArrayItem(prevList, currList, event.previousIndex, event.currentIndex);
    });
    console.log(`Mise à jour du statut ${task.title} → ${newStatus}`);

  }

  openTaskModal(task: any): void {
    const modalRef = this.modalService.open(TaskModalComponent, {size: 'lg'});
    modalRef.componentInstance.task = task;

    modalRef.closed.subscribe(() => {
      this.loadTasks(); // Recharge les tâches après fermeture
    });
  }
}
