import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessDocument } from '../../types';
import { formatCurrencyAmount } from '../documents';

export interface RenderPdfOptions {
  returnType?: 'blob' | 'arraybuffer' | 'datauristring';
}

/**
 * Deterministic human-readable filename generator with path traversal sanitization.
 */
export function generateDocumentPdfFilename(doc: BusinessDocument): string {
  const sanitize = (str: string) =>
    str.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const prefix = sanitize(doc.documentNumber || doc.type.toUpperCase());
  const clientName = sanitize(doc.client?.name || doc.client?.company || 'Client');
  return `${prefix}-${clientName}.pdf`;
}

/**
 * Pure document PDF rendering engine consuming the shared BusinessDocument model.
 */
export function renderDocumentPdf(doc: BusinessDocument): jsPDF {
  const docTypeLabels: Record<string, string> = {
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
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const brandNavy = [11, 31, 58] as const; // #0B1F3A
  const textDark = [30, 41, 59] as const; // #1E293B
  const textMuted = [100, 116, 139] as const; // #64748B
  const borderLight = [226, 232, 240] as const; // #E2E8F0
  const bgSubtle = [248, 250, 252] as const; // #F8FAFC

  let currentY = margin;

  // 1. TOP HEADER: Business Branding & Document Title
  let textStartX = margin;
  if (doc.business?.logo) {
    try {
      if (doc.business.logo.startsWith('data:image')) {
        pdf.addImage(doc.business.logo, 'PNG', margin, currentY, 18, 18);
        textStartX = margin + 22;
      }
    } catch {
      // Graceful fallback if image format cannot be parsed by jsPDF
    }
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(...brandNavy);
  pdf.text(doc.business?.name || 'My Business Studio', textStartX, currentY + 6);

  // Document Type Header
  pdf.setFontSize(16);
  pdf.setTextColor(...brandNavy);
  const typeTitle = docTypeLabels[doc.type] || doc.type.toUpperCase();
  pdf.text(typeTitle, pageWidth - margin, currentY + 6, { align: 'right' });

  currentY += 12;

  // Tagline / Subtitle
  if (doc.business?.tagline) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...textMuted);
    pdf.text(doc.business.tagline, textStartX, currentY);
    currentY += 5;
  }

  // Header Divider
  pdf.setDrawColor(...borderLight);
  pdf.setLineWidth(0.4);
  pdf.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
  currentY += 8;

  // 2. METADATA & RECIPIENT GRID (2 Columns)
  const colWidth = (contentWidth - 10) / 2;

  // Left Column: Business & Client Details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...textMuted);
  pdf.text('ISSUED FROM:', margin, currentY);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...textDark);
  pdf.text(doc.business?.name || 'Business', margin, currentY + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...textMuted);
  let fromY = currentY + 9;
  if (doc.business?.email) {
    pdf.text(doc.business.email, margin, fromY);
    fromY += 4;
  }
  if (doc.business?.phone) {
    pdf.text(doc.business.phone, margin, fromY);
    fromY += 4;
  }
  if (doc.business?.address) {
    const splitAddr = pdf.splitTextToSize(doc.business.address, colWidth);
    pdf.text(splitAddr, margin, fromY);
    fromY += splitAddr.length * 4;
  }

  // Client Details (Below Business Details)
  let clientY = fromY + 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...textMuted);
  pdf.text('BILLED TO (CLIENT):', margin, clientY);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...textDark);
  pdf.text(doc.client?.name || 'Valued Client', margin, clientY + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...textMuted);
  let clientInfoY = clientY + 9;
  if (doc.client?.company) {
    pdf.text(doc.client.company, margin, clientInfoY);
    clientInfoY += 4;
  }
  if (doc.client?.email) {
    pdf.text(doc.client.email, margin, clientInfoY);
    clientInfoY += 4;
  }
  if (doc.client?.phone) {
    pdf.text(doc.client.phone, margin, clientInfoY);
    clientInfoY += 4;
  }
  if (doc.client?.address) {
    const splitAddr = pdf.splitTextToSize(doc.client.address, colWidth);
    pdf.text(splitAddr, margin, clientInfoY);
    clientInfoY += splitAddr.length * 4;
  }

  // Right Column: Document Details Box
  const rightColX = margin + colWidth + 10;
  pdf.setFillColor(...bgSubtle);
  pdf.roundedRect(rightColX, currentY - 2, colWidth, 42, 2, 2, 'F');
  pdf.setDrawColor(...borderLight);
  pdf.roundedRect(rightColX, currentY - 2, colWidth, 42, 2, 2, 'D');

  let metaY = currentY + 4;
  const drawMetaRow = (label: string, value: string) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...textMuted);
    pdf.text(label, rightColX + 5, metaY);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...textDark);
    pdf.text(value, rightColX + colWidth - 5, metaY, { align: 'right' });
    metaY += 6.5;
  };

  drawMetaRow('Document Number:', doc.documentNumber || 'DRAFT');
  drawMetaRow('Issue Date:', doc.date || 'N/A');
  if (doc.dueDate && (doc.type === 'invoice' || doc.type === 'receipt')) {
    drawMetaRow('Payment Due:', doc.dueDate);
  }
  if (doc.validUntil && doc.type === 'quote') {
    drawMetaRow('Quote Valid Until:', doc.validUntil);
  }
  drawMetaRow('Status:', (doc.status || 'draft').toUpperCase());
  drawMetaRow('Currency:', `${doc.currency || 'USD'} (${doc.currencySymbol || '$'})`);

  currentY = Math.max(clientInfoY + 4, currentY + 46);

  // 3. DOCUMENT SCOPE / TITLE
  if (doc.title) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...brandNavy);
    pdf.text(`Subject: ${doc.title}`, margin, currentY);
    currentY += 6;
  }

  // 4. LINE ITEMS TABLE
  const tableData = (doc.items || []).map((item, idx) => [
    String(idx + 1),
    item.description || 'Item / Service Description',
    String(item.quantity ?? 1),
    formatCurrencyAmount(item.unitPrice ?? 0, doc.currency, doc.currencySymbol),
    formatCurrencyAmount(item.amount ?? 0, doc.currency, doc.currencySymbol),
  ]);

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData.length > 0 ? tableData : [['1', 'General Service', '1', '$0.00', '$0.00']],
    theme: 'grid',
    headStyles: {
      fillColor: [11, 31, 58],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      textColor: [30, 41, 59],
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
  });

  // Get final Y after table
  const finalY = (pdf as any).lastAutoTable?.finalY || currentY + 30;
  currentY = finalY + 6;

  // 5. TOTALS SUMMARY BOX (Right Aligned)
  const totalsWidth = 70;
  const totalsX = pageWidth - margin - totalsWidth;

  let totY = currentY;
  const drawTotalRow = (label: string, amount: number, isBold = false) => {
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setFontSize(isBold ? 10 : 8.5);
    pdf.setTextColor(isBold ? brandNavy[0] : textMuted[0], isBold ? brandNavy[1] : textMuted[1], isBold ? brandNavy[2] : textMuted[2]);
    pdf.text(label, totalsX, totY);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(isBold ? 10 : 8.5);
    pdf.setTextColor(isBold ? brandNavy[0] : textDark[0], isBold ? brandNavy[1] : textDark[1], isBold ? brandNavy[2] : textDark[2]);
    pdf.text(
      formatCurrencyAmount(amount, doc.currency, doc.currencySymbol),
      pageWidth - margin,
      totY,
      { align: 'right' }
    );
    totY += isBold ? 6 : 5;
  };

  drawTotalRow('Subtotal:', doc.subtotal || 0);

  if (doc.discountRate && doc.discountRate > 0) {
    drawTotalRow(`Discount (${doc.discountRate}%):`, -(doc.discountAmount || 0));
  }

  if (doc.taxRate && doc.taxRate > 0) {
    drawTotalRow(`Tax / VAT (${doc.taxRate}%):`, doc.taxAmount || 0);
  }

  // Total divider
  pdf.setDrawColor(...borderLight);
  pdf.line(totalsX, totY - 1, pageWidth - margin, totY - 1);
  totY += 2;

  drawTotalRow('Total Amount Due:', doc.total || 0, true);

  // 6. PAYMENT DETAILS & TERMS / NOTES (Left Aligned beside Totals)
  const notesWidth = contentWidth - totalsWidth - 10;
  let notesY = currentY;

  // Bank details strictly on Invoices only
  if (doc.type === 'invoice' && (doc.paymentDetails?.bankName || doc.paymentDetails?.accountNumber)) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...brandNavy);
    pdf.text('Settlement / Payment Instructions:', margin, notesY);
    notesY += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...textDark);
    if (doc.paymentDetails.bankName) {
      pdf.text(`Bank: ${doc.paymentDetails.bankName}`, margin, notesY);
      notesY += 3.5;
    }
    if (doc.paymentDetails.accountName) {
      pdf.text(`Account Name: ${doc.paymentDetails.accountName}`, margin, notesY);
      notesY += 3.5;
    }
    if (doc.paymentDetails.accountNumber) {
      pdf.text(`Account (NUBAN): ${doc.paymentDetails.accountNumber}`, margin, notesY);
      notesY += 3.5;
    }
    const routing = doc.paymentDetails.routingOrIban || (doc.paymentDetails as any).routingCode;
    if (routing) {
      pdf.text(`Routing / SWIFT: ${routing}`, margin, notesY);
      notesY += 3.5;
    }
    notesY += 2;
  }

  if (doc.notes) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...brandNavy);
    pdf.text('Notes & Instructions:', margin, notesY);
    notesY += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...textMuted);
    const splitNotes = pdf.splitTextToSize(doc.notes, notesWidth);
    pdf.text(splitNotes, margin, notesY);
    notesY += splitNotes.length * 3.5 + 2;
  }

  if (doc.terms) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...brandNavy);
    pdf.text('Terms & Conditions:', margin, notesY);
    notesY += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...textMuted);
    const splitTerms = pdf.splitTextToSize(doc.terms, notesWidth);
    pdf.text(splitTerms, margin, notesY);
    notesY += splitTerms.length * 3.5;
  }

  // 7. FOOTER (Bottom of page)
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...textMuted);
    pdf.text(
      `Generated by BizPilotly Platform — Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return pdf;
}
