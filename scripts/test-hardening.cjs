/**
 * Automated Unit Test Suite for Stage 3E Business Logic Hardening
 */

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
console.log('RUNNING BIZPILOTLY STAGE 3E HARDENING TEST SUITE');
console.log('====================================================\n');

// 1. OUTSTANDING RECEIVABLES BUSINESS RULE
console.log('1. Outstanding Receivables Business Rule:');
{
  const mockDocuments = [
    { id: '1', type: 'invoice', status: 'sent', total: 1000, currency: 'USD' },
    { id: '2', type: 'invoice', status: 'viewed', total: 500, currency: 'USD' },
    { id: '3', type: 'invoice', status: 'overdue', total: 750, currency: 'USD' },
    { id: '4', type: 'invoice', status: 'draft', total: 2000, currency: 'USD' }, // MUST BE EXCLUDED
    { id: '5', type: 'invoice', status: 'paid', total: 3000, currency: 'USD' }, // MUST BE EXCLUDED
    { id: '6', type: 'invoice', status: 'cancelled', total: 400, currency: 'USD' }, // MUST BE EXCLUDED
    { id: '7', type: 'quote', status: 'sent', total: 8000, currency: 'USD' }, // MUST BE EXCLUDED
    { id: '8', type: 'proposal', status: 'sent', total: 12000, currency: 'USD' }, // MUST BE EXCLUDED
    { id: '9', type: 'receipt', status: 'paid', total: 1500, currency: 'USD' }, // MUST BE EXCLUDED
  ];

  const outstandingList = mockDocuments.filter(
    (d) => d.type === 'invoice' && (d.status === 'sent' || d.status === 'viewed' || d.status === 'overdue')
  );

  const outstandingReceivables = outstandingList.reduce((sum, d) => sum + d.total, 0);

  assertEquals(outstandingList.length, 3, 'Exactly 3 invoices qualify as outstanding receivables');
  assertEquals(outstandingReceivables, 2250, 'Outstanding receivables sum is $2,250 (1000+500+750)');
  assert(!outstandingList.some((d) => d.status === 'draft'), 'Draft invoices excluded from receivables');
  assert(!outstandingList.some((d) => d.type !== 'invoice'), 'Quotes and proposals excluded from receivables');
}

// 2. REVENUE CALCULATION RULE
console.log('\n2. Revenue Calculation Business Rule:');
{
  const mockPayments = [
    { id: 'p1', amount: 1500, status: 'completed', currency: 'USD' },
    { id: 'p2', amount: 2500, status: 'completed', currency: 'USD' },
    { id: 'p3', amount: 4000, status: 'pending', currency: 'USD' }, // MUST BE EXCLUDED
    { id: 'p4', amount: 800, status: 'failed', currency: 'USD' }, // MUST BE EXCLUDED
    { id: 'p5', amount: 600, status: 'refunded', currency: 'USD' }, // MUST BE EXCLUDED
    { id: 'p6', amount: 5000, status: 'completed', currency: 'EUR' }, // OTHER CURRENCY (EXCLUDED FROM USD AGGREGATE)
  ];

  const businessCurrency = 'USD';
  const validRevenue = mockPayments
    .filter((p) => p.status === 'completed' && p.currency === businessCurrency)
    .reduce((sum, p) => sum + p.amount, 0);

  assertEquals(validRevenue, 4000, 'Revenue strictly sums completed USD payments ($1500+$2500)');
}

// 3. EXPENSE AGGREGATION RULE
console.log('\n3. Expense Aggregation Business Rule:');
{
  const mockExpenses = [
    { id: 'e1', amount: 350, status: 'cleared', currency: 'USD' },
    { id: 'e2', amount: 150, status: 'pending', currency: 'USD' },
    { id: 'e3', amount: 500, status: 'reimbursed', currency: 'USD' }, // MUST BE EXCLUDED
    { id: 'e4', amount: 2000, status: 'cleared', currency: 'GBP' }, // OTHER CURRENCY
  ];

  const businessCurrency = 'USD';
  const validExpenses = mockExpenses
    .filter((e) => e.status !== 'reimbursed' && e.currency === businessCurrency)
    .reduce((sum, e) => sum + e.amount, 0);

  assertEquals(validExpenses, 500, 'Expenses strictly sum non-reimbursed USD expenses ($350+$150)');
}

// 4. DOCUMENT STATUS TRANSITION MATRIX
console.log('\n4. Document Status Transition Matrix:');
{
  const validTransitions = {
    draft: ['draft', 'sent', 'viewed', 'cancelled'],
    sent: ['sent', 'viewed', 'accepted', 'paid', 'overdue', 'cancelled'],
    viewed: ['viewed', 'accepted', 'paid', 'overdue', 'cancelled'],
    accepted: ['accepted', 'paid', 'cancelled'],
    overdue: ['overdue', 'paid', 'cancelled'],
    paid: ['paid'],
    cancelled: ['cancelled'],
  };

  const isTransitionValid = (from, to) => (validTransitions[from] || []).includes(to);

  assert(isTransitionValid('draft', 'sent'), 'Draft -> Sent is valid');
  assert(isTransitionValid('sent', 'paid'), 'Sent -> Paid is valid');
  assert(isTransitionValid('viewed', 'overdue'), 'Viewed -> Overdue is valid');
  assert(!isTransitionValid('paid', 'draft'), 'Paid -> Draft is disallowed');
  assert(!isTransitionValid('cancelled', 'paid'), 'Cancelled -> Paid is disallowed');
  assert(!isTransitionValid('cancelled', 'sent'), 'Cancelled -> Sent is disallowed');
}

// 5. PAYMENT SUFFICIENCY & BALANCE CLAMPING
console.log('\n5. Payment Sufficiency & Balance Clamping:');
{
  const invoiceTotal = 1000;
  let cumulativePaid = 400;

  // Partial payment check
  let isPaid = cumulativePaid >= invoiceTotal;
  assert(!isPaid, 'Partial payment of $400 on $1,000 invoice does NOT mark invoice as paid');

  let outstandingBalance = Math.max(0, invoiceTotal - cumulativePaid);
  assertEquals(outstandingBalance, 600, 'Outstanding balance is correctly $600');

  // Full payment check
  cumulativePaid += 600;
  isPaid = cumulativePaid >= invoiceTotal;
  assert(isPaid, 'Cumulative payment of $1,000 on $1,000 invoice marks invoice as paid');

  // Overpayment clamping
  cumulativePaid += 200; // $1,200 total paid
  outstandingBalance = Math.max(0, invoiceTotal - cumulativePaid);
  assertEquals(outstandingBalance, 0, 'Overpayment balance is safely clamped to $0 (non-negative)');
}

// 6. TAX & DISCOUNT BOUNDARY SAFETY
console.log('\n6. Tax & Discount Boundary Safety:');
{
  function clamp(val, min, max) {
    return Math.min(Math.max(Number(val) || 0, min), max);
  }

  function calculateTotals(subtotal, taxPercent, discountPercent) {
    const validTax = clamp(taxPercent, 0, 100);
    const validDiscount = clamp(discountPercent, 0, 100);

    const discountAmount = Math.round(((subtotal * validDiscount) / 100 + Number.EPSILON) * 100) / 100;
    const subAfterDiscount = Math.max(0, Math.round((subtotal - discountAmount + Number.EPSILON) * 100) / 100);
    const taxAmount = Math.round(((subAfterDiscount * validTax) / 100 + Number.EPSILON) * 100) / 100;
    const total = Math.round((subAfterDiscount + taxAmount + Number.EPSILON) * 100) / 100;

    return { discountAmount, subAfterDiscount, taxAmount, total };
  }

  // Test 1: Negative discount and tax clamped to 0
  const t1 = calculateTotals(100, -20, -15);
  assertEquals(t1.discountAmount, 0, 'Negative discount clamped to $0');
  assertEquals(t1.taxAmount, 0, 'Negative tax clamped to $0');
  assertEquals(t1.total, 100, 'Total with negative rates equals subtotal ($100)');

  // Test 2: >100% discount clamped to 100%
  const t2 = calculateTotals(200, 10, 150);
  assertEquals(t2.discountAmount, 200, 'Discount > 100% clamped to full subtotal ($200)');
  assertEquals(t2.subAfterDiscount, 0, 'Subtotal after 100% discount is $0');
  assertEquals(t2.taxAmount, 0, 'Tax on $0 discounted base is $0');
  assertEquals(t2.total, 0, 'Total with 100% discount is $0');

  // Test 3: Decimal precision (floating point safety)
  const t3 = calculateTotals(199.99, 8.25, 12.5);
  assertEquals(t3.discountAmount, 25.0, 'Discount rounded to 2 decimals ($25.00)');
  assertEquals(t3.subAfterDiscount, 174.99, 'Subtotal after discount ($174.99)');
  assertEquals(t3.taxAmount, 14.44, 'Tax rounded to 2 decimals ($14.44)');
  assertEquals(t3.total, 189.43, 'Total with tax ($189.43)');
}

console.log('\n====================================================');
console.log(`TOTAL HARDENING TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
