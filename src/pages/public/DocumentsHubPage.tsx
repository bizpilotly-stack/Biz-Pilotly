import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FileSpreadsheet,
  Receipt,
  FileCheck,
  ArrowRight,
  Printer,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';

export const DocumentsHubPage: React.FC = () => {
  const documentTools = [
    {
      id: 'invoice',
      title: 'Invoice Builder',
      path: '/documents/invoice',
      icon: <Receipt size={24} />,
      badge: 'Most Popular',
      description: 'Create professional, itemized billing statements with custom tax rates, discount lines, and direct bank settlement details.',
      features: ['Live side-by-side paper preview', 'Print to PDF ready', 'Multi-currency selector', 'Automatic subtotal and tax math'],
    },
    {
      id: 'quote',
      title: 'Quote & Estimate Generator',
      path: '/documents/quote',
      icon: <FileSpreadsheet size={24} />,
      badge: 'Essential',
      description: 'Send clear, structured cost estimates with expiration dates to win prospect alignment before initiating work.',
      features: ['Custom validity expiration dates', 'Discount allowance lines', 'Scope breakdowns', 'Convert to invoice in one click'],
    },
    {
      id: 'receipt',
      title: 'Payment Receipt Creator',
      path: '/documents/receipt',
      icon: <FileCheck size={24} />,
      badge: 'Record Keeping',
      description: 'Issue clean official payment acknowledgments and transaction proofs to clients upon funds receipt.',
      features: ['Payment method recording', 'Transaction reference tags', 'Printable proof of payment', 'Client billing ledger sync'],
    },
    {
      id: 'proposal',
      title: 'Project Proposal Builder',
      path: '/documents/proposal',
      icon: <FileText size={24} />,
      badge: 'Pitching',
      description: 'Present comprehensive project scopes, phase deliverables, and investment pricing to win high-ticket engagements.',
      features: ['Multi-phase deliverables breakdown', 'Terms & revision scope notes', 'Executive summary format', 'Professional typography'],
    },
  ];

  return (
    <div className="section-py-sm">
      <SEO
        title={`Business Document Builders | ${BRAND_NAME}`}
        description="Create professional, printable Invoices, Quotes, Receipts, and Proposals with real-time side-by-side preview."
        canonical="https://bizpilotly.com/documents"
      />

      <div className="container">
        <div className="text-center" style={{ maxWidth: '720px', margin: '0 auto 3rem' }}>
          <div className="badge badge-info" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>Pillar 2: Professional Documents</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Business Document Hub
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Generate high-standard, printable client documents in seconds. Form fields on the left automatically sync with a real-time professional document preview on the right.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {documentTools.map((tool) => (
            <div
              key={tool.id}
              className="card card-hover"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {tool.icon}
                  </div>
                  <span className="badge badge-gold">{tool.badge}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {tool.description}
                </p>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  {tool.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={15} color="#1d4ed8" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to={tool.path} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <span>Build {tool.title.split(' ')[0]} Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: '2rem', marginTop: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-navy-600)' }}>
              <Printer size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Print & PDF Ready Without Complex Plugins</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Our clean print stylesheet renders standard A4/US-Letter proportions directly in your browser.</p>
            </div>
          </div>
          <Link to="/documents/invoice" className="btn btn-secondary btn-sm">Try Live Builder</Link>
        </div>
      </div>
    </div>
  );
};
