/**
 * BizPilotly Centralized Pricing & Subscription Configuration
 *
 * Localized static pricing matrix:
 * - Free Starter: ₦0 / $0 / €0
 * - Professional: ₦10,000 / $10 / €9 (15-Day Free Trial)
 * - Business Suite: ₦25,000 / $20 / €19 (15-Day Free Trial)
 *
 * Designed to be easily extensible for future currencies (GHS, KES, ZAR, GBP, CAD, AUD, etc.)
 */

export type PricingCurrency = 'NGN' | 'USD' | 'EUR';
export type PlanTier = 'free' | 'pro' | 'business';

export interface PlanFeatureItem {
  text: string;
  included: boolean;
  isNew?: boolean;
}

export interface PricingPlanConfig {
  id: PlanTier;
  name: string;
  badge?: string;
  isRecommended?: boolean;
  billingPeriod: string;
  trialDays: number;
  trialText: string;
  description: string;
  ctaText: string;
  prices: Record<PricingCurrency, { amount: number; formatted: string; symbol: string }>;
  features: PlanFeatureItem[];
}

export const SUPPORTED_PRICING_CURRENCIES: { code: PricingCurrency; symbol: string; label: string; flag: string }[] = [
  { code: 'NGN', symbol: '₦', label: 'NGN (₦)', flag: '🇳🇬' },
  { code: 'USD', symbol: '$', label: 'USD ($)', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', flag: '🇪🇺' },
];

export const PRICING_PLANS: PricingPlanConfig[] = [
  {
    id: 'free',
    name: 'Free Starter',
    billingPeriod: 'forever free',
    trialDays: 0,
    trialText: 'Free Forever',
    description: 'Essential business calculation suite and standard document generation for solo freelancers.',
    ctaText: 'Start Free',
    isRecommended: false,
    prices: {
      NGN: { amount: 0, formatted: '₦0', symbol: '₦' },
      USD: { amount: 0, formatted: '$0', symbol: '$' },
      EUR: { amount: 0, formatted: '€0', symbol: '€' },
    },
    features: [
      { text: 'All 8 Financial & Pricing Calculators', included: true },
      { text: 'Standard Invoices, Quotes, Receipts & Proposals', included: true },
      { text: 'Direct Bank Transfer Details on Invoices (0% Fee)', included: true },
      { text: 'Up to 5 Saved Client Contacts', included: true },
      { text: 'Live Instant Document Preview & PDF Download', included: true },
      { text: 'Basic Profit & Revenue Overview', included: true },
      { text: '100% White-Label (Remove BizPilotly Badge)', included: false },
      { text: 'Paystack Online Card / Apple Pay Gateway', included: false },
      { text: 'Automated Client Payment Email Reminders', included: false },
      { text: 'Multi-Business Workspaces & Team Seats', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    badge: 'MOST POPULAR',
    isRecommended: true,
    billingPeriod: 'per month',
    trialDays: 15,
    trialText: '15-Day Free Trial • No card required',
    description: 'Complete invoicing automation, custom branding, and online card payment acceptance for solo pros.',
    ctaText: 'Start 15-Day Free Trial',
    prices: {
      NGN: { amount: 10000, formatted: '₦10,000', symbol: '₦' },
      USD: { amount: 10, formatted: '$10', symbol: '$' },
      EUR: { amount: 9, formatted: '€9', symbol: '€' },
    },
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
    badge: 'FOR AGENCIES & TEAMS',
    isRecommended: false,
    billingPeriod: 'per month',
    trialDays: 15,
    trialText: '15-Day Free Trial • No card required',
    description: 'Multi-entity business management, team member collaboration seats, and recurring retainer automation.',
    ctaText: 'Start 15-Day Free Trial',
    prices: {
      NGN: { amount: 25000, formatted: '₦25,000', symbol: '₦' },
      USD: { amount: 20, formatted: '$20', symbol: '$' },
      EUR: { amount: 19, formatted: '€19', symbol: '€' },
    },
    features: [
      { text: 'Everything in Professional Tier', included: true },
      { text: 'Up to 5 Separate Business Entities / Brands', included: true, isNew: true },
      { text: 'Up to 5 Team Member Seats & Role Permissions', included: true, isNew: true },
      { text: 'Automated Recurring Monthly Retainer Invoices', included: true, isNew: true },
      { text: 'Dedicated Passwordless Client Portal', included: true, isNew: true },
      { text: 'Digital E-Signatures on Proposals & Contracts', included: true, isNew: true },
      { text: '1-Click Accounting & Tax CSV / Excel Export', included: true, isNew: true },
      { text: 'Priority WhatsApp Support & VIP Onboarding', included: true, isNew: true },
    ],
  },
];

const CURRENCY_STORAGE_KEY = 'bizpilotly_selected_currency';

export function getStoredCurrency(): PricingCurrency {
  if (typeof window === 'undefined') return 'USD';
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as PricingCurrency;
    if (saved && (saved === 'NGN' || saved === 'USD' || saved === 'EUR')) {
      return saved;
    }

    // Auto-detect regional defaults based on browser timezone / locale
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Lagos') || tz.includes('Africa')) return 'NGN';
    if (tz.includes('Europe') || tz.includes('Paris') || tz.includes('Berlin') || tz.includes('London')) return 'EUR';
    return 'USD';
  } catch {
    return 'USD';
  }
}

export function setStoredCurrency(currency: PricingCurrency): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  } catch (err) {
    console.warn('Could not persist currency preference:', err);
  }
}

export function getPlanConfig(tier: PlanTier): PricingPlanConfig {
  return PRICING_PLANS.find((p) => p.id === tier) || PRICING_PLANS[0];
}
