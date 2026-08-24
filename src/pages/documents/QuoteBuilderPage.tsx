import React from 'react';
import { DocumentEditorLayout } from '../../components/documents/DocumentEditorLayout';
import { INITIAL_DOCUMENTS } from '../../mock/documents';

export const QuoteBuilderPage: React.FC = () => {
  const quoteDoc = INITIAL_DOCUMENTS.find((d) => d.type === 'quote') || INITIAL_DOCUMENTS[0];

  return (
    <DocumentEditorLayout
      initialDocument={quoteDoc}
      documentType="quote"
      title="Quote"
      badgeLabel="Cost Estimate"
    />
  );
};
