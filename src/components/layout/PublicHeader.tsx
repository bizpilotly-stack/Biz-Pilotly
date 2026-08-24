import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Menu, X } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { authService } from '../../services/authService';
import { BrandLogo } from '../common/BrandLogo';

export const PublicHeader: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Calculators', path: '/calculators' },
    { label: 'Documents', path: '/documents' },
    { label: 'Business', path: '/business' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="public-header">
      <div className="container public-nav-container">
        <Link to="/" aria-label={`${BRAND_NAME} Home`}>
          <BrandLogo size="md" variant="dark" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="public-nav-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA & User Actions */}
        <div className="public-nav-actions">
          {isAuthenticated ? (
            <Link to="/app" className="btn btn-black btn-sm">
              <LayoutDashboard size={15} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <span>Get Started Free</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ display: 'none' }}
            id="mobileMenuToggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-color)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="nav-link"
              style={{ fontSize: '1rem', fontWeight: 600, padding: '0.5rem 0' }}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary"
              style={{ justifyContent: 'center' }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
