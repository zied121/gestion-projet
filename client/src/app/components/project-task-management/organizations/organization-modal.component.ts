import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { OrganisationService } from '../../../services/organisation.service';

@Component({
  selector: 'app-organization-modal',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './organization-modal.component.html'
})
export class OrganizationModalComponent {
  @Input() organization: any;
  form: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private orgService: OrganisationService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    if (this.organization) {
      this.form.patchValue(this.organization);
    }
  }

  submit() {
    const data = this.form.value;
    // if (this.organization) {
    //   this.orgService.updateOrganization(this.organization._id, data).subscribe(() => this.activeModal.close());
    // } else {
      this.orgService.onCreateWorkspace(data).subscribe(() => this.activeModal.close());
    }
  // }
}
