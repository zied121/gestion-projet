import { Component, Input, OnInit } from '@angular/core';
      import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
      import { ProjectService } from '../../../../services/project.service';
      import { UserService } from '../../../../services/user.service';
      import { NgForOf, NgIf } from '@angular/common';
      import { FormsModule } from '@angular/forms';
      import { OrganisationService } from '../../../../services/organisation.service';

      @Component({
        selector: 'app-assign-users-modal',
        standalone: true,
        templateUrl: './assign-users-modal.component.html',
        imports: [
          NgForOf,
          FormsModule,
          NgIf
        ],
        styleUrls: ['./assign-users-modal.component.scss']
      })
      export class AssignUsersModalComponent implements OnInit {
        @Input() projectId!: string;
        allUsers: any[] = [];
        selectedUserIds: string[] = [];
        loading = false;
        successMessage = '';

        constructor(
          public activeModal: NgbActiveModal,
          private projectService: ProjectService,
          private userService: UserService,
          private organisationService: OrganisationService
        ) {}

        ngOnInit(): void {
        this.loading = true;
        const organisation = localStorage.getItem('organisation') ?? '';
        Promise.all([
          this.organisationService.getAllUsersByOrganisation(organisation).toPromise(),
          this.projectService.getProjectById(this.projectId).toPromise()
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
        this.projectService.assignUsers(this.projectId, this.selectedUserIds).subscribe({
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
