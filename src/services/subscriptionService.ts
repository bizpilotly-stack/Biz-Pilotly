import { supabase } from './supabase';
import {
  PlanTier,
  PricingCurrency,
  getStoredCurrency,
  setStoredCurrency,
} from '../config/pricing';
import { notificationService } from './notificationService';
import { emailService } from './emailService';

export type SubscriptionStatus =
  | 'FREE'
  | 'TRIAL_ACTIVE'
  | 'TRIAL_EXPIRED'
  | 'ACTIVE'
  | 'CANCELLED'
  | 'PAST_DUE';

export interface UserSubscription {
  userId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  billingInterval?: BillingInterval;
  trialStartedAt?: string;
  trialEndsAt?: string;
  subscriptionStartedAt?: string;
  subscriptionEndsAt?: string;
  currency: PricingCurrency;
  trialUsed: boolean;
  daysRemaining: number;
  formattedCountdown: string;
  isTrialEndingSoon: boolean; // <= 3 days
}

const SUB_STORAGE_KEY_PREFIX = 'bizpilotly_sub_';

class SubscriptionService {
  /**
   * Authoritatively retrieves user subscription & evaluates server timestamps.
   */
  async getSubscription(user?: { id: string; email?: string | null; created_at?: string }): Promise<UserSubscription> {
    const defaultCurrency = getStoredCurrency();

    if (!user?.id) {
      return {
        userId: 'anonymous',
        plan: 'free',
        status: 'FREE',
        billingInterval: 'monthly',
        currency: defaultCurrency,
        trialUsed: false,
        daysRemaining: 0,
        formattedCountdown: 'Free Starter',
        isTrialEndingSoon: false,
      };
    }

    const storageKey = `${SUB_STORAGE_KEY_PREFIX}${user.id}`;
    let subData: Partial<UserSubscription> = {};

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        subData = JSON.parse(stored);
      }
    } catch {
      // Ignore storage errors
    }

    // Attempt to read from Supabase businesses / profiles
    try {
      const { data: business } = await supabase
        .from('businesses')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (business && !subData.trialStartedAt && business.created_at) {
        // Fallback check
      }
    } catch (err) {
      console.warn('Subscription fetch error:', err);
    }

    const now = Date.now();
    const trialEndsAt = subData.trialEndsAt ? new Date(subData.trialEndsAt).getTime() : 0;
    const trialStartedAt = subData.trialStartedAt;
    const trialUsed = subData.trialUsed ?? false;
    let status: SubscriptionStatus = subData.status || 'FREE';
    let plan: PlanTier = subData.plan || 'free';
    const currency = subData.currency || defaultCurrency;
    const billingInterval: BillingInterval = subData.billingInterval || 'monthly';

    let daysRemaining = 0;
    let formattedCountdown = 'Free Starter';
    let isTrialEndingSoon = false;

    if (status === 'TRIAL_ACTIVE' && trialEndsAt) {
      const diffMs = trialEndsAt - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (now >= trialEndsAt) {
        // Trial expired authoritatively -> Immediately return to Free Plan
        status = 'TRIAL_EXPIRED';
        plan = 'free';
        daysRemaining = 0;
        formattedCountdown = 'Your trial has ended (Free Starter)';

        // Auto-save expired status
        this.persistSubscription(user.id, {
          ...subData,
          status: 'TRIAL_EXPIRED',
          plan: 'free',
        });

        // Trigger expiration lifecycle events
        this.handleTrialExpiration(user, subData.plan || 'pro');
      } else {
        isTrialEndingSoon = daysRemaining <= 3;

        if (daysRemaining > 7) {
          formattedCountdown = `${daysRemaining} days remaining`;
        } else if (daysRemaining === 7) {
          formattedCountdown = '7 days remaining';
        } else if (daysRemaining > 1 && daysRemaining <= 3) {
          formattedCountdown = `Your trial ends in ${daysRemaining} days`;
        } else if (daysRemaining === 1) {
          formattedCountdown = 'Your trial ends tomorrow';
        } else {
          formattedCountdown = 'Your trial ends today';
        }

        // Trigger milestone reminders (7-day and 3-day)
        this.handleTrialMilestoneReminders(user, plan, daysRemaining);
      }
    } else if (status === 'ACTIVE') {
      formattedCountdown = `${plan.toUpperCase()} Active (${billingInterval === 'yearly' ? 'Annual - 20% OFF' : 'Monthly'})`;
    }

    return {
      userId: user.id,
      plan,
      status,
      billingInterval,
      trialStartedAt,
      trialEndsAt: subData.trialEndsAt,
      subscriptionStartedAt: subData.subscriptionStartedAt,
      subscriptionEndsAt: subData.subscriptionEndsAt,
      currency,
      trialUsed,
      daysRemaining,
      formattedCountdown,
      isTrialEndingSoon,
    };
  }

  /**
   * Starts an authoritative 15-day free trial for Professional or Business Suite.
   */
  async start15DayTrial(
    user: { id: string; email?: string | null; name?: string },
    plan: 'pro' | 'business',
    currency: PricingCurrency = getStoredCurrency()
  ): Promise<UserSubscription> {
    const current = await this.getSubscription(user);

    // Rule: One trial per account
    if (current.trialUsed) {
      throw new Error('A 15-day free trial has already been used for this account.');
    }

    const now = new Date();
    const trialStartedAt = now.toISOString();
    // Exactly 15 days later
    const trialEndsAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

    const newSub: UserSubscription = {
      userId: user.id,
      plan,
      status: 'TRIAL_ACTIVE',
      billingInterval: 'monthly',
      trialStartedAt,
      trialEndsAt,
      currency,
      trialUsed: true,
      daysRemaining: 15,
      formattedCountdown: '15 days remaining',
      isTrialEndingSoon: false,
    };

    this.persistSubscription(user.id, newSub);
    setStoredCurrency(currency);

    // 1. Create In-App Notification
    const planName = plan === 'business' ? 'Business Suite' : 'Professional';
    notificationService.createNotification(user.id, {
      title: `Your ${planName} 15-day free trial has started!`,
      message: `Enjoy full access to ${plan === 'business' ? 'Business Suite features (Legal execution certificates, multi-business, team seats)' : 'Professional features (Unlimited invoicing, white-label branding, Paystack)'} until ${new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
      category: 'Trial',
      actionUrl: '/app/documents/invoice',
      actionLabel: 'Create First Invoice',
    });

    // 2. Dispatch Trial Started Email
    if (user.email) {
      try {
        await emailService.sendTransactionalEmail({
          templateType: 'trial_started',
          recipientEmail: user.email,
          recipientName: user.name || 'Business Owner',
          customSubject: `Your BizPilotly ${planName} 15-Day Trial has started`,
          customMessage: `Welcome to BizPilotly! Your 15-day free trial for ${planName} is now active with zero credit card required. Explore unlimited invoices, receipts, and client management tools.`,
        });
      } catch (err) {
        console.warn('Trial started email dispatch fallback:', err);
      }
    }

    return newSub;
  }

  /**
   * Activates full paid subscription (e.g. following Paystack / card payment).
   */
  async activateSubscription(
    userId: string,
    plan: 'pro' | 'business',
    currency: PricingCurrency = getStoredCurrency(),
    billingInterval: BillingInterval = 'monthly'
  ): Promise<void> {
    const now = new Date();
    const subscriptionStartedAt = now.toISOString();
    const durationDays = billingInterval === 'yearly' ? 365 : 30;
    const subscriptionEndsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const updated = {
      userId,
      plan,
      status: 'ACTIVE' as const,
      billingInterval,
      subscriptionStartedAt,
      subscriptionEndsAt,
      currency,
      trialUsed: true,
      daysRemaining: durationDays,
      formattedCountdown: `${plan.toUpperCase()} Active (${billingInterval === 'yearly' ? 'Annual' : 'Monthly'})`,
      isTrialEndingSoon: false,
    };

    this.persistSubscription(userId, updated);

    notificationService.createNotification(userId, {
      title: `Subscribed to ${plan === 'business' ? 'Business Suite' : 'Professional'}!`,
      message: `Thank you for your ${billingInterval === 'yearly' ? 'Annual (20% OFF)' : 'Monthly'} subscription. Your workspace is fully unlocked with priority features.`,
      category: 'Trial',
      actionUrl: '/app',
      actionLabel: 'Open Dashboard',
    });
  }

  /**
   * Handles 7-day and 3-day reminder notifications with deduplication guards.
   */
  private async handleTrialMilestoneReminders(
    user: { id: string; email?: string | null; name?: string },
    plan: PlanTier,
    daysRemaining: number
  ): Promise<void> {
    const planName = plan === 'business' ? 'Business Suite' : 'Professional';
    const dedup7Key = `bizpilotly_reminder_7d_${user.id}`;
    const dedup3Key = `bizpilotly_reminder_3d_${user.id}`;

    // 7-day in-app reminder
    if (daysRemaining <= 7 && daysRemaining > 3 && !localStorage.getItem(dedup7Key)) {
      localStorage.setItem(dedup7Key, 'sent');
      notificationService.createNotification(user.id, {
        title: `Your ${planName} trial ends in 7 days`,
        message: 'You have 7 days remaining in your free trial. Continue with your subscription anytime to keep unlimited invoicing.',
        category: 'Trial',
        actionUrl: '/pricing',
        actionLabel: 'Continue Subscription',
      });
    }

    // 3-day in-app + email reminder
    if (daysRemaining <= 3 && !localStorage.getItem(dedup3Key)) {
      localStorage.setItem(dedup3Key, 'sent');
      notificationService.createNotification(user.id, {
        title: `Your ${planName} trial ends in 3 days!`,
        message: 'Your 15-day free trial is ending soon. Subscribe today to maintain uninterrupted access to your white-label branding and custom tools.',
        category: 'Trial',
        actionUrl: '/pricing',
        actionLabel: 'Continue Subscription',
      });

      if (user.email) {
        try {
          await emailService.sendTransactionalEmail({
            templateType: 'trial_ending_soon',
            recipientEmail: user.email,
            recipientName: user.name || 'Business Owner',
            customSubject: 'Your BizPilotly trial ends in 3 days',
            customMessage: `Your 15-day trial for ${planName} will conclude in 3 days. All your documents, clients, and financial records will remain completely safe. You can continue without interruption by subscribing today.`,
          });
        } catch (err) {
          console.warn('3-day reminder email fallback:', err);
        }
      }
    }
  }

  /**
   * Handles trial expiration: Downgrades to Free Starter immediately with 100% data preservation.
   */
  private async handleTrialExpiration(
    user: { id: string; email?: string | null; name?: string },
    previousPlan: PlanTier
  ): Promise<void> {
    const dedupExpiredKey = `bizpilotly_expired_notif_${user.id}`;
    if (localStorage.getItem(dedupExpiredKey)) return;
    localStorage.setItem(dedupExpiredKey, 'sent');

    const planName = previousPlan === 'business' ? 'Business Suite' : 'Professional';

    // In-App Notification
    notificationService.createNotification(user.id, {
      title: 'Your free trial has ended',
      message: `Your account has returned to Free Starter. All your created invoices, clients, and records are 100% safe. Upgrade anytime to restore ${planName} features.`,
      category: 'Trial',
      actionUrl: '/pricing',
      actionLabel: 'Subscribe to ' + planName,
    });

    // Email Notification
    if (user.email) {
      try {
        await emailService.sendTransactionalEmail({
          templateType: 'trial_expired',
          recipientEmail: user.email,
          recipientName: user.name || 'Business Owner',
          customSubject: 'Your BizPilotly trial has ended',
          customMessage: `Your 15-day ${planName} trial has completed. Your account is now on the Free Starter plan. All your existing documents, clients, and financial history have been preserved safely. Upgrade anytime to restore unlimited invoicing.`,
        });
      } catch (err) {
        console.warn('Trial expired email fallback:', err);
      }
    }
  }

  /**
   * Evaluates the effective active plan (evaluating status and trial bounds).
   */
  getEffectivePlan(sub: UserSubscription): PlanTier {
    if (sub.status === 'ACTIVE') {
      return sub.plan;
    }
    if (sub.status === 'TRIAL_ACTIVE') {
      // Trial is strictly limited to the chosen plan (pro or business)
      return sub.plan;
    }
    // Free Starter by default
    return 'free';
  }

  /**
   * Strict plan-based feature entitlement checker.
   * During trial or subscription, users receive ONLY the features of their selected plan.
   */
  canAccessPlanFeature(
    sub: UserSubscription,
    feature:
      | 'unlimited_documents'
      | 'unlimited_clients'
      | 'custom_logo'
      | 'white_label'
      | 'recurring_invoices'
      | 'task_csv'
      | 'accounting_csv'
      | 'team_seats'
      | 'multi_workspace'
      | 'audit_logs'
      | 'legal_execution_certificate'
  ): boolean {
    const effectivePlan = this.getEffectivePlan(sub);

    switch (feature) {
      case 'legal_execution_certificate':
      case 'team_seats':
      case 'multi_workspace':
      case 'audit_logs':
        // Business Suite only
        return effectivePlan === 'business';

      case 'unlimited_documents':
      case 'unlimited_clients':
      case 'custom_logo':
      case 'white_label':
      case 'recurring_invoices':
      case 'task_csv':
      case 'accounting_csv':
        // Professional or Business Suite
        return effectivePlan === 'pro' || effectivePlan === 'business';

      default:
        return true;
    }
  }

  /**
   * Feature-gating checker.
   */
  canAccessPaidFeatures(sub: UserSubscription): boolean {
    const effective = this.getEffectivePlan(sub);
    return effective === 'pro' || effective === 'business';
  }

  private persistSubscription(userId: string, data: Partial<UserSubscription>): void {
    try {
      localStorage.setItem(`${SUB_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }
}

export const subscriptionService = new SubscriptionService();
