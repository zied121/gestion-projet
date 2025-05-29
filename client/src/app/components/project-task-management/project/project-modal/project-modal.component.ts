import {Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ProjectService } from '../../../../services/project.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {OrganisationService} from '../../../../services/organisation.service';
import {AiService} from '../../../../services/ai.service';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {NotificationService} from '../../../../services/notification.service';
import { ToastrModule } from 'ngx-toastr';
@Component({
  selector: 'app-project-modal',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    NgForOf,
    ToastrModule,
  ],
  templateUrl: './project-modal.component.html'
})

export class ProjectModalComponent implements OnInit {
  @Input() project: any;
  form: FormGroup;
  members: any[] = [];
  protected organisationId= localStorage.getItem('organisation') || '';
  selectedMembers: string[] = [];
  loadingTitle: boolean = false;  // Loader pour le titre
  loadingDescription: boolean = false;  // Loader pour la description
  timeoutError: boolean = false; // Erreur de timeout si génération prend trop de temps

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private projectService: ProjectService,private organisationService:OrganisationService, private aiService:AiService
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
      this.selectedMembers = this.project.members || [];
    }

    this.organisationService.getAllUsersByOrganisation(this.organisationId).subscribe({
      next: (response) => {
        this.members = response.users;
        console.log(this.members);
      },
      error: (err) => console.error('Erreur lors de la récupération des membres:', err),
    });
    ///////////
    // Détecter les changements sur le champ 'name' (titre) pour générer description automatiquement
    this.form.get('name')?.valueChanges.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && (!this.form.get('description')?.value || this.form.get('description')?.value.trim() === '')) {
        this.loadingDescription = true;
        this.timeoutError = false;
        this.aiService.generateTitleOrDescription(value, 'description').subscribe(
          res => {
            this.form.patchValue({ description: res.generated });
            this.loadingDescription = false;
          },
          error => {
            this.timeoutError = true;
            this.loadingDescription = false;
            console.error(error);
          //   this.notificationService.showError('Une erreur est survenue lors de la génération.', error.message || error);
           }
        );
      }
    });

    // Détecter les changements sur le champ 'description' pour générer titre automatiquement
    this.form.get('description')?.valueChanges.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && (!this.form.get('name')?.value || this.form.get('name')?.value.trim() === '')) {
        this.loadingTitle = true;
        this.timeoutError = false;
        this.aiService.generateTitleOrDescription(value, 'title').subscribe(
          res => {
            this.form.patchValue({ name: res.generated });
            this.loadingTitle = false;
          },
          error => {
            this.timeoutError = true;
            this.loadingTitle = false;
            console.error(error);
          }
        );
      }
    });
  }

  get membersArray(): FormArray {
    return this.form.get('members') as FormArray;
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
  // onTitleChange(title: string) {
  //   this.aiService.generateTitleOrDescription({ input: title, type: 'description' })
  //     .subscribe(res => {
  //       this.form.patchValue({ description: res.generated });
  //     });
  // }
  //
  // onDescriptionChange(desc: string) {
  //   this.aiService.generateTitleOrDescription({ input: desc, type: 'title' })
  //     .subscribe(res => {
  //       this.form.patchValue({ name: res.generated });
  //     });
  // }

}
