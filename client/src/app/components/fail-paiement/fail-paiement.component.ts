import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fail-paiement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="22" stroke-width="2"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 16l16 16m0-16L16 32"/>
            </svg>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Payment Failed
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              We couldn't process your payment. Please try again or contact support if the problem persists.
            </p>
            <div class="mt-6 space-y-4">
              <button (click)="tryAgain()" 
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Try Again
              </button>
              <button (click)="contactSupport()" 
                      class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FailPaiementComponent {
  constructor(private router: Router) {}

  tryAgain() {
    this.router.navigate(['/subscription']);
  }

  contactSupport() {
    // Implement your support contact logic here
    window.location.href = 'mailto:support@yourdomain.com';
  }
}
