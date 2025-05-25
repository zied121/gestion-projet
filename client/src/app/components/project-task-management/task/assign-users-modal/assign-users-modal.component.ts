import { Component, Input, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../services/user.service';
import { TaskService } from '../../../../services/task.service';
import {NgForOf, NgIf} from '@angular/common';
import {OrganisationService} from '../../../../services/organisation.service';

@Component({
  selector: 'app-assign-users-modal',
  standalone: true,
  templateUrl: './assign-users-modal.component.html',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    FormsModule
  ],
  styleUrls: ['./assign-users-modal.component.scss']
})
export class AssignUsersModalComponent implements OnInit {
  @Input() taskId!: string;
  form!: FormGroup;
  allUsers: any[] = [];
  loading = false;
  selectedUserIds: string[] = [];
  successMessage = '';
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UserService,private organisationService:OrganisationService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const organisation = localStorage.getItem('organisation') ?? '';
    Promise.all([
      this.organisationService.getAllUsersByOrganisation(organisation).toPromise(),
      this.taskService.getTaskById(this.taskId).toPromise()
    ])
      .then(([users, project]) => {
        console.log('Valeur de users:', users);
        this.allUsers = Array.isArray(users?.users) ? users.users : [];
        this.selectedUserIds = Array.isArray(project?.members)
          ? project.members.map((u: any) => u._id)
          : [];
        console.log('selectedUserIds:', this.selectedUserIds);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des données :', error);
      })
      .finally(() => (this.loading = false));
  }

  submit() {
    if (this.selectedUserIds.length === 0) {
      console.error('Aucun utilisateur sélectionné.');
      return;
    }
    console.log('selectedUserIds:', this.selectedUserIds);
    const SUCCESS_MESSAGE_TIMEOUT = 1200;
    console.log("taskId:", this.taskId);
    this.taskService.assignUsers(this.taskId, this.selectedUserIds).subscribe({
      next: () => {
        this.successMessage = 'Utilisateurs assignés avec succès ✅';
        setTimeout(() => this.activeModal.close('updated'), SUCCESS_MESSAGE_TIMEOUT);
      },
      error: (err) => {
        console.error('Erreur lors de l\'assignation des utilisateurs :', err);
      }
    });
  }
}
