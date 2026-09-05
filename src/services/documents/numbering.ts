import { DocumentType } from './types';

export const DEFAULT_PREFIXES: Record<DocumentType, string> = {
  invoice: 'INV',
  quote: 'QTE',
  estimate: 'EST',
  proposal: 'PROP',
  contract: 'CON',
  receipt: 'REC',
};

/**
 * Formats a document number in standard BizPilotly format: PREFIX-YYYY-0001
 */
export function formatDocumentNumber(prefix: string, year: number, sequence: number): string {
  const safePrefix = (prefix || 'DOC').toUpperCase().trim();
  const safeYear = year || new Date().getFullYear();
  const safeSequence = Math.max(1, Number(sequence) || 1);
  const padded = String(safeSequence).padStart(4, '0');
  return `${safePrefix}-${safeYear}-${padded}`;
}

/**
 * Calculates the next sequential document reference in ascending order based on existing documents.
 */
export function getNextSequentialDocumentNumber(
  type: DocumentType,
  existingDocs: { documentNumber?: string; type?: string }[] = [],
  customPrefix?: string
): string {
  const year = new Date().getFullYear();
  const prefix = customPrefix || DEFAULT_PREFIXES[type] || 'DOC';

  let maxSeq = 0;
  for (const doc of existingDocs) {
    if (doc.documentNumber) {
      const match = doc.documentNumber.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  return formatDocumentNumber(prefix, year, maxSeq + 1);
}

/**
 * Generates an initial draft document number.
 */
export function generateDocumentNumber(type: DocumentType, customPrefix?: string): string {
  const year = new Date().getFullYear();
  const prefix = customPrefix || DEFAULT_PREFIXES[type] || 'DOC';
  return formatDocumentNumber(prefix, year, 1);
}

export function getDefaultDocumentTitle(type: DocumentType): string {
  switch (type) {
    case 'invoice':
      return 'Client Billing Invoice';
    case 'quote':
      return 'Formal Price Quote';
    case 'estimate':
      return 'Provisional Project Estimate';
    case 'receipt':
      return 'Official Payment Receipt';
    case 'proposal':
      return 'Business Project Proposal';
    case 'contract':
      return 'Client Service Agreement & Contract';
    default:
      return 'Business Document';
  }
}
