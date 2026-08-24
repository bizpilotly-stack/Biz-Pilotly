export interface PlanFeature {
  text: string;
  included: boolean;
  isNew?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  billingPeriod: string;
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
        name: 'Free Forever',
        price: '$0',
        billingPeriod: 'forever free',
        description: 'Essential business calculation and document drafting tools for solo freelancers and starters.',
        status: 'active',
        ctaText: 'Get Started Free',
        highlighted: false,
        features: [
          { text: 'All 8 Financial & Pricing Calculators', included: true },
          { text: 'Standard Invoices, Quotes, Receipts & Proposals', included: true },
          { text: 'Side-by-side Live Document Preview', included: true },
          { text: 'Print & Export to PDF directly in browser', included: true },
          { text: 'Client Management Directory (Up to 15 clients)', included: true },
          { text: 'Basic Expense & Payment Ledger', included: true },
          { text: 'Multi-Currency & Tax Rate configuration', included: true },
          { text: 'Business Overview & Profit Dashboard', included: true },
          { text: 'Automated Recurring Invoices', included: false },
          { text: 'Automatic Email Payment Reminders', included: false },
          { text: 'Custom Domain & White-label Branding', included: false },
          { text: 'Multi-Business / Entity Management', included: false },
        ],
      },
      {
        id: 'pro',
        name: 'Pro Platform',
        badge: 'Coming Soon',
        price: 'Early Access',
        billingPeriod: 'pricing not finalized',
        description: 'Advanced automation, recurring billing, and deep analytics for scaling service businesses.',
        status: 'coming_soon',
        ctaText: 'Join Pro Waitlist',
        highlighted: true,
        features: [
          { text: 'Everything in Free forever', included: true },
          { text: 'Unlimited Clients, Invoices & Proposals', included: true, isNew: true },
          { text: 'Automated Recurring Invoices & Schedules', included: true, isNew: true },
          { text: 'Automatic Client Payment Reminders via Email', included: true, isNew: true },
          { text: 'Custom Branding & Premium Document Templates', included: true, isNew: true },
          { text: 'Multi-Business Workspace Switching', included: true, isNew: true },
          { text: 'Advanced Financial Analytics & Tax Reports', included: true, isNew: true },
          { text: 'Direct Client Payment Links (Stripe / Paystack)', included: true, isNew: true },
          { text: 'Priority VIP Support & Feature Requests', included: true, isNew: true },
        ],
      },
    ];
  }
}

export const subscriptionService = new SubscriptionService();
