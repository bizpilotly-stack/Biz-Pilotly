import { CALCULATORS_DATA } from '../constants/brand';
import { CalculatorMeta } from '../types';

export interface ProfitCalcInput {
  revenue: number;
  directCosts: number;
  overheadCosts: number;
  taxRate?: number;
}

export interface MarginCalcInput {
  cost: number;
  desiredMarginPercent: number;
}

export interface MarkupCalcInput {
  cost: number;
  markupPercent: number;
}

export interface ROICalcInput {
  cost: number;
  expectedRevenue: number;
}

export interface BreakEvenCalcInput {
  fixedCosts: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
}

export interface DiscountCalcInput {
  originalPrice: number;
  discountPercent: number;
}

export interface CommissionCalcInput {
  dealAmount: number;
  commissionRatePercent: number;
}

export interface PercentageCalcInput {
  mode: 'what_is_x_percent_of_y' | 'x_is_what_percent_of_y' | 'percentage_increase_decrease';
  val1: number;
  val2: number;
}

class CalculatorService {
  getCalculators(): CalculatorMeta[] {
    return CALCULATORS_DATA;
  }

  getCalculatorBySlug(slug: string): CalculatorMeta | undefined {
    return CALCULATORS_DATA.find((c) => c.slug === slug);
  }

  calculateProfit(input: ProfitCalcInput) {
    const revenue = Number(input.revenue) || 0;
    const directCosts = Number(input.directCosts) || 0;
    const overhead = Number(input.overheadCosts) || 0;
    const taxRate = Number(input.taxRate) || 0;

    const totalCosts = directCosts + overhead;
    const grossProfit = revenue - directCosts;
    const preTaxNetProfit = revenue - totalCosts;
    const estimatedTax = preTaxNetProfit > 0 ? (preTaxNetProfit * taxRate) / 100 : 0;
    const netProfit = preTaxNetProfit - estimatedTax;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      revenue,
      directCosts,
      overhead,
      totalCosts,
      grossProfit,
      grossMargin: Number(grossMargin.toFixed(2)),
      preTaxNetProfit,
      estimatedTax: Number(estimatedTax.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      netMargin: Number(netMargin.toFixed(2)),
    };
  }

  calculateProfitMargin(input: MarginCalcInput) {
    const cost = Number(input.cost) || 0;
    const margin = Number(input.desiredMarginPercent) || 0;

    if (margin >= 100) {
      return {
        cost,
        margin,
        sellingPrice: 0,
        profit: 0,
        markupPercent: 0,
        error: 'Margin cannot be 100% or greater.',
      };
    }

    const sellingPrice = cost / (1 - margin / 100);
    const profit = sellingPrice - cost;
    const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;

    return {
      cost,
      margin,
      sellingPrice: Number(sellingPrice.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      markupPercent: Number(markupPercent.toFixed(2)),
    };
  }

  calculateMarkup(input: MarkupCalcInput) {
    const cost = Number(input.cost) || 0;
    const markup = Number(input.markupPercent) || 0;

    const profit = (cost * markup) / 100;
    const sellingPrice = cost + profit;
    const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    return {
      cost,
      markup,
      profit: Number(profit.toFixed(2)),
      sellingPrice: Number(sellingPrice.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2)),
    };
  }

  calculateROI(input: ROICalcInput) {
    const cost = Number(input.cost) || 0;
    const revenue = Number(input.expectedRevenue) || 0;

    const netGain = revenue - cost;
    const roiPercent = cost > 0 ? (netGain / cost) * 100 : 0;
    const multiple = cost > 0 ? revenue / cost : 0;

    return {
      cost,
      revenue,
      netGain: Number(netGain.toFixed(2)),
      roiPercent: Number(roiPercent.toFixed(2)),
      multiple: Number(multiple.toFixed(2)),
    };
  }

  calculateBreakEven(input: BreakEvenCalcInput) {
    const fixedCosts = Number(input.fixedCosts) || 0;
    const pricePerUnit = Number(input.pricePerUnit) || 0;
    const variableCost = Number(input.variableCostPerUnit) || 0;

    const contributionMargin = pricePerUnit - variableCost;
    if (contributionMargin <= 0) {
      return {
        fixedCosts,
        pricePerUnit,
        variableCost,
        contributionMargin: Number(contributionMargin.toFixed(2)),
        breakEvenUnits: 0,
        breakEvenRevenue: 0,
        error: 'Price per unit must be greater than variable cost per unit.',
      };
    }

    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * pricePerUnit;
    const marginRatio = pricePerUnit > 0 ? (contributionMargin / pricePerUnit) * 100 : 0;

    return {
      fixedCosts,
      pricePerUnit,
      variableCost,
      contributionMargin: Number(contributionMargin.toFixed(2)),
      breakEvenUnits,
      breakEvenRevenue: Number(breakEvenRevenue.toFixed(2)),
      marginRatio: Number(marginRatio.toFixed(2)),
    };
  }

  calculateDiscount(input: DiscountCalcInput) {
    const original = Number(input.originalPrice) || 0;
    const discount = Number(input.discountPercent) || 0;

    const discountAmount = (original * discount) / 100;
    const finalPrice = Math.max(0, original - discountAmount);

    return {
      originalPrice: original,
      discountPercent: discount,
      discountAmount: Number(discountAmount.toFixed(2)),
      finalPrice: Number(finalPrice.toFixed(2)),
    };
  }

  calculateCommission(input: CommissionCalcInput) {
    const dealAmount = Number(input.dealAmount) || 0;
    const rate = Number(input.commissionRatePercent) || 0;

    const commissionAmount = (dealAmount * rate) / 100;
    const remainingAmount = Math.max(0, dealAmount - commissionAmount);

    return {
      dealAmount,
      commissionRatePercent: rate,
      commissionAmount: Number(commissionAmount.toFixed(2)),
      remainingAmount: Number(remainingAmount.toFixed(2)),
    };
  }

  calculatePercentage(input: PercentageCalcInput) {
    const v1 = Number(input.val1) || 0;
    const v2 = Number(input.val2) || 0;

    if (input.mode === 'what_is_x_percent_of_y') {
      const result = (v1 * v2) / 100;
      return {
        text: `${v1}% of ${v2} is`,
        result: Number(result.toFixed(2)),
        explanation: `(${v1} ÷ 100) × ${v2} = ${result.toFixed(2)}`,
      };
    }

    if (input.mode === 'x_is_what_percent_of_y') {
      if (v2 === 0) return { text: 'Error', result: 0, explanation: 'Denominator cannot be zero.' };
      const result = (v1 / v2) * 100;
      return {
        text: `${v1} is what percent of ${v2}?`,
        result: Number(result.toFixed(2)),
        unit: '%',
        explanation: `(${v1} ÷ ${v2}) × 100 = ${result.toFixed(2)}%`,
      };
    }

    // percentage_increase_decrease
    if (v1 === 0) return { text: 'Error', result: 0, explanation: 'Initial value cannot be zero.' };
    const diff = v2 - v1;
    const change = (diff / v1) * 100;
    const direction = diff >= 0 ? 'increase' : 'decrease';
    return {
      text: `Change from ${v1} to ${v2}:`,
      result: Number(Math.abs(change).toFixed(2)),
      unit: `% ${direction}`,
      diff: Number(diff.toFixed(2)),
      explanation: `((${v2} - ${v1}) ÷ ${v1}) × 100 = ${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
    };
  }
}

export const calculatorService = new CalculatorService();
