import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Users,
  CreditCard,
  Receipt,
  TrendingUp,
  ArrowRight,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';

export const BusinessPage: React.FC = () => {
  const modules = [
    {
      title: 'Client Management',
      icon: <Users size={24} color="#1d4ed8" />,
      desc: 'Keep contacts, lifetime billing, pending balances, and active contracts organized with zero spreadsheet clutter.',
      link: '/app/clients',
    },
    {
      title: 'Payment Tracking',
      icon: <CreditCard size={24} color="#d97706" />,
      desc: 'Record wire transfers, card settlements, and check payments to keep your accounts receivable accurate.',
      link: '/app/payments',
    },
    {
      title: 'Expense Ledger',
      icon: <Receipt size={24} color="#1d4ed8" />,
      desc: 'Categorize business software, contractor costs, and equipment overheads for effortless tax prep and clarity.',
      link: '/app/expenses',
    },
    {
      title: 'Profit & Margins',
      icon: <TrendingUp size={24} color="#10b981" />,
      desc: 'Understand gross vs net margin percentages every single month to ensure your freelancing remains profitable.',
      link: '/app/profit',
    },
    {
      title: 'Business Identity Settings',
      icon: <Building size={24} color="#6366f1" />,
      desc: 'Store company address, tax registration number, logo, invoice prefixes, and standard payment instructions.',
      link: '/app/settings/business',
    },
    {
      title: 'Real-time Overview',
      icon: <LayoutDashboard size={24} color="#f59e0b" />,
      desc: 'A high-level command center with key metrics, outstanding balances, and recent invoice activity.',
      link: '/app',
    },
  ];

  return (
    <div className="section-py-sm">
      <SEO
        title={`Business Tools & Operations | ${BRAND_NAME}`}
        description="Unified operational tools for freelancers and small businesses to track clients, manage invoices, log expenses, and monitor net profit."
        canonical="https://example.com/business"
      />

      <div className="container">
        <div className="text-center" style={{ maxWidth: '720px', margin: '0 auto 3rem' }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            <Layers size={14} />
            <span>Pillar 3: Business Operations</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            All Your Freelance Operations in One Place
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Say goodbye to disorganized spreadsheets and fragmented tools. Our platform bridges the gap between calculating pricing, sending documents, and running day-to-day operations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
          {modules.map((m, idx) => (
            <div key={idx} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--bg-app)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {m.icon}
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {m.desc}
                </p>
              </div>
              <Link to={m.link} className="btn btn-outline btn-sm" style={{ width: 'fit-content' }}>
                <span>Open in App</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, var(--brand-black) 0%, #1e293b 100%)', color: '#ffffff', borderRadius: 'var(--radius-2xl)', padding: '3rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Ready to streamline your business?
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '540px', margin: '0 auto 2rem' }}>
            Get started right now with the free foundation. No credit card, no complicated onboarding.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-gold btn-lg">
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/app" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <span>Preview Dashboard Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
