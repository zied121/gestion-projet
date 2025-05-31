import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe(environment.stripe.publishableKey);
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Failed to redirect to checkout:', err);
      throw err;
    }
  }

  async handleCardSetup(clientSecret: string): Promise<any> {
    try {
      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: {
            // Card details will be collected by Stripe Elements
          },
        },
      });

      if (error) {
        throw error;
      }

      return setupIntent;
    } catch (err) {
      console.error('Failed to set up card:', err);
      throw err;
    }
  }
} 