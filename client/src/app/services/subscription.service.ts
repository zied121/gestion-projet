import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubscriptionPlan {
  type: 'standard' | 'premium' | 'premium_plus';
  isAnnual: boolean;
}

export interface Subscription {
  id?: string;
  organisationId: string;
  plan: SubscriptionPlan;
  price: number;
  status: SubscriptionStatus;
  createdAt?: Date;
  active?: boolean;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: Date;
}

export type SubscriptionStatus = 'active' | 'cancelled';

export interface SubscriptionWithOrganization extends Subscription {
  organizationName: string;
  organizationId: string;
  userCount: number;
  totalRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private baseUrl = `${environment.apiUrl}/api/subscription`;

  constructor(private http: HttpClient) {}

  // Create a new subscription
  createSubscription(data: {
    organisationId: string;
    planType: string;
    isAnnual: boolean;
    userLimit?: number;
    projectLimit?: number;
  }): Observable<Subscription> {
    const price = this.calculatePrice(data.planType, data.isAnnual);
    return this.http.post<Subscription>(this.baseUrl, {
      ...data,
      price,
      status: 'active'
    });
  }

  // Get all subscriptions
  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.baseUrl);
  }

  // Get subscription by organisation ID
  getSubscriptionByOrg(orgId: string): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/organisation/${orgId}`);
  }

  // Cancel subscription
  cancelSubscription(id: string): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.baseUrl}/${id}`, {
      status: 'cancelled'
    });
  }

  // Resume subscription
  resumeSubscription(id: string): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.baseUrl}/${id}/resume`, {});
  }

  // Helper method to calculate price
  private calculatePrice(planType: string, isAnnual: boolean): number {
    const prices = {
      standard: { monthly: 0, annual: 0 },
      premium: { monthly: 40, annual: 384 }, // 32 * 12
      premium_plus: { monthly: 100, annual: 960 } // 80 * 12
    };

    return prices[planType as keyof typeof prices][isAnnual ? 'annual' : 'monthly'];
  }
}
