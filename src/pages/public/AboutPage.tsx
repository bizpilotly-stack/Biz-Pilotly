import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Heart, Award } from 'lucide-react';
import { BRAND_NAME, BRAND_TAGLINE } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';

export const AboutPage: React.FC = () => {
  return (
    <div className="section-py-sm">
      <SEO
        title={`About Our Mission | ${BRAND_NAME}`}
        description={`Learn why we built ${BRAND_NAME}: to give freelancers and independent contractors the financial control and clarity they deserve.`}
        canonical="https://example.com/about"
      />

      <div className="container">
        <div className="text-center" style={{ maxWidth: '760px', margin: '0 auto 3.5rem' }}>
          <div className="badge badge-info" style={{ marginBottom: '1rem' }}>Our Purpose</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Empowering the World's Independent Creators & Builders
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We founded {BRAND_NAME} around a simple, timeless principle: <strong>{BRAND_TAGLINE}</strong>. Every freelancer deserves clear pricing models, professional client presentation, and stress-free operations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Accuracy Over Guesswork</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Freelancers often underquote projects because margin calculation is separated from document creation. We build mathematical accuracy right into your workflow.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-gold-50)', color: 'var(--brand-gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Professional Standards</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your invoice is the final impression a client receives. We designed every document template to look like a high-end financial instrument rather than a generic receipt.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Heart size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Freelancer First</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We keep tools accessible, free of bloated enterprise setups, and focused on what actually saves you billable time.
            </p>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: '3rem 2rem', textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Ready to test our tools?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 2rem' }}>
            Try any of our free pricing calculators or create a printable invoice in less than 60 seconds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/calculators" className="btn btn-primary">
              <span>Explore Calculators</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/documents/invoice" className="btn btn-secondary">
              <span>Create Invoice</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
