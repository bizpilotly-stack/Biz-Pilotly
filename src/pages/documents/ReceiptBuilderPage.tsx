import React from 'react';
import { DocumentEditorLayout } from '../../components/documents/DocumentEditorLayout';
import { INITIAL_DOCUMENTS } from '../../mock/documents';

export const ReceiptBuilderPage: React.FC = () => {
  const receiptDoc = INITIAL_DOCUMENTS.find((d) => d.type === 'receipt') || INITIAL_DOCUMENTS[0];

  return (
    <DocumentEditorLayout
      initialDocument={receiptDoc}
      documentType="receipt"
      title="Payment Receipt"
      badgeLabel="Proof of Settlement"
    />
  );
};
