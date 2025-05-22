import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmCardContentDirective,
  HlmCardDescriptionDirective,
  HlmCardDirective,
  HlmCardFooterDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';

import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import {
  HlmTabsComponent,
  HlmTabsContentDirective,
  HlmTabsListComponent,
  HlmTabsTriggerDirective,
} from '@spartan-ng/ui-tabs-helm';

import {OrganisationService} from '../../services/organisation.service'; // adjust path if
import { Router } from '@angular/router';

@Component({
  selector: 'app-workspaceform',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,

    HlmTabsComponent,
    HlmTabsListComponent,
    HlmTabsTriggerDirective,
    HlmTabsContentDirective,

    HlmCardContentDirective,
    HlmCardDescriptionDirective,
    HlmCardDirective,
    HlmCardFooterDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,

    HlmLabelDirective,
    HlmInputDirective,
    HlmButtonDirective,


    HlmBadgeDirective,
  ],
  templateUrl: './workspaceform.component.html',
  styleUrls: ['./workspaceform.component.css'] ,
  providers: [provideIcons({ lucideTriangleAlert })]
})
export class WorkspaceformComponent {
  createWorkspaceForm: FormGroup;
  joinWorkspaceForm: FormGroup;


  constructor( private fb: FormBuilder,private router: Router , private organisationService: OrganisationService) {
    this.createWorkspaceForm = this.fb.group({
      nom: ['', Validators.required],
      matricule_fiscal: ['', Validators.required],
    });

    this.joinWorkspaceForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  susccessMessage: string = '';


  onCreateWorkspace(): void {
    if (this.createWorkspaceForm.valid) {
      this.organisationService.onCreateWorkspace(this.createWorkspaceForm.value).subscribe({
        next: (response: any) => {
          console.log("reponse", response); 
          this.showSuccess = true;
          this.susccessMessage = response.message;
          
          this.router.navigate(['/workspace/' + response.organisation._id ]);
        },
        error: (err: any) => {
          this.showError = true;
          this.errorMessage = err.error.message;
        }
      });
    }
  }
  onJoinWorkspace(): void {
    if (this.joinWorkspaceForm.valid) {
      this.organisationService.onJoinWorkspace(this.joinWorkspaceForm.value).subscribe({
        next: (response: any) => {
          this.showSuccess = true;
          this.susccessMessage = response.message;
        },
        error: (err: any) => {
          this.showError = true;
          this.errorMessage = err.error.message;
        }
      });
    }
  }

  ngOnInit(): void {
  this.organisationService.checkOrganisation().subscribe({
    next: (response: any) => {
      console.log(response.organisation);
      localStorage.setItem('organisation', response.organisation);
      this.router.navigate(['/workspace/' + response.organisation]);
  },
  error: (err: any) => {
    console.log(err);
  }
});
  }
}
