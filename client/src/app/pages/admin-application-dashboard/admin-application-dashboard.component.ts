import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganisationService } from '../../services/organisation.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { ChangeDetectorRef } from '@angular/core';

import {
  BrnDialogContentDirective,
  BrnDialogTriggerDirective,
} from '@spartan-ng/brain/dialog';
import {
  HlmDialogComponent,
  HlmDialogContentComponent,
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import {
  BrnAlertDialogTriggerDirective,
  BrnAlertDialogContentDirective,
} from '@spartan-ng/brain/alert-dialog';
import {
  HlmAlertDialogComponent,
  HlmAlertDialogContentComponent,
  HlmAlertDialogDescriptionDirective,
  HlmAlertDialogFooterComponent,
  HlmAlertDialogHeaderComponent,
  HlmAlertDialogTitleDirective,
  HlmAlertDialogActionButtonDirective,
} from '@spartan-ng/ui-alertdialog-helm';

@Component({
  selector: 'app-admin-application-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    BrnDialogTriggerDirective,
    BrnDialogContentDirective,
    HlmDialogComponent,
    HlmDialogContentComponent,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmInputDirective,
    HlmButtonDirective,
    BrnAlertDialogTriggerDirective,
    BrnAlertDialogContentDirective,
    HlmAlertDialogComponent,
    HlmAlertDialogHeaderComponent,
    HlmAlertDialogFooterComponent,
    HlmAlertDialogTitleDirective,
    HlmAlertDialogDescriptionDirective,
    HlmAlertDialogActionButtonDirective,
    HlmAlertDialogContentComponent,
  ],
  templateUrl: './admin-application-dashboard.component.html',
  styleUrl: './admin-application-dashboard.component.css',
})
export class AdminApplicationDashboardComponent implements OnInit {
  listOfOrganisations: any[] = [];
  editOrganisationData: any = {};
  analyticsData: any = {};
  

  doughnutChartData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171'],
      },
    ],
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151', // text-gray-700
        },
      },
    },
  };

  constructor(
    private organisationService: OrganisationService,
    private route: ActivatedRoute,
      private cdr: ChangeDetectorRef // ✅ Add this

  ) {}

  ngOnInit(): void {
    this.getAllOrganisations();
    this.loadOrganisationAnalytics();
  }

  getAllOrganisations(): void {
    this.organisationService.getAllOrganisations().subscribe({
      next: (organisations) => {
        this.listOfOrganisations = organisations;
      },
      error: (err) => {
        console.error('Failed to fetch organisations', err);
      },
    });
  }

  loadOrganisationAnalytics(): void {
  this.organisationService.getOrganisationAnalytics().subscribe({
    next: (data) => {
      this.analyticsData = data;

      const labels = data.organisationsByCategory.map((c: any) => c._id || 'Uncategorized');
      const counts = data.organisationsByCategory.map((c: any) => c.count);

      // ✅ Reassign full object to trigger change detection
      this.doughnutChartData = {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171'],
          },
        ],
      };

      // ✅ Force view update
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Analytics error', err),
  });
}

  editOrganisation(org: any): void {
    this.editOrganisationData = { ...org };
  }

  updateOrganisation(): void {
    if (!this.editOrganisationData._id) return;

    const updatedData = {
      nom: this.editOrganisationData.nom,
      matricule_fiscal: this.editOrganisationData.matricule_fiscal,
      type: this.editOrganisationData.type,
      description: this.editOrganisationData.description,
      location: this.editOrganisationData.location,
    };

    this.organisationService
      .updateOrganisationById(this.editOrganisationData._id, updatedData)
      .subscribe({
        next: (updatedOrg) => {
          const index = this.listOfOrganisations.findIndex(
            (org) => org._id === updatedOrg._id
          );
          if (index !== -1) {
            this.listOfOrganisations[index] = updatedOrg;
          }
        },
        error: (err) => {
          console.error('Failed to update organisation', err);
        },
      });
  }

  deleteOrganisationById(id: string): void {
    this.organisationService.deleteOrganisationById(id).subscribe({
      next: () => {
        this.listOfOrganisations = this.listOfOrganisations.filter(
          (org) => org._id !== id
        );
      },
      error: (err) => {
        console.error('Failed to delete organisation', err);
      },
    });
  }
}
