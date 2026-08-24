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

export const CalculatorsHubPage: React.FC = () => {
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
    <div className="section-py-sm">
      <SEO
        title={`Business Calculators Hub | ${BRAND_NAME}`}
        description="Free pricing, profit margin, markup, break-even, and ROI calculators engineered for freelancers and small service businesses."
        canonical="https://example.com/calculators"
      />

      <div className="container">
        <div className="text-center" style={{ maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>Financial Precision Tools</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Business Calculators Hub
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Accurately price your client engagements, optimize profit margins, and calculate sales splits. Every calculation seamlessly connects to your invoices and proposals.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
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
              to={`/calculators/${calc.slug}`}
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
                    <span>Calculate Now</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="calc-cta-banner">
          <div className="calc-cta-text">
            <h3>Calculated your price? Now send a professional invoice or quote.</h3>
            <p>Generate clean, printable business documents in seconds with side-by-side live sheet sync.</p>
          </div>
          <Link to="/documents/invoice" className="btn btn-gold">
            <span>Create Invoice</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
