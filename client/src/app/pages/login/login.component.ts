import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';

import {
  HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective,
} from '@spartan-ng/ui-alert-helm';
import {UserService} from '../../services/user.service';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, HttpClientModule, HlmAlertDescriptionDirective, HlmAlertDirective, HlmAlertIconDirective, HlmAlertTitleDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [provideIcons({lucideTriangleAlert})],
  standalone: true
})
export class LoginComponent implements OnInit {
  email: string = '';
  motDePasse: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  otp: string = '';
  step: 'login' | 'verify_otp' = 'login';

  constructor(private authService: AuthService,private userService:UserService,private router: Router) {}

  ngOnInit() {
    this.initializeGoogleSignIn();
    this.userService.getProfile().subscribe({
      next: (res) => {
    localStorage.setItem('userId', res.user._id);
      }
    });
  }
  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: '398876415878-tcp8anmiqvpd2datpfh7t47d4rgg4ipe.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleLogin(response),
    });

    google.accounts.id.renderButton(document.getElementById('googleButtonLogin'), {
      theme: 'outline',
      size: 'large',
    });
  }

  handleGoogleLogin(response: any) {
    const credential = response.credential;

    this.authService.googleLogin(credential).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        this.router.navigate(['/blogs']);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error.msg || 'Google login failed.';
      },
    });
  }

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
