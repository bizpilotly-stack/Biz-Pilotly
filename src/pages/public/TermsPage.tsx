import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, FileText } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';

export const TermsPage: React.FC = () => {
  return (
    <div className="section-py-sm">
      <SEO
        title={`Terms of Service | ${BRAND_NAME}`}
        description={`Read the Terms of Service for using ${BRAND_NAME} business tools, financial calculators, and document generators.`}
        canonical="https://bizpilotly.com/terms"
      />

      <div className="container" style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="badge badge-info" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={14} /> Legal Agreement
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--brand-black)',
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}
          >
            Terms of Service
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
            Last Updated: September 2026 • Effective Date: September 2026
          </p>
        </div>

        {/* Content Body */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            lineHeight: 1.75,
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
          }}
        >
          <p style={{ marginBottom: '1.5rem' }}>
            Welcome to <strong>{BRAND_NAME}</strong> ("Platform", "we", "us", or "our"). By creating an account, accessing, or using BizPilotly at <a href="https://bizpilotly.com" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>bizpilotly.com</a>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            1. Description of Service
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            {BRAND_NAME} provides freelancers, consultants, independent contractors, and small businesses with financial calculators, document creation engines (invoices, quotes, estimates, proposals, receipts, and contracts), online payment processing links, and business tracking utilities.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            2. User Accounts & Responsibilities
          </h2>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>You must provide accurate, current, and complete registration information during signup.</li>
            <li style={{ marginBottom: '0.5rem' }}>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
            <li style={{ marginBottom: '0.5rem' }}>You agree not to use the platform for unlawful, fraudulent, or abusive purposes, including issuing fictitious invoices, misrepresenting credentials, or money laundering.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            3. Financial Calculations & Document Accuracy
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            {BRAND_NAME}'s calculators and document generators are designed to assist with operational workflows and pricing clarity. While we make every effort to ensure algorithmic and mathematical precision, {BRAND_NAME} does not provide certified accounting, tax, or legal advice. You are solely responsible for verifying tax percentages, line item totals, currency rates, and terms before issuing binding financial documents to clients.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            4. Payments & Third-Party Gateways
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Online payment settlements on documents created via {BRAND_NAME} are facilitated by licensed third-party payment providers (including Flutterwave, Squad, and partner banking networks). Settlement timelines, payout schedules, chargeback policies, and processing fees are subject to the applicable payment processor’s operating terms.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            5. Intellectual Property & Your Content
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You retain 100% ownership over all client records, branding assets, custom terms, and document data uploaded or created within your workspace. {BRAND_NAME} retains all intellectual property rights in the platform design, software code, visual assets, and trademarks.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            6. Limitation of Liability
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            To the maximum extent permitted by applicable law, {BRAND_NAME} and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from service interruptions, loss of business profits, payment processor downtimes, or data loss.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            7. Contact Information
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have questions, feedback, or legal inquiries regarding these Terms of Service, please reach out to our legal and support team at:
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--brand-navy-50)',
              color: 'var(--brand-navy-800)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
            }}
          >
            <Mail size={16} />
            <a href="mailto:bizpilotly@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
              bizpilotly@gmail.com
            </a>
          </div>
        </div>

        {/* Footer Quick Links */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem' }}>
          <Link to="/privacy" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Privacy Policy</Link>
          <Link to="/refund-policy" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Refund & Cancellation Policy</Link>
          <Link to="/contact" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Contact Support</Link>
        </div>
      </div>
    </div>
  );
};
