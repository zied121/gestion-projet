import {Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ProjectService } from '../../../../services/project.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {OrganisationService} from '../../../../services/organisation.service';

@Component({
  selector: 'app-project-modal',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    NgForOf
  ],
  standalone: true,
  templateUrl: './project-modal.component.html'
})

export class ProjectModalComponent implements OnInit {
  @Input() project: any;
  form: FormGroup;
  members: any[] = [];
  protected organisationId= localStorage.getItem('organisation') || '';

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private projectService: ProjectService,private organisationService:OrganisationService
  ) {

    this.form = this.fb.group({
      organisation: [''],
      name: ['', Validators.required],
      description: [''],
      status: ['Planned', Validators.required],
      start_date: [''],
      end_date: [''],
      members: this.fb.array([]),
    });

  }

  ngOnInit() {
    console.log(this.organisationId);
    this.form.patchValue({ organisation: this.organisationId });
    if (this.project) {
      this.form.patchValue(this.project);
    }

    this.organisationService.getAllUsersByOrganisation(this.organisationId).subscribe({
      next: (response) => {
        this.members = response.users;
        console.log(this.members);
      },
      error: (err) => console.error('Erreur lors de la récupération des membres:', err),
    });
  }
  onMemberChange(event: any, userId: string): void {
  const membersArray = this.form.get('members') as FormArray;
    console.log("membersArray",membersArray);
    if (event.target.checked) {
      membersArray.push(this.fb.control(userId));
      console.log(membersArray);
    } else {
      const index = membersArray.controls.findIndex((control) => control.value === userId);
      membersArray.removeAt(index); // Supprimer un membre
    }
  }

submit() {
  const formValue = this.form.value;

  // Supprimez les doublons dans les membres
  formValue.members = Array.from(new Set((this.form.get('members') as FormArray).value));

  if (this.project) {
    this.projectService.updateProject(this.project._id, formValue).subscribe(() => {
      console.log('Projet mis à jour avec succès :', formValue);
      this.activeModal.close();
    });
  } else {
    this.projectService.createProject(formValue).subscribe(() => {
      console.log('Projet créé avec succès :', formValue);
      this.activeModal.close();
    });
  }
}
}
