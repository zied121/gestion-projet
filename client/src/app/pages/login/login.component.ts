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
  selector: 'app-login',
  imports: [CommonModule, 
    FormsModule, 
    HttpClientModule, 
    HlmAlertDescriptionDirective,
    HlmAlertDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
    
  ],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [provideIcons({ lucideTriangleAlert },
  ),
    
  ],

})
export class LoginComponent {
  email: string = '';
  motDePasse: string = '';
  showError: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService,private router: Router) {}



  onSubmit() {
    const payload = { email: this.email, motDePasse: this.motDePasse };

    this.authService.login(payload).subscribe({
      next: (response:any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        this.showError = false;
        this.router.navigate(['/workspaceform']);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error.msg || 'An error occurred during login.';
      }
    });
  }
}




