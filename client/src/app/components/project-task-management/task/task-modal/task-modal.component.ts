import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '../../../../services/task.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss']
})
export class TaskModalComponent implements OnInit {
  @Input() task: any;
  form: FormGroup;
  @Input() projectId!: string;
  protected organisationId= localStorage.getItem('organisation') || '';
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    this.form = this.fb.group({
      organisation: [''],
      title: ['', Validators.required],
      description: [''],
      status: ['To Do'],
      startDate: [''],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.form.patchValue({ organisation: this.organisationId });
    if (this.task) {
      this.form.patchValue(this.task);
    }
  }

  submit(): void {
    const data = this.form.value;
    if (this.projectId) {
      data.project = this.projectId;// injecter dans la tâche
    }

    if (this.task) {
      this.taskService.updateTask(this.task._id, data).subscribe(() => this.activeModal.close());
    } else {
      console.log(data)
      this.taskService.createTask(data).subscribe(() => this.activeModal.close());
    }

  }
}
