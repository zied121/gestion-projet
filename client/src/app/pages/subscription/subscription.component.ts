import { Component, OnInit } from '@angular/core';
import { SubscriptionService, Subscription } from '../../services/subscription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
  isAnnual = false;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  currentSubscription: Subscription | null = null;
  prices = {
    standard: { monthly: 0, annual: 0 },
    premium: { monthly: 40, annual: 32 },
    premium_plus: { monthly: 100, annual: 80 }
  };
  showPremiumPlusForm = false;
  premiumPlusUsers = 10;
  premiumPlusProjects = 5;
  qrData: string | null = null;

  constructor(
    private subService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit() {
    // No user/organisationId check
  }

  toggleBilling() {
    this.isAnnual = !this.isAnnual;
  }

  getPrice(plan: string): number {
    return this.prices[plan as keyof typeof this.prices][this.isAnnual ? 'annual' : 'monthly'];
  }

  onPremiumPlusClick() {
    this.showPremiumPlusForm = true;
  }

  async submitPremiumPlus() {
    await this.selectPlan('premium_plus', this.premiumPlusUsers, this.premiumPlusProjects);
    // After success, set qrData to a stringified object of the plan
    this.qrData = JSON.stringify({
      plan: 'premium_plus',
      users: this.premiumPlusUsers,
      projects: this.premiumPlusProjects
    });
  }

  async selectPlan(planType: string, userLimit?: number, projectLimit?: number) {
    try {
      this.loading = true;
      this.error = null;
      this.success = null;
      const staticOrgId = 'demo-org-id';
      const subscription = await firstValueFrom(this.subService.createSubscription({
        organisationId: staticOrgId,
        planType,
        isAnnual: this.isAnnual,
        userLimit,
        projectLimit
      }));
      this.currentSubscription = {
        ...subscription,
        plan: subscription.plan || { type: (subscription as any).planType || 'standard', isAnnual: (subscription as any).isAnnual || false },
        active: subscription.active !== undefined ? subscription.active : subscription.status === 'active',
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        currentPeriodEnd: subscription.currentPeriodEnd || undefined
      };
      this.success = `Successfully subscribed to the ${planType} plan!`;
      setTimeout(() => this.router.navigate(['/dashboard']), 2000);
    } catch (err) {
      console.error('Subscription error:', err);
      this.error = 'Failed to process subscription. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  onUpgradeToPremiumClick() {
    this.router.navigate(['/fake-stripe']);
  }
}
