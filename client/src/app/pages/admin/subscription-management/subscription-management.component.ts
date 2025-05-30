import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService, SubscriptionWithOrganization } from '../../../services/subscription.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-management.component.html',
  styleUrls: ['./subscription-management.component.css']
})
export class SubscriptionManagementComponent implements OnInit {
  subscriptions: SubscriptionWithOrganization[] = [];
  subscriptionStats = {
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalOrganizations: 0,
    totalUsers: 0
  };
  loading = false;
  error: string | null = null;

  constructor(private subService: SubscriptionService) {}

  ngOnInit() {
    this.loadSubscriptions();
  }

  private async loadSubscriptions() {
    try {
      this.loading = true;
      this.error = null;
      const response = await firstValueFrom(this.subService.getAllSubscriptions());
      this.subscriptions = (response as any[]).map(sub => ({
        ...sub,
        organizationName: sub.organizationName || '',
        organizationId: sub.organizationId || sub.organisationId || '',
        userCount: sub.userCount || 0,
        totalRevenue: sub.totalRevenue || 0,
        plan: sub.plan || { type: sub.planType || 'standard', isAnnual: sub.isAnnual || false },
        active: sub.active !== undefined ? sub.active : (sub.status === 'active' ? true : false),
        currentPeriodEnd: sub.currentPeriodEnd || undefined
      }));
      this.calculateStats();
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      this.error = 'Failed to load subscriptions. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  private calculateStats() {
    this.subscriptionStats.activeSubscriptions = this.subscriptions.filter(sub => sub.active).length;
    this.subscriptionStats.totalOrganizations = this.subscriptions.length;
    this.subscriptionStats.totalUsers = this.subscriptions.reduce((acc, sub) => acc + sub.userCount, 0);
    this.subscriptionStats.monthlyRevenue = this.subscriptions
      .filter(sub => sub.active)
      .reduce((acc, sub) => acc + sub.totalRevenue, 0);
  }

  async cancelSubscription(organizationId: string) {
    try {
      this.loading = true;
      await firstValueFrom(this.subService.cancelSubscription(organizationId));
      await this.loadSubscriptions();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      this.error = 'Failed to cancel subscription. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  async resumeSubscription(organizationId: string) {
    try {
      this.loading = true;
      await firstValueFrom(this.subService.resumeSubscription(organizationId));
      await this.loadSubscriptions();
    } catch (err) {
      console.error('Failed to resume subscription:', err);
      this.error = 'Failed to resume subscription. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  getPlanBadgeClass(plan: string): string {
    const baseClasses = 'inline-flex rounded-full px-2 text-xs font-semibold leading-5 ';
    switch (plan) {
      case 'premium_plus':
        return baseClasses + 'bg-purple-100 text-purple-800';
      case 'premium':
        return baseClasses + 'bg-green-100 text-green-800';
      default:
        return baseClasses + 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(active: boolean): string {
    const baseClasses = 'inline-flex rounded-full px-2 text-xs font-semibold leading-5 ';
    return active
      ? baseClasses + 'bg-green-100 text-green-800'
      : baseClasses + 'bg-red-100 text-red-800';
  }
} 