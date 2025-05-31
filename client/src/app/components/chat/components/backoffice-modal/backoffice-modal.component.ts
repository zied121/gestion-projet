import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { ProjectService } from '../../../../services/project.service';
import { OrganisationService } from '../../../../services/organisation.service';
import { NgForOf, NgIf } from '@angular/common';
import { Room } from '../../../../../../models/room.model';

@Component({
  selector: 'app-backoffice-modal',
  templateUrl: './backoffice-modal.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, NgForOf, FormsModule, NgIf],
  styleUrls: ['./backoffice-modal.component.css']
})
export class BackofficeModalComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() roomData: Room | null = null;
  @Output() save = new EventEmitter<FormData>();
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
      project: ['', Validators.required],
      image: [null],
      members: [[]]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadMembers();

    if (this.isEditMode && this.roomData) {
      this.form.patchValue({
        name: this.roomData.name || '',
        project: this.roomData.project?._id || '',
        members: this.roomData.members || []
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

  loadMembers(): void {
    const organisationId = localStorage.getItem('organisation');
    if (organisationId) {
      this.organisationService.getAllUsersByOrganisation(organisationId).subscribe({
        next: (res) => {
          this.members = res.users.map((user: { nom: any }) => user.nom);
        },
        error: (err) => console.error('Erreur lors de la récupération des membres :', err)
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.form.get('image')?.setValue(file);
    }
  }


  saveRoom(): void {
    if (this.form.valid) {
      const formData = new FormData();
      formData.append('name', this.form.get('name')?.value);
      formData.append('project', this.form.get('project')?.value);

      const file = this.form.get('image')?.value;
      if (file) {
        formData.append('image', file);
      }

      const members = this.form.get('members')?.value;
      if (Array.isArray(members)) {
        members.forEach((member: string) => {
          formData.append('members', member);
        });
      }

      this.save.emit(formData);
    } else {
      console.error('Le formulaire est invalide :', this.form.value);
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
