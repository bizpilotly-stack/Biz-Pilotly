import {
  calculateProfit,
  calculateProfitMargin,
  calculateMarkup,
  calculateROI,
  calculateBreakEven,
  calculateDiscount,
  calculateCommission,
  calculatePercentage,
  getAllCalculators,
  getCalculatorBySlug,
  getRelatedCalculators,
  getCalculatorsByCategory,
  generateCalculatorJsonLd,
  ProfitInput as ProfitCalcInput,
  ProfitMarginInput as MarginCalcInput,
  MarkupInput as MarkupCalcInput,
  ROIInput as ROICalcInput,
  BreakEvenInput as BreakEvenCalcInput,
  DiscountInput as DiscountCalcInput,
  CommissionInput as CommissionCalcInput,
  PercentageInput as PercentageCalcInput,
} from './calculators';

export type {
  ProfitCalcInput,
  MarginCalcInput,
  MarkupCalcInput,
  ROICalcInput,
  BreakEvenCalcInput,
  DiscountCalcInput,
  CommissionCalcInput,
  PercentageCalcInput,
};

class CalculatorService {
  getCalculators() {
    return getAllCalculators();
  }

  getCalculatorBySlug(slug: string) {
    return getCalculatorBySlug(slug);
  }

  getRelatedCalculators(slug: string) {
    return getRelatedCalculators(slug);
  }

  getCalculatorsByCategory(category: string) {
    return getCalculatorsByCategory(category);
  }

  getJsonLd(slug: string) {
    const calc = getCalculatorBySlug(slug);
    return calc ? generateCalculatorJsonLd(calc) : undefined;
  }

  calculateProfit(input: ProfitCalcInput) {
    const res = calculateProfit(input);
    return {
      revenue: res.revenue,
      directCosts: res.directCosts,
      overhead: res.overheadCosts,
      totalCosts: res.totalCosts,
      grossProfit: res.grossProfit,
      grossMargin: res.grossMarginPercent,
      preTaxNetProfit: res.preTaxNetProfit,
      estimatedTax: res.estimatedTax,
      netProfit: res.netProfit,
      netMargin: res.netMarginPercent,
    };
  }

  calculateProfitMargin(input: MarginCalcInput) {
    const res = calculateProfitMargin(input);
    if (!res.success) {
      return {
        cost: input.cost || 0,
        margin: input.desiredMarginPercent || 0,
        sellingPrice: 0,
        profit: 0,
        markupPercent: 0,
        error: res.error,
      };
    }
    return {
      cost: res.data.cost,
      margin: res.data.marginPercent,
      sellingPrice: res.data.sellingPrice,
      profit: res.data.profit,
      markupPercent: res.data.markupPercent,
    };
  }

  calculateMarkup(input: MarkupCalcInput) {
    const res = calculateMarkup(input);
    return {
      cost: res.cost,
      markup: res.markupPercent,
      profit: res.profit,
      sellingPrice: res.sellingPrice,
      profitMargin: res.profitMarginPercent,
    };
  }

  calculateROI(input: ROICalcInput) {
    const res = calculateROI(input);
    return {
      cost: res.cost,
      revenue: res.revenue,
      netGain: res.netGain,
      roiPercent: res.roiPercent,
      multiple: res.investmentMultiple,
    };
  }

  calculateBreakEven(input: BreakEvenCalcInput) {
    const res = calculateBreakEven(input);
    if (!res.success) {
      return {
        fixedCosts: input.fixedCosts || 0,
        pricePerUnit: input.pricePerUnit || 0,
        variableCost: input.variableCostPerUnit || 0,
        contributionMargin: (input.pricePerUnit || 0) - (input.variableCostPerUnit || 0),
        breakEvenUnits: 0,
        breakEvenRevenue: 0,
        marginRatio: 0,
        error: res.error,
      };
    }
    return {
      fixedCosts: res.data.fixedCosts,
      pricePerUnit: res.data.pricePerUnit,
      variableCost: res.data.variableCost,
      contributionMargin: res.data.contributionMargin,
      breakEvenUnits: res.data.breakEvenUnits,
      breakEvenRevenue: res.data.breakEvenRevenue,
      marginRatio: res.data.marginRatioPercent,
    };
  }

  calculateDiscount(input: DiscountCalcInput) {
    const res = calculateDiscount(input);
    return {
      originalPrice: res.originalPrice,
      discountPercent: res.discountPercent,
      discountAmount: res.discountAmount,
      finalPrice: res.finalPrice,
    };
  }

  calculateCommission(input: CommissionCalcInput) {
    const res = calculateCommission(input);
    return {
      dealAmount: res.dealAmount,
      commissionRatePercent: res.commissionRatePercent,
      commissionAmount: res.commissionAmount,
      remainingAmount: res.remainingAmount,
    };
  }

  calculatePercentage(input: PercentageCalcInput) {
    const res = calculatePercentage(input);
    if (!res.success) {
      return {
        text: 'Calculation Note',
        result: 0,
        explanation: res.error,
      };
    }
    return res.data;
  }
}

export const calculatorService = new CalculatorService();
export * from './calculators';
