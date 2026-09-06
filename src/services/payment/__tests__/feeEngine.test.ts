import { describe, it, expect } from 'vitest';
import { calculateBizPilotlyServiceFee, DEFAULT_PLATFORM_FEE_SETTINGS } from '../feeEngine';

describe('BizPilotly Fee Engine Tests', () => {
  describe('NGN Currency Fee Calculations (0.5%, ₦10,000 Cap)', () => {
    it('calculates ₦10,000 -> ₦50', () => {
      const res = calculateBizPilotlyServiceFee(10000, 'NGN');
      expect(res.effectivePlatformFee).toBe(50);
    });

    it('calculates ₦50,000 -> ₦250', () => {
      const res = calculateBizPilotlyServiceFee(50000, 'NGN');
      expect(res.effectivePlatformFee).toBe(250);
    });

    it('calculates ₦100,000 -> ₦500', () => {
      const res = calculateBizPilotlyServiceFee(100000, 'NGN');
      expect(res.effectivePlatformFee).toBe(500);
    });

    it('calculates ₦500,000 -> ₦2,500', () => {
      const res = calculateBizPilotlyServiceFee(500000, 'NGN');
      expect(res.effectivePlatformFee).toBe(2500);
    });

    it('calculates ₦1,000,000 -> ₦5,000', () => {
      const res = calculateBizPilotlyServiceFee(1000000, 'NGN');
      expect(res.effectivePlatformFee).toBe(5000);
    });

    it('calculates ₦2,000,000 -> ₦10,000 (Hits Cap)', () => {
      const res = calculateBizPilotlyServiceFee(2000000, 'NGN');
      expect(res.effectivePlatformFee).toBe(10000);
    });

    it('calculates ₦5,000,000 -> ₦10,000 (Strictly Capped)', () => {
      const res = calculateBizPilotlyServiceFee(5000000, 'NGN');
      expect(res.effectivePlatformFee).toBe(10000);
    });
  });

  describe('USD Currency Fee Calculations (0.5%, $10 Cap)', () => {
    it('calculates $100 -> $0.50', () => {
      const res = calculateBizPilotlyServiceFee(100, 'USD');
      expect(res.effectivePlatformFee).toBe(0.5);
    });

    it('calculates $1,000 -> $5.00', () => {
      const res = calculateBizPilotlyServiceFee(1000, 'USD');
      expect(res.effectivePlatformFee).toBe(5);
    });

    it('calculates $2,000 -> $10.00 (Hits Cap)', () => {
      const res = calculateBizPilotlyServiceFee(2000, 'USD');
      expect(res.effectivePlatformFee).toBe(10);
    });

    it('calculates $5,000 -> $10.00 (Strictly Capped)', () => {
      const res = calculateBizPilotlyServiceFee(5000, 'USD');
      expect(res.effectivePlatformFee).toBe(10);
    });
  });

  describe('GBP Currency Fee Calculations (0.5%, £10 Cap)', () => {
    it('calculates £100 -> £0.50', () => {
      const res = calculateBizPilotlyServiceFee(100, 'GBP');
      expect(res.effectivePlatformFee).toBe(0.5);
    });

    it('calculates £1,000 -> £5.00', () => {
      const res = calculateBizPilotlyServiceFee(1000, 'GBP');
      expect(res.effectivePlatformFee).toBe(5);
    });

    it('calculates £2,000 -> £10.00 (Hits Cap)', () => {
      const res = calculateBizPilotlyServiceFee(2000, 'GBP');
      expect(res.effectivePlatformFee).toBe(10);
    });

    it('calculates £5,000 -> £10.00 (Strictly Capped)', () => {
      const res = calculateBizPilotlyServiceFee(5000, 'GBP');
      expect(res.effectivePlatformFee).toBe(10);
    });
  });

  describe('EUR Currency Fee Calculations (0.5%, €10 Cap)', () => {
    it('calculates €100 -> €0.50', () => {
      const res = calculateBizPilotlyServiceFee(100, 'EUR');
      expect(res.effectivePlatformFee).toBe(0.5);
    });

    it('calculates €1,000 -> €5.00', () => {
      const res = calculateBizPilotlyServiceFee(1000, 'EUR');
      expect(res.effectivePlatformFee).toBe(5);
    });

    it('calculates €2,000 -> €10.00 (Hits Cap)', () => {
      const res = calculateBizPilotlyServiceFee(2000, 'EUR');
      expect(res.effectivePlatformFee).toBe(10);
    });

    it('calculates €5,000 -> €10.00 (Strictly Capped)', () => {
      const res = calculateBizPilotlyServiceFee(5000, 'EUR');
      expect(res.effectivePlatformFee).toBe(10);
    });
  });
});
