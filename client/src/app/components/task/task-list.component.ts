import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { NgForOf } from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  imports: [
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  newTask = {
    title: '',
    description: '',
    status: 'To Do',
    project: '',
    assignee: ''
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(data => {
      this.tasks = data;
    });
  }

  createTask(): void {
    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.newTask = { title: '', description: '', status: 'To Do', project: '', assignee: '' };
      },
      error: (err) => console.error('Error creating task:', err)
    });
  }

  viewTask(taskId: string): void {
    // Logic to view task details
  }
}
