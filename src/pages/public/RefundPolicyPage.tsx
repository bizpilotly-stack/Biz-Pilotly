import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowLeft, Mail } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="section-py-sm">
      <SEO
        title={`Refund & Cancellation Policy | ${BRAND_NAME}`}
        description={`Understand our straightforward refund, subscription cancellation, and billing policies at ${BRAND_NAME}.`}
        canonical="https://bizpilotly.com/refund-policy"
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
            <RotateCcw size={14} /> Billing & Cancellations
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
            Refund & Cancellation Policy
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
            At <strong>{BRAND_NAME}</strong>, we believe in transparent, straightforward pricing. We want you to be completely satisfied with our business calculation, invoicing, and management tools.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            1. Free-First Platform Experience
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We provide all core calculators and fundamental document builders with zero upfront commitment or credit card requirement. We strongly encourage all users to explore the free features and verify that {BRAND_NAME} meets their workflow needs before purchasing paid subscription tiers or extra team seats.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            2. Subscription Cancellations
          </h2>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Cancel Anytime:</strong> You may cancel your paid subscription at any moment directly from your <strong>Settings → Account Settings</strong> dashboard.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Access Until Period Ends:</strong> When you cancel, your subscription remains active until the end of your current paid billing cycle. You will not be billed again.
            </li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            3. Refund Eligibility
          </h2>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Monthly Plans:</strong> If you are unsatisfied with an initial monthly subscription upgrade, you are eligible for a 100% refund if requested within <strong>7 calendar days</strong> of the initial charge.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Annual Plans:</strong> For annual subscription plans, you are eligible for a full refund within <strong>14 calendar days</strong> of purchase or renewal.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Third-Party Processing Fees:</strong> Payment gateway processing fees incurred when your clients pay invoices through Flutterwave or Squad are charged by third-party processors and are non-refundable.
            </li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--brand-navy-900)' }}>
            4. How to Request a Refund
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            To initiate a refund request, simply send an email from your registered account email address to our billing team with your receipt or transaction reference:
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
              marginBottom: '1rem',
            }}
          >
            <Mail size={16} />
            <a href="mailto:bizpilotly@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
              bizpilotly@gmail.com
            </a>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Approved refunds are credited back to your original payment method within 5–10 business days depending on your financial institution.
          </p>
        </div>

        {/* Footer Quick Links */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem' }}>
          <Link to="/terms" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Privacy Policy</Link>
          <Link to="/contact" style={{ color: 'var(--brand-navy-600)', textDecoration: 'underline' }}>Contact Support</Link>
        </div>
      </div>
    </div>
  );
};
