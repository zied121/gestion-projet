import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';
import {
  HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective,
} from '@spartan-ng/ui-alert-helm';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HlmAlertDescriptionDirective,
    HlmAlertDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [
    provideIcons({ lucideTriangleAlert }),
  ],
})
export class LoginComponent implements OnInit {
  email: string = '';
  motDePasse: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/workspaceform';
  subscriptionPlan: string | null = null;
  isAnnual: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get return URL and subscription parameters from route parameters
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
      if (params['plan']) {
        this.subscriptionPlan = params['plan'];
      }
      if (params['isAnnual']) {
        this.isAnnual = params['isAnnual'] === 'true';
      }
    });
  }

  otp: string = '';
  step: 'login' | 'verify_otp' = 'login';

  onSubmit() {
    const payload = { email: this.email, motDePasse: this.motDePasse };
    this.authService.login(payload).subscribe({
      next: (response: any) => {
        if (response.step === 'verify_otp') {
          this.step = 'verify_otp';
          this.showError = false;
        } else {
          // Store subscription plan details if they exist
          if (this.subscriptionPlan) {
            sessionStorage.setItem('pendingPlanSelection', this.subscriptionPlan);
            if (this.isAnnual) {
              sessionStorage.setItem('planBillingType', 'annual');
            }
          }
          // Navigate to the return URL
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error?.msg || 'Login failed.';
      }
    });
  }

  verifyOtp() {
    const payload = { email: this.email, otp: this.otp };
    this.authService.verifyOtp(payload).subscribe({
      next: (res: any) => {
        // Store subscription plan details if they exist
        if (this.subscriptionPlan) {
          sessionStorage.setItem('pendingPlanSelection', this.subscriptionPlan);
          if (this.isAnnual) {
            sessionStorage.setItem('planBillingType', 'annual');
          }
        }
        // Navigate to the return URL
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err.error?.msg || 'OTP verification failed.';
      }
    });
  }
}




