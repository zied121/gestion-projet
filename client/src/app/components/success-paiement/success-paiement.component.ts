import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-paiement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="22" stroke-width="2"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 24l6 6 12-12"/>
            </svg>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Payment Successful!
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              Thank you for your subscription. Your account has been upgraded.
            </p>
            <div class="mt-6">
              <button (click)="goToDashboard()" 
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SuccessPaiementComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // You can handle any query parameters from Stripe here
    this.route.queryParams.subscribe(params => {
      if (params['session_id']) {
        // You might want to verify the session with your backend
        console.log('Stripe session ID:', params['session_id']);
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
