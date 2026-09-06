import { describe, it, expect } from 'vitest';
import { paymentRoutingEngine } from '../routingEngine';
import { PaymentRoutingContext } from '../types';

describe('Payment Routing Engine Tests', () => {
  it('Scenario 1: Nigeria Business -> Nigeria Customer (NGN) routes to Flutterwave by default', () => {
    const context: PaymentRoutingContext = {
      merchantCountry: 'NG',
      customerCountry: 'NG',
      currency: 'NGN',
      amount: 100000,
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context);
    expect(decision.isAvailable).toBe(true);
    expect(decision.selectedProvider).toBe('flutterwave');
  });

  it('Scenario 2: Nigeria Business -> UK Customer (NGN/GBP) routes to Flutterwave', () => {
    const context: PaymentRoutingContext = {
      merchantCountry: 'NG',
      customerCountry: 'GB',
      currency: 'GBP',
      amount: 500,
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context);
    expect(decision.isAvailable).toBe(true);
    expect(decision.selectedProvider).toBe('flutterwave');
  });

  it('Scenario 3: US Business -> UK Customer (USD) routes to Flutterwave (Squad ineligible for US merchant)', () => {
    const context: PaymentRoutingContext = {
      merchantCountry: 'US',
      customerCountry: 'GB',
      currency: 'USD',
      amount: 2000,
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context);
    expect(decision.isAvailable).toBe(true);
    expect(decision.selectedProvider).toBe('flutterwave');
  });

  it('Scenario 4: Business preference for Squad (NGN) routes to Squad when valid', () => {
    const context: PaymentRoutingContext = {
      merchantCountry: 'NG',
      customerCountry: 'NG',
      currency: 'NGN',
      amount: 50000,
      businessPreference: 'squad',
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context);
    expect(decision.isAvailable).toBe(true);
    expect(decision.selectedProvider).toBe('squad');
  });

  it('Scenario 5: Business preference for Squad on unsupported merchant country (US) gracefully falls back to Flutterwave', () => {
    const context: PaymentRoutingContext = {
      merchantCountry: 'US',
      customerCountry: 'US',
      currency: 'USD',
      amount: 1000,
      businessPreference: 'squad',
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context);
    expect(decision.isAvailable).toBe(true);
    expect(decision.selectedProvider).toBe('flutterwave');
  });

  it('Scenario 6: Completely unsupported currency/country returns isAvailable: false with clear reason', () => {
    const context: PaymentRoutingContext = {
      merchantCountry: 'KP', // Unsupported country
      customerCountry: 'KP',
      currency: 'XYZ',       // Unsupported currency
      amount: 100,
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context);
    expect(decision.isAvailable).toBe(false);
    expect(decision.unavailabilityReason).toBeDefined();
    expect(decision.unavailabilityReason).toContain('Online payment is currently unavailable');
  });
});
