import { BusinessDocument, DocumentValidationResult } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') return true; // Optional field
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validates a document across all business, customer, line-item, and financial fields.
 */
export function validateDocument(doc: BusinessDocument): DocumentValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // 1. Business Info Validation
  if (!doc.business?.name || doc.business.name.trim() === '') {
    errors['business.name'] = 'Business or Freelancer name is required.';
  }
  if (doc.business?.email && !validateEmail(doc.business.email)) {
    errors['business.email'] = 'Please enter a valid business email address.';
  }

  // 2. Client Info Validation
  if (!doc.client?.name || doc.client.name.trim() === '') {
    errors['client.name'] = 'Client contact or company name is required.';
  }
  if (doc.client?.email && !validateEmail(doc.client.email)) {
    errors['client.email'] = 'Please enter a valid client email address.';
  }

  // 3. Document Identification
  if (!doc.documentNumber || doc.documentNumber.trim() === '') {
    errors['documentNumber'] = 'Document reference number is required.';
  }
  if (!doc.date || isNaN(new Date(doc.date).getTime())) {
    errors['date'] = 'A valid issue date is required.';
  }

  // 4. Line Items Validation
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

  // 5. Tax & Discount Validation
  if (doc.taxRate < 0 || doc.taxRate > 100 || !Number.isFinite(doc.taxRate)) {
    errors['taxRate'] = 'Tax rate must be between 0% and 100%.';
  }
  if (doc.discountRate < 0 || doc.discountRate > 100 || !Number.isFinite(doc.discountRate)) {
    errors['discountRate'] = 'Discount rate must be between 0% and 100%.';
  }

  // Warnings (non-blocking)
  if (doc.total === 0) {
    warnings['total'] = 'Document total is $0.00.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}
