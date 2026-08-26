/**
 * Standalone Automated Unit Test Suite for BizPilotly Anonymous Document Engine (Phase 2)
 */

import {
  calculateLineItemTotal,
  calculateDocumentTotals,
  normalizeLineItems,
} from '../src/services/documents/calculations.ts';

import {
  validateDocument,
  validateEmail,
} from '../src/services/documents/validation.ts';

import {
  generateDocumentNumber,
  getDefaultDocumentTitle,
} from '../src/services/documents/numbering.ts';

import {
  formatCurrencyAmount,
  getCurrencyConfig,
  SUPPORTED_CURRENCIES,
} from '../src/services/documents/currencies.ts';

import {
  getDefaultDocument,
  getDraftStorageKey,
} from '../src/services/documents/draftStorage.ts';

import {
  DOCUMENT_REGISTRY,
  getDocumentMeta,
  generateDocumentJsonLd,
} from '../src/services/documents/registry.ts';

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

// 1. LINE ITEM & DOCUMENT TOTAL CALCULATIONS
console.log('1. Financial Calculations:');
{
  // Line item amount
  assertEquals(calculateLineItemTotal(3, 150), 450, '3 qty @ $150 = $450');
  assertEquals(calculateLineItemTotal(0, 500), 0, '0 qty @ $500 = $0');
  assertEquals(calculateLineItemTotal(-2, 100), 0, 'Negative quantity safely clamped to 0');
  assertEquals(calculateLineItemTotal(2, -50), 0, 'Negative unit price safely clamped to 0');

  // Subtotal, Discount, Tax, Grand Total
  const items = [
    { quantity: 2, unitPrice: 1000 }, // 2000
    { quantity: 1, unitPrice: 500 },  // 500
  ];
  // Subtotal = 2500
  // Discount 10% = 250 -> Subtotal after discount = 2250
  // Tax 8% on 2250 = 180
  // Grand Total = 2250 + 180 = 2430
  const totals = calculateDocumentTotals(items, 8, 10);
  assertEquals(totals.subtotal, 2500, 'Subtotal sum');
  assertEquals(totals.discountAmount, 250, '10% discount on $2,500');
  assertEquals(totals.subtotalAfterDiscount, 2250, 'Subtotal after discount');
  assertEquals(totals.taxAmount, 180, '8% tax on discounted amount ($2,250)');
  assertEquals(totals.total, 2430, 'Grand total = $2,430');

  // 100% Discount Edge Case
  const fullDiscount = calculateDocumentTotals(items, 10, 100);
  assertEquals(fullDiscount.discountAmount, 2500, '100% discount covers full subtotal');
  assertEquals(fullDiscount.taxAmount, 0, 'Zero tax on $0 discounted base');
  assertEquals(fullDiscount.total, 0, 'Total is $0.00 with 100% discount');
}

// 2. DOCUMENT VALIDATION ENGINE
console.log('\n2. Validation Engine:');
{
  const validInvoice = getDefaultDocument('invoice');
  const validRes = validateDocument(validInvoice);
  assert(validRes.isValid === true, 'Default invoice passes full validation');

  // Missing Business Name
  const invalidBusiness = {
    ...validInvoice,
    business: { ...validInvoice.business, name: '' },
  };
  const res1 = validateDocument(invalidBusiness);
  assert(res1.isValid === false && res1.errors['business.name'] !== undefined, 'Empty business name rejected');

  // Invalid Email
  const invalidEmail = {
    ...validInvoice,
    client: { ...validInvoice.client, email: 'not-an-email' },
  };
  const res2 = validateDocument(invalidEmail);
  assert(res2.isValid === false && res2.errors['client.email'] !== undefined, 'Malformed client email rejected');

  // Empty Line Items
  const emptyItems = {
    ...validInvoice,
    items: [],
  };
  const res3 = validateDocument(emptyItems);
  assert(res3.isValid === false && res3.errors['items'] !== undefined, 'Document with 0 line items rejected');

  // Invalid Item Quantity
  const badItemQty = {
    ...validInvoice,
    items: [{ id: '1', description: 'Item 1', quantity: 0, unitPrice: 100, amount: 0 }],
  };
  const res4 = validateDocument(badItemQty);
  assert(res4.isValid === false && res4.errors['items.0.quantity'] !== undefined, 'Zero item quantity rejected');
}

// 3. CURRENCY FORMATTING
console.log('\n3. Currency Engine:');
{
  assertEquals(formatCurrencyAmount(1250, 'USD', '$'), '$1,250.00', 'Formatted USD amount');
  assertEquals(formatCurrencyAmount(54000, 'NGN', '₦'), '₦54,000.00', 'Formatted NGN amount');
  assertEquals(formatCurrencyAmount(890.5, 'EUR', '€'), '€890.50', 'Formatted EUR amount');
  assertEquals(formatCurrencyAmount(3200, 'GBP', '£'), '£3,200.00', 'Formatted GBP amount');
  assertEquals(formatCurrencyAmount(-150, 'USD', '$'), '-$150.00', 'Formatted negative currency');

  assert(SUPPORTED_CURRENCIES.length >= 4, 'At least 4 core currencies supported');
}

// 4. DOCUMENT TYPES & METADATA
console.log('\n4. Document Registry & Schemas:');
{
  assertEquals(DOCUMENT_REGISTRY.length, 4, 'All 4 document types registered (invoice, quote, receipt, proposal)');

  const invoiceMeta = getDocumentMeta('invoice');
  assertEquals(invoiceMeta.title, 'Invoice', 'Invoice meta retrieved');
  
  const schema = generateDocumentJsonLd(invoiceMeta);
  assertEquals(schema['@type'], 'WebApplication', 'JSON-LD schema generated');

  const invoiceDefault = getDefaultDocument('invoice');
  assertEquals(invoiceDefault.type, 'invoice', 'Invoice default document type');
  assert(invoiceDefault.dueDate !== undefined, 'Invoice has dueDate');

  const quoteDefault = getDefaultDocument('quote');
  assertEquals(quoteDefault.type, 'quote', 'Quote default document type');
  assert(quoteDefault.validUntil !== undefined, 'Quote has validUntil');

  const receiptDefault = getDefaultDocument('receipt');
  assertEquals(receiptDefault.type, 'receipt', 'Receipt default document type');
  assert(receiptDefault.paymentMethod !== undefined, 'Receipt has paymentMethod');

  const proposalDefault = getDefaultDocument('proposal');
  assertEquals(proposalDefault.type, 'proposal', 'Proposal default document type');
  assert(proposalDefault.projectOverview !== undefined, 'Proposal has projectOverview');
}

// 5. LOCAL DRAFT PERSISTENCE KEYS
console.log('\n5. Draft Storage Architecture:');
{
  assertEquals(getDraftStorageKey('invoice'), 'bizpilotly_draft_invoice_v1', 'Versioned invoice draft key');
  assertEquals(getDraftStorageKey('quote'), 'bizpilotly_draft_quote_v1', 'Versioned quote draft key');
  assertEquals(getDraftStorageKey('receipt'), 'bizpilotly_draft_receipt_v1', 'Versioned receipt draft key');
  assertEquals(getDraftStorageKey('proposal'), 'bizpilotly_draft_proposal_v1', 'Versioned proposal draft key');
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
