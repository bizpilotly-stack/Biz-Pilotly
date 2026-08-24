import React from 'react';
import { DocumentEditorLayout } from '../../components/documents/DocumentEditorLayout';
import { INITIAL_DOCUMENTS } from '../../mock/documents';

export const InvoiceBuilderPage: React.FC = () => {
  const invoiceDoc = INITIAL_DOCUMENTS.find((d) => d.type === 'invoice') || INITIAL_DOCUMENTS[0];

  return (
    <DocumentEditorLayout
      initialDocument={invoiceDoc}
      documentType="invoice"
      title="Invoice"
      badgeLabel="Billing Statement"
    />
  );
};
