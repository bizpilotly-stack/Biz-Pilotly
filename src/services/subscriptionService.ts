export interface PlanFeature {
  text: string;
  included: boolean;
  isNew?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  priceNGN: string;
  priceUSD: string;
  billingPeriod: string;
  description: string;
  status: 'active' | 'coming_soon';
  features: PlanFeature[];
  ctaText: string;
  highlighted?: boolean;
}

export interface UserTrialInfo {
  isInTrial: boolean;
  daysRemaining: number;
  daysElapsed: number;
  totalTrialDays: number;
  expiryDateString: string;
  tierName: string;
  hasFullAccess: boolean;
}

class SubscriptionService {
  getPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'free',
        name: 'Free Starter',
        priceNGN: '₦0',
        priceUSD: '$0',
        billingPeriod: 'forever free',
        description: 'Essential business calculation suite and standard document generation for solo freelancers.',
        status: 'active',
        ctaText: 'Start Free',
        highlighted: false,
        features: [
          { text: 'All 8 Financial & Pricing Calculators (100% Free)', included: true },
          { text: 'Standard Invoices, Quotes, Receipts & Proposals', included: true },
          { text: 'Direct Bank Transfer Details on Invoices (0% Fee)', included: true },
          { text: 'Up to 5 Saved Client Contacts', included: true },
          { text: 'Live Instant Document Preview & PDF Download', included: true },
          { text: 'Basic Profit & Revenue Overview', included: true },
          { text: 'Paystack Online Card / Apple Pay Gateway', included: false },
          { text: '100% White-Label (Remove BizPilotly Badge)', included: false },
          { text: 'Automated Client Payment Email Reminders', included: false },
          { text: 'Multi-Business Workspaces & Team Seats', included: false },
        ],
      },
      {
        id: 'pro',
        name: 'Professional',
        badge: 'Most Popular • 30-Day Free Trial',
        priceNGN: '₦4,500',
        priceUSD: '$12',
        billingPeriod: 'per month',
        description: 'Complete invoicing automation, custom branding, and online card payment acceptance for solo pros.',
        status: 'coming_soon',
        ctaText: 'Join Pro Waitlist (50% Off)',
        highlighted: true,
        features: [
          { text: 'Everything in Free Starter', included: true },
          { text: 'Unlimited Invoices, Receipts, Quotes & Proposals', included: true, isNew: true },
          { text: 'Unlimited Saved Client Contacts & Ledgers', included: true, isNew: true },
          { text: '100% White-Label Branding (Upload Custom Logo)', included: true, isNew: true },
          { text: 'Paystack Online Card & Apple Pay Gateway', included: true, isNew: true },
          { text: 'Automated Invoice & Overdue Email Reminders', included: true, isNew: true },
          { text: 'Multi-Currency Global Invoicing (USD, GBP, EUR, NGN)', included: true, isNew: true },
          { text: 'Financial Profit & Loss Analytics & Cloud Sync', included: true, isNew: true },
          { text: 'Team Member Logins & Multi-Seats', included: false },
          { text: 'Multi-Business Workspace Switching', included: false },
        ],
      },
      {
        id: 'business',
        name: 'Business Suite',
        badge: 'For Agencies & Teams',
        priceNGN: '₦12,500',
        priceUSD: '$29',
        billingPeriod: 'per month',
        description: 'Multi-entity business management, team member collaboration seats, and recurring retainer automation.',
        status: 'coming_soon',
        ctaText: 'Join Suite Waitlist',
        highlighted: false,
        features: [
          { text: 'Everything in Professional Tier', included: true },
          { text: 'Up to 5 Separate Business Entities / Brands', included: true, isNew: true },
          { text: 'Up to 5 Team Member Seats & Role Permissions', included: true, isNew: true },
          { text: 'Automated Recurring Monthly Retainer Invoices', included: true, isNew: true },
          { text: 'Dedicated Passwordless Client Portal', included: true, isNew: true },
          { text: 'Digital E-Signatures on Proposals & Contracts', included: true, isNew: true },
          { text: '1-Click Accounting & Tax CSV / Excel Export', included: true, isNew: true },
          { text: 'Priority WhatsApp & Dedicated VIP Onboarding', included: true, isNew: true },
        ],
      },
    ];
  }

  /**
   * Calculates the user's 30-Day All-Access Free Launch Trial status.
   */
  getUserTrialInfo(userCreatedAt?: string | null): UserTrialInfo {
    const TOTAL_TRIAL_DAYS = 30;

    if (!userCreatedAt) {
      return {
        isInTrial: true,
        daysRemaining: TOTAL_TRIAL_DAYS,
        daysElapsed: 0,
        totalTrialDays: TOTAL_TRIAL_DAYS,
        expiryDateString: new Date(Date.now() + TOTAL_TRIAL_DAYS * 86400000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        tierName: '30-Day VIP All-Access Pass',
        hasFullAccess: true,
      };
    }

    const createdTime = new Date(userCreatedAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - createdTime);
    const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, TOTAL_TRIAL_DAYS - daysElapsed);
    const isInTrial = daysRemaining > 0;

    const expiryDate = new Date(createdTime + TOTAL_TRIAL_DAYS * 86400000);
    const expiryDateString = expiryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      isInTrial,
      daysRemaining,
      daysElapsed,
      totalTrialDays: TOTAL_TRIAL_DAYS,
      expiryDateString,
      tierName: isInTrial ? '30-Day VIP All-Access Pass' : 'Free Starter',
      hasFullAccess: isInTrial,
    };
  }
}

export const subscriptionService = new SubscriptionService();
