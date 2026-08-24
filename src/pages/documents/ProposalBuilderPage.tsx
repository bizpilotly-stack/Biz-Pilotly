import React from 'react';
import { DocumentEditorLayout } from '../../components/documents/DocumentEditorLayout';
import { INITIAL_DOCUMENTS } from '../../mock/documents';

export const ProposalBuilderPage: React.FC = () => {
  const proposalDoc = INITIAL_DOCUMENTS.find((d) => d.type === 'proposal') || INITIAL_DOCUMENTS[0];

  return (
    <DocumentEditorLayout
      initialDocument={proposalDoc}
      documentType="proposal"
      title="Project Proposal"
      badgeLabel="Engagement Scope & Investment"
    />
  );
};
