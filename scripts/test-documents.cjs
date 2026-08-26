/**
 * Standalone Automated Unit Test Suite for BizPilotly Document Engine (Phase 2)
 */

function roundCurrency(val) {
  if (!Number.isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function safeNumber(val, fallback = 0) {
  if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
  if (typeof val === 'string') {
    const p = parseFloat(val.trim());
    return Number.isFinite(p) ? p : fallback;
  }
  return fallback;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function calculateLineItemTotal(quantity, unitPrice) {
  const qty = Math.max(0, safeNumber(quantity, 0));
  const price = Math.max(0, safeNumber(unitPrice, 0));
  return roundCurrency(qty * price);
}

function calculateDocumentTotals(items, taxRatePercent = 0, discountPercent = 0) {
  const validTaxRate = clamp(safeNumber(taxRatePercent, 0), 0, 100);
  const validDiscountRate = clamp(safeNumber(discountPercent, 0), 0, 100);

  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPrice), 0)
  );

  const discountAmount = roundCurrency((subtotal * validDiscountRate) / 100);
  const subtotalAfterDiscount = Math.max(0, roundCurrency(subtotal - discountAmount));
  const taxAmount = roundCurrency((subtotalAfterDiscount * validTaxRate) / 100);
  const total = roundCurrency(subtotalAfterDiscount + taxAmount);

  return {
    subtotal,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount,
    total,
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(email) {
  if (!email || email.trim() === '') return true;
  return EMAIL_REGEX.test(email.trim());
}

function validateDocument(doc) {
  const errors = {};
  const warnings = {};

  if (!doc.business?.name || doc.business.name.trim() === '') {
    errors['business.name'] = 'Business or Freelancer name is required.';
  }
  if (doc.business?.email && !validateEmail(doc.business.email)) {
    errors['business.email'] = 'Please enter a valid business email address.';
  }
  if (!doc.client?.name || doc.client.name.trim() === '') {
    errors['client.name'] = 'Client contact or company name is required.';
  }
  if (doc.client?.email && !validateEmail(doc.client.email)) {
    errors['client.email'] = 'Please enter a valid client email address.';
  }
  if (!doc.documentNumber || doc.documentNumber.trim() === '') {
    errors['documentNumber'] = 'Document reference number is required.';
  }
  if (!doc.date || isNaN(new Date(doc.date).getTime())) {
    errors['date'] = 'A valid issue date is required.';
  }
  if (!doc.items || doc.items.length === 0) {
    errors['items'] = 'Document must contain at least one line item.';
  } else {
    doc.items.forEach((item, idx) => {
      if (!item.description || item.description.trim() === '') {
        errors[`items.${idx}.description`] = `Item #${idx + 1} requires a description.`;
      }
      if (item.quantity <= 0 || !Number.isFinite(item.quantity)) {
        errors[`items.${idx}.quantity`] = `Item #${idx + 1} quantity must be at least 1.`;
      }
      if (item.unitPrice < 0 || !Number.isFinite(item.unitPrice)) {
        errors[`items.${idx}.unitPrice`] = `Item #${idx + 1} unit price cannot be negative.`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

function formatCurrencyAmount(amount, currencyCode = 'USD', customSymbol) {
  const safeAmt = Number.isFinite(amount) ? amount : 0;
  const symbol = customSymbol || (currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode === 'NGN' ? '₦' : '$');
  const formattedNumber = Math.abs(safeAmt).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return safeAmt < 0 ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
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
console.log('RUNNING BIZPILOTLY DOCUMENT ENGINE (PHASE 2) TESTS');
console.log('====================================================\n');

// 1. FINANCIAL CALCULATIONS
console.log('1. Financial Calculations:');
{
  assertEquals(calculateLineItemTotal(3, 150), 450, '3 qty @ $150 = $450');
  assertEquals(calculateLineItemTotal(0, 500), 0, '0 qty @ $500 = $0');
  assertEquals(calculateLineItemTotal(-2, 100), 0, 'Negative quantity safely clamped to 0');
  assertEquals(calculateLineItemTotal(2, -50), 0, 'Negative unit price safely clamped to 0');

  const items = [
    { quantity: 2, unitPrice: 1000 },
    { quantity: 1, unitPrice: 500 },
  ];
  const totals = calculateDocumentTotals(items, 8, 10);
  assertEquals(totals.subtotal, 2500, 'Subtotal sum');
  assertEquals(totals.discountAmount, 250, '10% discount on $2,500');
  assertEquals(totals.subtotalAfterDiscount, 2250, 'Subtotal after discount');
  assertEquals(totals.taxAmount, 180, '8% tax on discounted amount ($2,250)');
  assertEquals(totals.total, 2430, 'Grand total = $2,430');

  const fullDiscount = calculateDocumentTotals(items, 10, 100);
  assertEquals(fullDiscount.discountAmount, 2500, '100% discount covers full subtotal');
  assertEquals(fullDiscount.taxAmount, 0, 'Zero tax on $0 discounted base');
  assertEquals(fullDiscount.total, 0, 'Total is $0.00 with 100% discount');
}

// 2. DOCUMENT VALIDATION ENGINE
console.log('\n2. Validation Engine:');
{
  const validInvoice = {
    id: 'doc-1',
    type: 'invoice',
    documentNumber: 'INV-2026-001',
    date: '2026-08-24',
    business: { name: 'Apex Studio', email: 'hello@apexstudio.io' },
    client: { name: 'Sarah Jenkins', email: 's.jenkins@horizon.co' },
    items: [{ id: '1', description: 'Web Dev', quantity: 1, unitPrice: 2000, amount: 2000 }],
    taxRate: 0,
    discountRate: 0,
    total: 2000,
  };

  const validRes = validateDocument(validInvoice);
  assert(validRes.isValid === true, 'Default invoice passes full validation');

  const invalidBusiness = {
    ...validInvoice,
    business: { ...validInvoice.business, name: '' },
  };
  const res1 = validateDocument(invalidBusiness);
  assert(res1.isValid === false && res1.errors['business.name'] !== undefined, 'Empty business name rejected');

  const invalidEmail = {
    ...validInvoice,
    client: { ...validInvoice.client, email: 'not-an-email' },
  };
  const res2 = validateDocument(invalidEmail);
  assert(res2.isValid === false && res2.errors['client.email'] !== undefined, 'Malformed client email rejected');

  const emptyItems = {
    ...validInvoice,
    items: [],
  };
  const res3 = validateDocument(emptyItems);
  assert(res3.isValid === false && res3.errors['items'] !== undefined, 'Document with 0 line items rejected');

  const badItemQty = {
    ...validInvoice,
    items: [{ id: '1', description: 'Item 1', quantity: 0, unitPrice: 100, amount: 0 }],
  };
  const res4 = validateDocument(badItemQty);
  assert(res4.isValid === false && res4.errors['items.0.quantity'] !== undefined, 'Zero item quantity rejected');
}

// 3. CURRENCY ENGINE
console.log('\n3. Currency Engine:');
{
  assertEquals(formatCurrencyAmount(1250, 'USD', '$'), '$1,250.00', 'Formatted USD amount');
  assertEquals(formatCurrencyAmount(54000, 'NGN', '₦'), '₦54,000.00', 'Formatted NGN amount');
  assertEquals(formatCurrencyAmount(890.5, 'EUR', '€'), '€890.50', 'Formatted EUR amount');
  assertEquals(formatCurrencyAmount(3200, 'GBP', '£'), '£3,200.00', 'Formatted GBP amount');
  assertEquals(formatCurrencyAmount(-150, 'USD', '$'), '-$150.00', 'Formatted negative currency');
}

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) process.exit(1);
