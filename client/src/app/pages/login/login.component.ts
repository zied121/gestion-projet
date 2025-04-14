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



  otp: string = '';
step: 'login' | 'verify_otp' = 'login';

onSubmit() {
  const payload = { email: this.email, motDePasse: this.motDePasse };
  this.authService.login(payload).subscribe({
    next: (response: any) => {
      if (response.step === 'verify_otp') {
        this.step = 'verify_otp';
        this.showError = false;
      }
    },
    error: (err) => {
      this.showError = true;
      this.errorMessage = err.error.msg || 'Login failed.';
    }
  });
}

verifyOtp() {
  const payload = { email: this.email, otp: this.otp };
  this.authService.verifyOtp(payload).subscribe({
    next: (res: any) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      this.router.navigate(['/workspaceform']);
    },
    error: (err) => {
      this.showError = true;
      this.errorMessage = err.error.msg || 'OTP failed.';
    }
  });
}
}




