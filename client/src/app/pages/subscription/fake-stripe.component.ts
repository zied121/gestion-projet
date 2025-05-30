import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fake-stripe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div class="flex items-center justify-center mb-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Stripe_Logo%2C_revised_2016.svg" alt="Stripe Logo" class="h-8 mr-2" />
          <span class="text-xl font-bold text-gray-700 tracking-wide">Checkout</span>
        </div>
        <form *ngIf="!success" (ngSubmit)="onSubmit($event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Card information</label>
            <div class="flex items-center border rounded px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
              <input type="text" maxlength="16" pattern="[0-9]*" inputmode="numeric" placeholder="1234 1234 1234 1234" required class="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400" />
              <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" class="h-6 ml-2" />
              <img src="https://img.icons8.com/color/48/000000/mastercard-logo.png" alt="Mastercard" class="h-6 ml-1" />
            </div>
          </div>
          <div class="flex space-x-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
              <input type="text" maxlength="5" placeholder="MM/YY" required class="w-full border rounded px-2 py-2 bg-gray-50 outline-none" />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input type="text" maxlength="3" placeholder="CVC" required class="w-full border rounded px-2 py-2 bg-gray-50 outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name on card</label>
            <input type="text" required class="w-full border rounded px-2 py-2 bg-gray-50 outline-none" placeholder="Jane Doe" />
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-lg transition">Pay $40.00</button>
        </form>
        <div *ngIf="success" class="flex flex-col items-center justify-center mt-6">
          <div class="bg-green-100 border border-green-300 rounded-full p-6 shadow-lg animate-bounce mb-4">
            <svg class="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="white" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12l3 3 5-5" />
            </svg>
          </div>
          <div class="text-green-700 text-2xl font-bold mb-2">Payment Successful!</div>
          <div class="text-green-600 text-lg mb-1">Thank you for upgrading to Premium.</div>
          <div class="text-gray-500 text-sm">Redirecting to your subscription...</div>
        </div>
        <div class="mt-6 text-center text-xs text-gray-400">This is a demo. No real payment will be processed.</div>
      </div>
    </div>
  `,
  styles: []
})
export class FakeStripeComponent {
  success = false;
  constructor(private router: Router) {}
  onSubmit(event: Event) {
    event.preventDefault();
    this.success = true;
    setTimeout(() => this.router.navigate(['/subscription']), 2000);
  }
} 