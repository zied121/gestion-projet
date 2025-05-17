import { Component, OnInit } from '@angular/core';
import { OrganisationService } from '../../../services/organisation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationModalComponent } from './organization-modal.component';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  imports: [
    NgForOf,
    NgIf
  ],
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {
  organizations: any[] = [];
  expandedOrgId: string | null = null;

  constructor(private orgService: OrganisationService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.orgService.getOrganizations().subscribe((data) => {
      this.organizations = data;
    });
  }

  toggleExpand(orgId: string) {
    this.expandedOrgId = this.expandedOrgId === orgId ? null : orgId;
  }

  openModal(org?: any) {
    const modalRef = this.modalService.open(OrganizationModalComponent);
    if (org) modalRef.componentInstance.organization = { ...org };

    modalRef.closed.subscribe(() => this.loadOrganizations());
  }

  deleteOrganization(id: string) {
    if (confirm('Are you sure you want to delete this organization?')) {
      this.orgService.deleteOrganization(id).subscribe(() => this.loadOrganizations());
    }
  }

  goToProjects(orgId: string) {
    // Implement routing logic (e.g., router.navigate)
  }

  addUser(orgId: string) {
    // Future implementation for linking user
  }
}
