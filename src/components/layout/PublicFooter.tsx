import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_NAME, BRAND_TAGLINE } from '../../constants/brand';
import { BrandLogo } from '../common/BrandLogo';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/">
              <BrandLogo size="lg" variant="light" />
            </Link>
            <p style={{ marginTop: '1rem', color: '#e2e8f0', fontWeight: 600 }}>
              {BRAND_TAGLINE}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.6 }}>
              The lightweight business operating platform for freelancers and small service businesses to price work, create professional documents, and organize operations.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Calculators</h4>
            <div className="footer-links">
              <Link to="/calculators/profit" className="footer-link">Profit Calculator</Link>
              <Link to="/calculators/profit-margin" className="footer-link">Profit Margin</Link>
              <Link to="/calculators/markup" className="footer-link">Markup Calculator</Link>
              <Link to="/calculators/roi" className="footer-link">ROI Calculator</Link>
              <Link to="/calculators/break-even" className="footer-link">Break-even</Link>
              <Link to="/calculators/discount" className="footer-link">Discount Calculator</Link>
              <Link to="/calculators" className="footer-link" style={{ color: '#C9A227' }}>All 8 Calculators →</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Documents</h4>
            <div className="footer-links">
              <Link to="/documents/invoice" className="footer-link">Invoice Generator</Link>
              <Link to="/documents/quote" className="footer-link">Quote Generator</Link>
              <Link to="/documents/receipt" className="footer-link">Receipt Creator</Link>
              <Link to="/documents/proposal" className="footer-link">Proposal Builder</Link>
              <Link to="/documents" className="footer-link" style={{ color: '#C9A227' }}>All Document Tools →</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Platform</h4>
            <div className="footer-links">
              <Link to="/business" className="footer-link">Business Overview</Link>
              <Link to="/pricing" className="footer-link">Pricing (Free First)</Link>
              <Link to="/about" className="footer-link">About BizPilotly</Link>
              <Link to="/contact" className="footer-link">Contact & Support</Link>
              <Link to="/login" className="footer-link">Log in</Link>
              <Link to="/signup" className="footer-link">Get Started Free</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
