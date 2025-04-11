import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { OrganisationService } from '../../services/organisation.service';

@Component({
  selector: 'app-organisation-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organisation-profile.component.html',
  styleUrl: './organisation-profile.component.css'
})
export class OrganisationProfileComponent implements OnInit {
  companyData: any = {
    nom: '',
    matricule_fiscal: '',
    type: '',
    description: '',
    location: '',
    image: ''
  };

  selectedCompanyFile: File | null = null;

  constructor(
    private http: HttpClient,
    private organisationService: OrganisationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      if (id) {
        this.getOrganisationById(id);
      } else {
        console.error('No organisation ID found in route.');
      }
    });
  }

  getOrganisationById(id: string): void {
    this.organisationService.getOrganisationById(id).subscribe({
      next: (org) => this.companyData = org,
      error: (err) => console.error('Error fetching organisation:', err)
    });
  }

  onCompanyImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedCompanyFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.companyData.image = reader.result as string;
      };
      reader.readAsDataURL(this.selectedCompanyFile);
    }
  }

  saveCompanyProfile(): void {
    const formData = new FormData();
    formData.append('nom', this.companyData.nom);
    formData.append('matricule_fiscal', this.companyData.matricule_fiscal);
    formData.append('type', this.companyData.type);
    formData.append('description', this.companyData.description);
    formData.append('location', this.companyData.location);

    if (this.selectedCompanyFile) {
      formData.append('image', this.selectedCompanyFile);
    }

    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      if (id) {
        this.organisationService.updateOrganisationById(id, formData).subscribe({
          next: (res) => console.log('Company profile updated:', res),
          error: (err) => console.error('Error updating company profile:', err)
        });
      } else {
        console.error('No organisation ID found in route.');
      }
    });
  }
}
