/**
 * Reusable TypeScript types & interfaces for BizPilotly Calculation Engine
 */

export interface CalculationSuccess<T> {
  success: true;
  data: T;
  error?: undefined;
}

export interface CalculationFailure {
  success: false;
  data?: undefined;
  error: string;
}

export type CalculationResult<T> = CalculationSuccess<T> | CalculationFailure;

// ==========================================
// Calculator Input & Output Definitions
// ==========================================

// 1. Profit Calculator
export interface ProfitInput {
  revenue: number;
  directCosts: number;
  overheadCosts: number;
  taxRate?: number;
}

export interface ProfitOutput {
  revenue: number;
  directCosts: number;
  overheadCosts: number;
  totalCosts: number;
  grossProfit: number;
  grossMarginPercent: number;
  preTaxNetProfit: number;
  estimatedTax: number;
  netProfit: number;
  netMarginPercent: number;
}

// 2. Profit Margin Calculator
export interface ProfitMarginInput {
  cost: number;
  desiredMarginPercent: number;
}

export interface ProfitMarginOutput {
  cost: number;
  marginPercent: number;
  sellingPrice: number;
  profit: number;
  markupPercent: number;
}

// 3. Markup Calculator
export interface MarkupInput {
  cost: number;
  markupPercent: number;
}

export interface MarkupOutput {
  cost: number;
  markupPercent: number;
  profit: number;
  sellingPrice: number;
  profitMarginPercent: number;
}

// 4. ROI Calculator
export interface ROIInput {
  cost: number;
  expectedRevenue: number;
}

export interface ROIOutput {
  cost: number;
  revenue: number;
  netGain: number;
  roiPercent: number;
  investmentMultiple: number;
}

// 5. Break-Even Calculator
export interface BreakEvenInput {
  fixedCosts: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
}

export interface BreakEvenOutput {
  fixedCosts: number;
  pricePerUnit: number;
  variableCost: number;
  contributionMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  marginRatioPercent: number;
}

// 6. Discount Calculator
export interface DiscountInput {
  originalPrice: number;
  discountPercent: number;
}

export interface DiscountOutput {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  savingsPercent: number;
}

// 7. Commission Calculator
export interface CommissionInput {
  dealAmount: number;
  commissionRatePercent: number;
}

export interface CommissionOutput {
  dealAmount: number;
  commissionRatePercent: number;
  commissionAmount: number;
  remainingAmount: number;
}

// 8. Percentage Calculator
export type PercentageMode =
  | 'what_is_x_percent_of_y'
  | 'x_is_what_percent_of_y'
  | 'percentage_increase_decrease';

export interface PercentageInput {
  mode: PercentageMode;
  val1: number;
  val2: number;
}

export interface PercentageOutput {
  text: string;
  result: number;
  unit?: string;
  diff?: number;
  explanation: string;
}

// ==========================================
// Registry & Metadata Types
// ==========================================
export type CalculatorCategory = 'pricing' | 'finance' | 'growth' | 'sales' | 'freelance' | 'ecommerce';

export interface CalculatorRegistryItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: CalculatorCategory;
  route: string;
  iconName: string;
  formula: string;
  formulaDescription: string;
  exampleScenario: string;
  exampleCalculation: string;
  seoTitle: string;
  seoDescription: string;
  faq: { question: string; answer: string }[];
  relatedCalculatorSlugs: string[];
  targetDocumentCTA: {
    text: string;
    buttonLabel: string;
    link: string;
  };
}
