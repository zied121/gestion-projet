import { Component,OnInit  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // adjust path if needed
import { Router } from '@angular/router';

import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';
declare const google: any; // Declare google object globally

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
  styleUrl: './signup.component.css',
  providers: [provideIcons({ lucideTriangleAlert },
  ),
    
  ],
    
})
export class SignupComponent implements OnInit {
  nom: string = '';
  email: string = '';
  motDePasse: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.initializeGoogleSignIn();
  }

  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: '398876415878-tcp8anmiqvpd2datpfh7t47d4rgg4ipe.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleResponse(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('googleButton'),
      { theme: 'outline', size: 'large', text: 'signup_with' } // Set text to "Sign up with Google"
    );
  }

  handleGoogleResponse(response: any) {
    const credential = response.credential; // The JWT token from Google

    this.authService.googleRegister(credential).subscribe({
      next: (res:any) => {
        this.showSuccess = true;
        this.successMessage = res.msg || 'Registered successfully!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error.msg || 'Google signup failed';
      }
    });
  }

  onSubmit() {
    const payload = { email: this.email, motDePasse: this.motDePasse, nom: this.nom };

    this.authService.signup(payload).subscribe({
      next: (response) => {
        this.showSuccess = true;
        this.successMessage = response.msg;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error.msg || 'An error occurred';
      }
    });
  }
}
