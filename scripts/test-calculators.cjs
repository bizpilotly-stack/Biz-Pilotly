/**
 * Standalone Automated Unit Test Suite for BizPilotly Calculation Engine (CommonJS runner)
 */

function roundCurrency(val) {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function roundPercent(val) {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function calculateProfit(input) {
  const revenue = Math.max(0, Number(input.revenue) || 0);
  const directCosts = Math.max(0, Number(input.directCosts) || 0);
  const overheadCosts = Math.max(0, Number(input.overheadCosts) || 0);
  const taxRate = Math.min(100, Math.max(0, Number(input.taxRate) || 0));

  const totalCosts = roundCurrency(directCosts + overheadCosts);
  const grossProfit = roundCurrency(revenue - directCosts);
  const grossMarginPercent = revenue > 0 ? roundPercent((grossProfit / revenue) * 100) : 0;
  const preTaxNetProfit = roundCurrency(revenue - totalCosts);
  const estimatedTax = preTaxNetProfit > 0 && taxRate > 0 ? roundCurrency((preTaxNetProfit * taxRate) / 100) : 0;
  const netProfit = roundCurrency(preTaxNetProfit - estimatedTax);
  const netMarginPercent = revenue > 0 ? roundPercent((netProfit / revenue) * 100) : 0;

  return { revenue, directCosts, overheadCosts, totalCosts, grossProfit, grossMarginPercent, preTaxNetProfit, taxRate, estimatedTax, netProfit, netMarginPercent };
}

function calculateProfitMargin(input) {
  const cost = Math.max(0, Number(input.cost) || 0);
  const targetMargin = Math.min(99.99, Math.max(0, Number(input.targetMarginPercent) || 0));
  const sellingPrice = targetMargin >= 100 ? cost : roundCurrency(cost / (1 - targetMargin / 100));
  const profitAmount = roundCurrency(sellingPrice - cost);
  const markupPercent = cost > 0 ? roundPercent((profitAmount / cost) * 100) : 0;
  return { cost, targetMarginPercent: targetMargin, sellingPrice, profitAmount, markupPercent };
}

function calculateROI(input) {
  const initialCost = Math.max(0, Number(input.initialInvestment) || 0);
  const finalReturn = Math.max(0, Number(input.finalValue) || 0);
  const netProfit = roundCurrency(finalReturn - initialCost);
  const roiPercent = initialCost > 0 ? roundPercent((netProfit / initialCost) * 100) : 0;
  return { initialInvestment: initialCost, finalValue: finalReturn, netProfit, roiPercent };
}

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

  const zeroRes = calculateProfit({ revenue: 0, directCosts: 100, overheadCosts: 50, taxRate: 20 });
  assertEquals(zeroRes.grossMarginPercent, 0, 'Zero revenue returns 0% margin without NaN');
  assertEquals(zeroRes.netMarginPercent, 0, 'Zero revenue returns 0% net margin without NaN');
  assertEquals(zeroRes.estimatedTax, 0, 'No tax on operating loss');
  assertEquals(zeroRes.netProfit, -150, 'Net loss calculated correctly');
}

// 2. PROFIT MARGIN CALCULATOR
console.log('\n2. Profit Margin Calculator:');
{
  const res = calculateProfitMargin({ cost: 200, targetMarginPercent: 40 });
  assertEquals(res.cost, 200, 'Cost passed correctly');
  assertEquals(res.sellingPrice, 333.33, 'Selling price for 40% margin ($200 / 0.6)');
  assertEquals(res.profitAmount, 133.33, 'Profit amount ($333.33 - $200)');
  assertEquals(res.markupPercent, 66.67, 'Markup % (133.33 / 200)');
}

// 3. ROI CALCULATOR
console.log('\n3. ROI Calculator:');
{
  const res = calculateROI({ initialInvestment: 1000, finalValue: 2500 });
  assertEquals(res.netProfit, 1500, 'Net profit ($2500 - $1000)');
  assertEquals(res.roiPercent, 150, 'ROI % ((1500 / 1000) * 100)');
}

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
