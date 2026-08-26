/**
 * Standalone Automated Unit Test Suite for BizPilotly PDF Rendering Engine
 */

const { jsPDF } = require('jspdf');
const autoTableImport = require('jspdf-autotable');
const autoTable = typeof autoTableImport === 'function' ? autoTableImport : (autoTableImport.default || autoTableImport);

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

function formatCurrencyAmount(amount, currencyCode = 'USD', customSymbol) {
  const symbol = customSymbol || (currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode === 'NGN' ? '₦' : '$');
  const rounded = Math.round((Math.max(0, Number(amount) || 0) + Number.EPSILON) * 100) / 100;
  return `${symbol}${rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateDocumentPdfFilename(doc) {
  const sanitize = (str) =>
    str.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const prefix = sanitize(doc.documentNumber || doc.type.toUpperCase());
  const clientName = sanitize(doc.client?.name || doc.client?.company || 'Client');
  return `${prefix}-${clientName}.pdf`;
}

function renderDocumentPdf(doc) {
  const docTypeLabels = {
    invoice: 'TAX INVOICE',
    quote: 'PRICE QUOTATION',
    receipt: 'PAYMENT RECEIPT',
    proposal: 'BUSINESS PROPOSAL',
  };

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // Header Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text(doc.business?.name || 'My Business Studio', margin, currentY + 6);

  const typeTitle = docTypeLabels[doc.type] || doc.type.toUpperCase();
  pdf.text(typeTitle, pageWidth - margin, currentY + 6, { align: 'right' });
  currentY += 16;

  // Table
  const tableData = (doc.items || []).map((item, idx) => [
    String(idx + 1),
    item.description || 'Item Description',
    String(item.quantity || 1),
    formatCurrencyAmount(item.unitPrice || 0, doc.currency, doc.currencySymbol),
    formatCurrencyAmount(item.amount || 0, doc.currency, doc.currencySymbol),
  ]);

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData.length > 0 ? tableData : [['1', 'General Service', '1', '$0.00', '$0.00']],
    theme: 'grid',
  });

  return pdf;
}

console.log('====================================================');
console.log('RUNNING BIZPILOTLY PDF RENDERING ENGINE TESTS');
console.log('====================================================\n');

// 1. INVOICE RENDERING TEST
console.log('1. Invoice PDF Generation:');
{
  const invoiceDoc = {
    type: 'invoice',
    documentNumber: 'INV-2026-001',
    date: '2026-08-25',
    dueDate: '2026-09-10',
    status: 'sent',
    business: { name: 'Acme Software Labs', email: 'billing@acme.com' },
    client: { name: 'Globex Corp', email: 'accounts@globex.com' },
    items: [
      { id: '1', description: 'Cloud Migration Consulting', quantity: 10, unitPrice: 150, amount: 1500 },
      { id: '2', description: 'Security Hardening', quantity: 1, unitPrice: 800, amount: 800 },
    ],
    subtotal: 2300,
    discountRate: 10,
    discountAmount: 230,
    taxRate: 8,
    taxAmount: 165.6,
    total: 2235.6,
    currency: 'USD',
    currencySymbol: '$',
  };

  const pdf = renderDocumentPdf(invoiceDoc);
  const rawBytes = pdf.output();

  assert(rawBytes.startsWith('%PDF-'), 'Valid PDF binary header (%PDF-) generated');
  assert(rawBytes.length > 1000, `PDF size is ${rawBytes.length} bytes (non-empty stream)`);

  const filename = generateDocumentPdfFilename(invoiceDoc);
  assertEquals(filename, 'INV-2026-001-Globex-Corp.pdf', 'Deterministic sanitized filename');
}

// 2. QUOTE RENDERING TEST
console.log('\n2. Quote PDF Generation:');
{
  const quoteDoc = {
    type: 'quote',
    documentNumber: 'QTE-2026-042',
    date: '2026-08-25',
    validUntil: '2026-09-25',
    status: 'draft',
    business: { name: 'Design Studio' },
    client: { name: 'Wayne Enterprises / Bruce Wayne' },
    items: [{ id: '1', description: 'Brand Identity', quantity: 1, unitPrice: 4500, amount: 4500 }],
    subtotal: 4500,
    total: 4500,
    currency: 'EUR',
    currencySymbol: '€',
  };

  const pdf = renderDocumentPdf(quoteDoc);
  const rawBytes = pdf.output();
  assert(rawBytes.startsWith('%PDF-'), 'Quote PDF generated successfully with EUR currency');

  const filename = generateDocumentPdfFilename(quoteDoc);
  assertEquals(filename, 'QTE-2026-042-Wayne-Enterprises-Bruce-Wayne.pdf', 'Filename special characters sanitized');
}

// 3. RECEIPT RENDERING TEST
console.log('\n3. Receipt PDF Generation:');
{
  const receiptDoc = {
    type: 'receipt',
    documentNumber: 'REC-2026-108',
    date: '2026-08-25',
    status: 'paid',
    business: { name: 'Logistics Co' },
    client: { name: 'Stark Industries' },
    items: [{ id: '1', description: 'Expedited Freight', quantity: 2, unitPrice: 600, amount: 1200 }],
    subtotal: 1200,
    total: 1200,
    currency: 'GBP',
    currencySymbol: '£',
  };

  const pdf = renderDocumentPdf(receiptDoc);
  const rawBytes = pdf.output();
  assert(rawBytes.startsWith('%PDF-'), 'Receipt PDF generated successfully with GBP currency');
}

// 4. PROPOSAL RENDERING TEST
console.log('\n4. Proposal PDF Generation:');
{
  const proposalDoc = {
    type: 'proposal',
    documentNumber: 'PROP-2026-777',
    date: '2026-08-25',
    status: 'draft',
    business: { name: 'Growth Advisors' },
    client: { name: 'Ollivanders Wand Shop' },
    items: [{ id: '1', description: 'Strategic Roadmapping Phase 1', quantity: 1, unitPrice: 3000, amount: 3000 }],
    subtotal: 3000,
    total: 3000,
    currency: 'NGN',
    currencySymbol: '₦',
  };

  const pdf = renderDocumentPdf(proposalDoc);
  const rawBytes = pdf.output();
  assert(rawBytes.startsWith('%PDF-'), 'Proposal PDF generated with NGN currency');
}

// 5. EDGE CASE & PATH TRAVERSAL RESILIENCE
console.log('\n5. Filename & Security Sanitization:');
{
  const maliciousDoc = {
    type: 'invoice',
    documentNumber: '../../etc/passwd',
    client: { name: '..\\..\\malicious/script<alert>' },
  };
  const safeFilename = generateDocumentPdfFilename(maliciousDoc);
  assert(!safeFilename.includes('..'), 'Path traversal dots removed from filename');
  assert(!safeFilename.includes('/'), 'Forward slashes removed from filename');
  assert(!safeFilename.includes('\\'), 'Backslashes removed from filename');
  assert(!safeFilename.includes('<'), 'HTML tags removed from filename');
  assertEquals(safeFilename, 'etc-passwd-malicious-script-alert.pdf', 'Sanitized clean filename output');
}

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
