export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
  stripe: {
    publishableKey: 'pk_test_your_stripe_publishable_key', // Replace with your Stripe test publishable key
    successUrl: 'http://localhost:4200/success',
    cancelUrl: 'http://localhost:4200/cancel'
  }
}; 