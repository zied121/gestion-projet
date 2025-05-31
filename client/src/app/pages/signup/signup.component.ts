import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // adjust path if needed
import { Router } from '@angular/router';

import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';

import {   HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective, } from '@spartan-ng/ui-alert-helm'; 

@Component({
  selector: 'app-signup',
  imports: [
    FormsModule, 
    HttpClientModule, 
    HlmAlertDescriptionDirective,
    HlmAlertDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  nom : string = '';
  email: string = '';
  motDePasse: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';

  constructor(private authService: AuthService,private router: Router) {}



  onSubmit() {
    const payload = { email: this.email, motDePasse: this.motDePasse, nom: this.nom };

    this.authService.signup(payload).subscribe({
      next: (response) => {
      
        this.showSuccess = true;
        this.successMessage = response.msg;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000); // Wait for 3 seconds before redirecting
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error.msg || 'An error occurred';
      }
    });
  }
}
