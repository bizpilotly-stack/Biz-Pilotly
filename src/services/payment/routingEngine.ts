import {
  PaymentRoutingContext,
  RoutingDecision,
  PlatformFeeSettings,
  SupportedPaymentProvider,
} from './types';
import { PaymentProvider } from './providers/PaymentProvider';
import { FlutterwaveProvider } from './providers/FlutterwaveProvider';
import { SquadProvider } from './providers/SquadProvider';
import { DEFAULT_PLATFORM_FEE_SETTINGS } from './feeEngine';

export class PaymentRoutingEngine {
  private providers: Map<SupportedPaymentProvider, PaymentProvider> = new Map();

  constructor() {
    this.registerProvider(new FlutterwaveProvider());
    this.registerProvider(new SquadProvider());
  }

  registerProvider(provider: PaymentProvider) {
    this.providers.set(provider.providerName, provider);
  }

  getProvider(name: SupportedPaymentProvider): PaymentProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Evaluates all provider rules, geography, currency, capabilities, and business preferences
   * to automatically select the optimal payment provider.
   */
  selectPaymentProvider(
    context: PaymentRoutingContext,
    settings: PlatformFeeSettings = DEFAULT_PLATFORM_FEE_SETTINGS
  ): RoutingDecision {
    const evaluated: RoutingDecision['evaluatedProviders'] = [];

    // 1. Collect all registered providers and apply platform enablement & priority
    const providerList = Array.from(this.providers.values()).map((p) => {
      let isEnabled = true;
      let priority = p.priority;

      if (p.providerName === 'flutterwave') {
        isEnabled = settings.flutterwaveEnabled;
        priority = settings.flutterwavePriority;
      } else if (p.providerName === 'squad') {
        isEnabled = settings.squadEnabled;
        priority = settings.squadPriority;
      }

      return {
        instance: p,
        isEnabled,
        priority,
      };
    });

    // 2. Evaluate capability & eligibility for each provider
    for (const item of providerList) {
      const p = item.instance;

      if (!item.isEnabled) {
        evaluated.push({
          provider: p.providerName,
          isEligible: false,
          disqualificationReason: `${p.displayName} is currently disabled in platform settings.`,
          priority: item.priority,
        });
        continue;
      }

      const processCheck = p.canProcess(context);
      if (!processCheck.isEligible) {
        evaluated.push({
          provider: p.providerName,
          isEligible: false,
          disqualificationReason: processCheck.reason || 'Not supported for this scenario.',
          priority: item.priority,
        });
      } else {
        evaluated.push({
          provider: p.providerName,
          isEligible: true,
          priority: item.priority,
        });
      }
    }

    const eligibleEvaluations = evaluated.filter((e) => e.isEligible);

    // 3. Handle Business Owner Preferred Provider (if explicitly specified)
    const pref = context.businessPreference;
    if (pref && pref !== 'auto') {
      const preferredEligible = eligibleEvaluations.find((e) => e.provider === pref);
      if (preferredEligible) {
        return {
          isAvailable: true,
          selectedProvider: pref,
          reason: `Selected preferred provider: ${pref.toUpperCase()} (Validated & Supported)`,
          evaluatedProviders: evaluated,
        };
      }
      // If business preference is not eligible, proceed to fallback automatically
    }

    // 4. Automatic Selection based on Priority Order
    eligibleEvaluations.sort((a, b) => a.priority - b.priority);

    if (eligibleEvaluations.length > 0) {
      const winner = eligibleEvaluations[0].provider;
      return {
        isAvailable: true,
        selectedProvider: winner,
        reason: `Automatically routed to ${winner.toUpperCase()} based on platform capability and priority matrix.`,
        evaluatedProviders: evaluated,
      };
    }

    // 5. No eligible provider found -> Graceful Unavailability
    const currency = (context.currency || 'USD').toUpperCase();
    const merchantCountry = (context.merchantCountry || 'NG').toUpperCase();

    return {
      isAvailable: false,
      reason: 'No eligible payment provider supported for this merchant country / currency scenario.',
      unavailabilityReason: `Online payment is currently unavailable for ${currency} settlements in country (${merchantCountry}). Please contact the business owner for manual settlement.`,
      evaluatedProviders: evaluated,
    };
  }
}

export const paymentRoutingEngine = new PaymentRoutingEngine();
