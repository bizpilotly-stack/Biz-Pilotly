export interface PlanFeature {
  text: string;
  included: boolean;
  isNew?: boolean;
}

export type CurrencyType = 'NGN' | 'USD' | 'EUR';

export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'business';
  name: string;
  badge?: string;
  priceNGN: string;
  priceUSD: string;
  priceEUR: string;
  amountNGN: number;
  amountUSD: number;
  amountEUR: number;
  billingPeriod: string;
  trialText: string;
  description: string;
  status: 'active' | 'coming_soon';
  features: PlanFeature[];
  ctaText: string;
  highlighted?: boolean;
}

class SubscriptionService {
  getPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'free',
        name: 'Free Starter',
        priceNGN: '₦0',
        priceUSD: '$0',
        priceEUR: '€0',
        amountNGN: 0,
        amountUSD: 0,
        amountEUR: 0,
        billingPeriod: 'forever free',
        trialText: 'No credit card needed',
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
        badge: '15-Day Free Trial',
        priceNGN: '₦5,000',
        priceUSD: '$4',
        priceEUR: '€4',
        amountNGN: 5000,
        amountUSD: 4,
        amountEUR: 4,
        billingPeriod: 'per month',
        trialText: '15-Day Free Trial Included',
        description: 'Complete invoicing automation, custom branding, and online card payment acceptance for solo pros.',
        status: 'coming_soon',
        ctaText: 'Start 15-Day Free Trial',
        highlighted: true,
        features: [
          { text: 'Everything in Free Starter', included: true },
          { text: '15-Day Free Trial on Launch', included: true, isNew: true },
          { text: 'Unlimited Invoices, Receipts, Quotes & Proposals', included: true, isNew: true },
          { text: 'Unlimited Saved Client Contacts & Ledgers', included: true, isNew: true },
          { text: '100% White-Label Branding (Upload Custom Logo)', included: true, isNew: true },
          { text: 'Paystack Online Card & Apple Pay Gateway', included: true, isNew: true },
          { text: 'Automated Invoice & Overdue Email Reminders', included: true, isNew: true },
          { text: 'Multi-Currency Global Invoicing (USD, GBP, EUR, NGN)', included: true, isNew: true },
          { text: 'Financial Profit & Loss Analytics & Cloud Sync', included: true, isNew: true },
          { text: 'Team Member Logins & Multi-Seats', included: false },
        ],
      },
      {
        id: 'business',
        name: 'Business Suite',
        badge: '15-Day Free Trial',
        priceNGN: '₦10,000',
        priceUSD: '$7',
        priceEUR: '€7',
        amountNGN: 10000,
        amountUSD: 7,
        amountEUR: 7,
        billingPeriod: 'per month',
        trialText: '15-Day Free Trial Included',
        description: 'Multi-entity business management, team member collaboration seats, and recurring retainer automation.',
        status: 'coming_soon',
        ctaText: 'Start 15-Day Free Trial',
        highlighted: false,
        features: [
          { text: 'Everything in Professional Tier', included: true },
          { text: '15-Day Free Trial on Launch', included: true, isNew: true },
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

  getFormattedPrice(plan: SubscriptionPlan, currency: CurrencyType): string {
    if (currency === 'USD') return plan.priceUSD;
    if (currency === 'EUR') return plan.priceEUR;
    return plan.priceNGN;
  }
}

export const subscriptionService = new SubscriptionService();
