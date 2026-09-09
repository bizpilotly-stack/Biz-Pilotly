import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Mail, Lock } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="section-py-sm">
      <SEO
        title={`Privacy Policy | ${BRAND_NAME}`}
        description={`Learn how ${BRAND_NAME} collects, protects, and securely manages your data, business documents, and client information.`}
        canonical="https://bizpilotly.com/privacy"
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
            <Lock size={14} /> Data Protection & Privacy
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
            Privacy Policy
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
            At <strong>{BRAND_NAME}</strong>, we take your privacy and business confidentiality seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal and business information when you use our platform.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: '0.75rem' }}>We collect the following categories of information to provide seamless business operations:</p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Account Data:</strong> Your name, email address, password authentication credentials, company name, logo, phone number, and tax registration identifiers.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Client & Transaction Data:</strong> Names, contact emails, billing addresses, and line-item scope details of clients to whom you issue documents.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Payment & Settlement Records:</strong> Transaction references, payment dates, currency codes, and status. <em>We never store sensitive full card numbers or banking PINs on our servers.</em>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Technical Logs:</strong> IP address, device type, browser specifications, and platform telemetry strictly used for security auditing and debugging.
            </li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            2. How We Use Your Information
          </h2>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>To generate and deliver printable, verifiable invoices, quotes, estimates, and receipts.</li>
            <li style={{ marginBottom: '0.5rem' }}>To facilitate real-time online invoice payment collection and issue automatic payment notifications.</li>
            <li style={{ marginBottom: '0.5rem' }}>To maintain audit trails, detect malicious activities, and protect multi-tenant database isolation.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            3. Third-Party Service Providers
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We do not sell, rent, or trade your data to third parties or data brokers. We share data only with essential infrastructure partners strictly necessary to run our service:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Payment Gateways:</strong> Flutterwave and Squad for processing customer payments.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Email Dispatch:</strong> Transactional mail engines (such as Resend) for document and receipt delivery.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cloud Hosting & Storage:</strong> Supabase and Vercel for encrypted database and secure storage hosting.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            4. Multi-Tenant Security & Storage
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            All business data in {BRAND_NAME} is protected by strict Row-Level Security (RLS) policies at the PostgreSQL database level. PDF documents and asset uploads are stored in isolated encrypted object buckets accessible solely by authorized business accounts.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            5. Your Data Rights
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You have the right to request a complete export of your business records, rectify incorrect information, or permanently delete your account and associated documents from our databases at any time.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            6. Privacy Inquiries & Contact
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            For privacy-related questions, data export requests, or erasure notices, please contact our Data Protection team at:
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
          <Link to="/terms" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Terms of Service</Link>
          <Link to="/refund-policy" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Refund & Cancellation Policy</Link>
          <Link to="/contact" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Contact Support</Link>
        </div>
      </div>
    </div>
  );
};
