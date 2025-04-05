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
  selector: 'app-forgetpswd',
  imports: [
    FormsModule, 
    HttpClientModule, 
    HlmAlertDescriptionDirective,
    HlmAlertDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
  ],
  templateUrl: './forgetpswd.component.html',
  styleUrl: './forgetpswd.component.css'
})
export class ForgetpswdComponent {
  email: string = '';
  showError: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService,private router: Router) {}

  onSubmit() {
   

    this.authService.forgetPassword(this.email).subscribe({
      next: (response:any) => {
       console.log(response);
        this.showError = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error.msg || 'An error occurred during login.';
      }
    });
  }
}
