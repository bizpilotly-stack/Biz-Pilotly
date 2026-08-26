import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Percent,
  TrendingUp,
  BarChart2,
  Target,
  Tag,
  BadgePercent,
  Coins,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CALCULATORS_DATA, BRAND_NAME } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';
import { PageHeader } from '../../components/common/PageHeader';

export const AppCalculatorsHubPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coins': return <Coins size={22} />;
      case 'Percent': return <Percent size={22} />;
      case 'TrendingUp': return <TrendingUp size={22} />;
      case 'BarChart2': return <BarChart2 size={22} />;
      case 'Target': return <Target size={22} />;
      case 'Tag': return <Tag size={22} />;
      case 'BadgePercent': return <BadgePercent size={22} />;
      default: return <Calculator size={22} />;
    }
  };

  const categories = [
    { id: 'all', label: 'All 8 Calculators' },
    { id: 'pricing', label: 'Pricing & Margins' },
    { id: 'finance', label: 'Profit & Break-Even' },
    { id: 'sales', label: 'Sales & Discounts' },
    { id: 'growth', label: 'Growth & ROI' },
  ];

  const filteredCalculators = selectedCategory === 'all'
    ? CALCULATORS_DATA
    : CALCULATORS_DATA.filter((c) => c.category === selectedCategory);

  return (
    <div>
      <SEO
        title={`Workspace Calculators | ${BRAND_NAME}`}
        description="Instant business calculations for pricing, profit margins, markups, commissions, and break-even thresholds."
      />

      <PageHeader
        title="Business Calculators"
        description="Instant financial and pricing tools directly connected to your client billing and invoices."
        actions={
          <Link to="/app/documents/invoice" className="btn btn-primary btn-sm">
            <span>New Invoice</span>
            <ArrowRight size={14} />
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', fontSize: '0.8125rem' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Calculator Grid */}
      <div className="calc-hub-grid">
        {filteredCalculators.map((calc) => (
          <Link
            key={calc.id}
            to={`/app/calculators/${calc.slug}`}
            className="calc-card"
          >
            <div>
              <div className="calc-card-icon">
                {getIcon(calc.iconName)}
              </div>
              <h3 className="calc-card-title">{calc.title}</h3>
              <p className="calc-card-desc">{calc.shortDescription}</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                  {calc.category}
                </span>
                <div className="calc-card-action">
                  <span>Open Calculator</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Invoicing Bridge */}
      <div className="calc-cta-banner" style={{ marginTop: '2.5rem' }}>
        <div className="calc-cta-text">
          <h3>Ready to bill a client?</h3>
          <p>Create an invoice or quote based on your calculation and track it in your dashboard ledger.</p>
        </div>
        <Link to="/app/documents/invoice" className="btn btn-gold">
          <Sparkles size={16} />
          <span>Create Document</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
