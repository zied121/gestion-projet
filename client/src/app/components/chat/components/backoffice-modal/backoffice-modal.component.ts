import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
      import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
      import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
      import { RoomService } from '../../services/room.service';
      import { ProjectService } from '../../../../services/project.service';
      import { OrganisationService } from '../../../../services/organisation.service';
      import {NgForOf, NgIf} from '@angular/common';

      @Component({
        selector: 'app-backoffice-modal',
        templateUrl: './backoffice-modal.component.html',
        imports: [
          ReactiveFormsModule,
          NgForOf,
          FormsModule,

        ],
        styleUrls: ['./backoffice-modal.component.css']
      })
      export class BackofficeModalComponent implements OnInit {
        @Input() isEditMode: boolean = false;
        @Input() roomData: any = null;
        @Output() save = new EventEmitter<any>();
        @Output() close = new EventEmitter<void>();

        form: FormGroup;
        projects: any[] = [];
        members: any[] = [];

        constructor(
          public activeModal: NgbActiveModal,
          private fb: FormBuilder,
          private projectService: ProjectService,
          private organisationService: OrganisationService
        ) {
          this.form = this.fb.group({
            name: ['', Validators.required],
            project: [[]],
            image: [null],
            members: [[]]
          });
        }
       ngOnInit(): void {
         this.loadProjects();
         this.loadMembers();

         if (this.roomData) {
           this.form.patchValue({
             name: this.roomData.name || '',
             description: this.roomData.description || '',
             //projectId: this.roomData.projectId || '',
             project : this.roomData.project || null,
             image: this.roomData.image || null,
             members: this.roomData.members || []
           });
         }
       }

        loadMembers(): void {
          const organisationId = localStorage.getItem('organisation');
          if (organisationId) {
            this.organisationService.getAllUsersByOrganisation(organisationId).subscribe({
              next: (res) => {
                this.members = res.users;
              },
              error: (err) => console.error('Erreur lors de la récupération des membres :', err)
            });
          }
        }

        loadProjects(): void {
          this.projectService.getProjects().subscribe({
            next: (res) => {
              this.projects = res;
            },
            error: (err) => console.error('Erreur lors de la récupération des projets :', err)
          });
        }

        onFileSelected(event: any): void {
          const file = event.target.files[0];
          if (file) {
            this.form.get('image')?.setValue(file);
          }
        }

        saveRoom(): void {
          if (this.form.value) {
            const roomData = { ...this.form.value };
            this.save.emit(roomData);
            console.log('roomData envoyé au modal :', roomData);
          } else {
            console.log('roomData invalide :', this.form.value);
            console.error('Le formulaire est invalide.');
          }
        }

        closeModal(): void {
          this.close.emit();
        }
      }
