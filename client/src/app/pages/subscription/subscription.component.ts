import { Component } from '@angular/core';
import { SubscriptionService } from '../../services/subscription.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-subscription',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.component.html'
})
export class SubscriptionComponent {
  organisationId = '67e35115f2817b3022b910a6'; // Replace dynamically
  email = 'zied.s@convergen.io'; // Replace dynamically

  constructor(private subService: SubscriptionService) {}

  selectPlan(type: string) {
    this.subService.createSubscription({
      organisationId: this.organisationId,
      email: this.email,
      type
    }).subscribe(res => {
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl; // Redirect to Stripe checkout
      } else {
        alert('Standard subscription activated (free)');
      }
    });
  }
}
