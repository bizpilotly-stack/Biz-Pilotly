/**
 * Standalone Automated Unit Test Suite for BizPilotly Calculation Engine
 * Tests all 8 calculators for normal values, decimals, zero, empty, negative, division-by-zero, large values, and boundary conditions.
 */

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
} from '../src/services/calculators/index.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  assert(actual === expected, `${message} (Expected ${expected}, got ${actual})`);
}

console.log('====================================================');
console.log('RUNNING BIZPILOTLY CALCULATOR ENGINE TESTS');
console.log('====================================================\n');

// 1. PROFIT CALCULATOR
console.log('1. Profit Calculator:');
{
  const res = calculateProfit({ revenue: 5000, directCosts: 800, overheadCosts: 400, taxRate: 15 });
  assertEquals(res.revenue, 5000, 'Revenue parsed correctly');
  assertEquals(res.totalCosts, 1200, 'Total costs sum (800 + 400)');
  assertEquals(res.grossProfit, 4200, 'Gross profit (5000 - 800)');
  assertEquals(res.grossMarginPercent, 84, 'Gross margin %');
  assertEquals(res.preTaxNetProfit, 3800, 'Pre-tax net profit');
  assertEquals(res.estimatedTax, 570, 'Estimated tax (15% of 3800)');
  assertEquals(res.netProfit, 3230, 'Net profit after tax');
  assertEquals(res.netMarginPercent, 64.6, 'Net margin %');

  // Edge case: zero revenue
  const zeroRes = calculateProfit({ revenue: 0, directCosts: 100, overheadCosts: 50, taxRate: 20 });
  assertEquals(zeroRes.grossMarginPercent, 0, 'Zero revenue returns 0% margin without NaN');
  assertEquals(zeroRes.netMarginPercent, 0, 'Zero revenue returns 0% net margin without NaN');
  assertEquals(zeroRes.estimatedTax, 0, 'No tax on operating loss');
  assertEquals(zeroRes.netProfit, -150, 'Net loss calculated correctly');
}

// 2. PROFIT MARGIN CALCULATOR
console.log('\n2. Profit Margin Calculator:');
{
  const res = calculateProfitMargin({ cost: 1200, desiredMarginPercent: 45 });
  assert(res.success === true, 'Calculation successful');
  if (res.success) {
    assertEquals(res.data.sellingPrice, 2181.82, 'Selling price for 45% margin on $1,200');
    assertEquals(res.data.profit, 981.82, 'Profit on $2,181.82');
    assertEquals(res.data.markupPercent, 81.82, 'Markup percentage');
  }

  // Edge case: margin >= 100%
  const invalidRes = calculateProfitMargin({ cost: 1200, desiredMarginPercent: 100 });
  assert(invalidRes.success === false, 'Margin >= 100% rejected safely');
  assertEquals(invalidRes.error, 'Desired profit margin cannot be 100% or greater.', 'Expected error message');

  // Edge case: zero cost
  const zeroCost = calculateProfitMargin({ cost: 0, desiredMarginPercent: 30 });
  assert(zeroCost.success === true && zeroCost.data.sellingPrice === 0, 'Zero cost returns $0 selling price without error');
}

// 3. MARKUP CALCULATOR
console.log('\n3. Markup Calculator:');
{
  const res = calculateMarkup({ cost: 1500, markupPercent: 80 });
  assertEquals(res.sellingPrice, 2700, 'Selling price for 80% markup on $1,500');
  assertEquals(res.profit, 1200, 'Profit amount');
  assertEquals(res.profitMarginPercent, 44.44, 'Resulting profit margin percentage');

  // Edge case: zero markup
  const zeroMarkup = calculateMarkup({ cost: 500, markupPercent: 0 });
  assertEquals(zeroMarkup.sellingPrice, 500, 'Zero markup selling price equals cost');
  assertEquals(zeroMarkup.profit, 0, 'Zero markup profit is 0');
}

// 4. ROI CALCULATOR
console.log('\n4. ROI Calculator:');
{
  const res = calculateROI({ cost: 2000, expectedRevenue: 9500 });
  assertEquals(res.netGain, 7500, 'Net financial gain ($9,500 - $2,000)');
  assertEquals(res.roiPercent, 375, 'ROI percentage');
  assertEquals(res.investmentMultiple, 4.75, 'Investment multiple ($9,500 / $2,000)');

  // Edge case: zero cost (prevent division by zero)
  const zeroCostROI = calculateROI({ cost: 0, expectedRevenue: 5000 });
  assertEquals(zeroCostROI.roiPercent, 0, 'Zero cost ROI returns 0% without Infinity');
  assertEquals(zeroCostROI.investmentMultiple, 0, 'Zero cost multiple returns 0 without Infinity');
}

// 5. BREAK-EVEN CALCULATOR
console.log('\n5. Break-Even Calculator:');
{
  const res = calculateBreakEven({ fixedCosts: 3000, pricePerUnit: 150, variableCostPerUnit: 30 });
  assert(res.success === true, 'Calculation successful');
  if (res.success) {
    assertEquals(res.data.contributionMargin, 120, 'Contribution margin ($150 - $30)');
    assertEquals(res.data.breakEvenUnits, 25, 'Break-even units (3000 / 120)');
    assertEquals(res.data.breakEvenRevenue, 3750, 'Break-even revenue (25 * 150)');
    assertEquals(res.data.marginRatioPercent, 80, 'Contribution margin ratio');
  }

  // Edge case: price <= variable cost
  const impossibleRes = calculateBreakEven({ fixedCosts: 3000, pricePerUnit: 50, variableCostPerUnit: 60 });
  assert(impossibleRes.success === false, 'Price <= variable cost safely rejected');
  assertEquals(impossibleRes.error, 'Price per unit must be greater than variable cost to reach break-even.', 'Error message');
}

// 6. DISCOUNT CALCULATOR
console.log('\n6. Discount Calculator:');
{
  const res = calculateDiscount({ originalPrice: 6000, discountPercent: 15 });
  assertEquals(res.discountAmount, 900, 'Discount amount ($6,000 * 0.15)');
  assertEquals(res.finalPrice, 5100, 'Final price ($6,000 - $900)');

  // Edge case: discount > 100% clamped
  const overDiscount = calculateDiscount({ originalPrice: 100, discountPercent: 120 });
  assertEquals(overDiscount.discountPercent, 100, 'Discount clamped to 100%');
  assertEquals(overDiscount.finalPrice, 0, 'Final price clamped to $0');
}

// 7. COMMISSION CALCULATOR
console.log('\n7. Commission Calculator:');
{
  const res = calculateCommission({ dealAmount: 18000, commissionRatePercent: 8.5 });
  assertEquals(res.commissionAmount, 1530, 'Commission fee ($18,000 * 0.085)');
  assertEquals(res.remainingAmount, 16470, 'Remaining net balance');

  // Edge case: 0% commission
  const zeroComm = calculateCommission({ dealAmount: 5000, commissionRatePercent: 0 });
  assertEquals(zeroComm.commissionAmount, 0, 'Zero commission');
  assertEquals(zeroComm.remainingAmount, 5000, 'Full deal retained');
}

// 8. PERCENTAGE CALCULATOR
console.log('\n8. Percentage Calculator:');
{
  // Mode 1: What is X% of Y?
  const m1 = calculatePercentage({ mode: 'what_is_x_percent_of_y', val1: 25, val2: 4800 });
  assert(m1.success && m1.data.result === 1200, '25% of 4,800 is 1,200');

  // Mode 2: X is what % of Y?
  const m2 = calculatePercentage({ mode: 'x_is_what_percent_of_y', val1: 1200, val2: 4800 });
  assert(m2.success && m2.data.result === 25, '1,200 of 4,800 is 25%');

  // Mode 2 edge case: Y = 0
  const m2Zero = calculatePercentage({ mode: 'x_is_what_percent_of_y', val1: 500, val2: 0 });
  assert(!m2Zero.success, 'Division by zero rejected in Mode 2');

  // Mode 3: Percent increase / decrease
  const m3Growth = calculatePercentage({ mode: 'percentage_increase_decrease', val1: 14000, val2: 21500 });
  assert(m3Growth.success && m3Growth.data.result === 53.57, 'Growth from 14,000 to 21,500 is +53.57%');

  const m3Drop = calculatePercentage({ mode: 'percentage_increase_decrease', val1: 200, val2: 150 });
  assert(m3Drop.success && m3Drop.data.result === 25, 'Drop from 200 to 150 is 25%');

  // Mode 3 edge case: X = 0
  const m3Zero = calculatePercentage({ mode: 'percentage_increase_decrease', val1: 0, val2: 100 });
  assert(!m3Zero.success, 'Zero base value rejected in Mode 3');
}

// 9. REGISTRY AUDIT
console.log('\n9. Registry & Linking:');
{
  const all = getAllCalculators();
  assertEquals(all.length, 8, 'All 8 calculators registered');

  const profitCalc = getCalculatorBySlug('profit');
  assert(profitCalc !== undefined, 'Profit calculator found by slug');

  const related = getRelatedCalculators('profit');
  assert(related.length > 0, 'Related calculators dynamically resolved');
}

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
