import React from 'react';
import { PricingCurrency, SUPPORTED_PRICING_CURRENCIES } from '../../config/pricing';

interface CurrencySelectorProps {
  value: PricingCurrency;
  onChange: (currency: PricingCurrency) => void;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`currency-selector-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface-muted, #f1f5f9)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '9999px',
        padding: '3px',
      }}
    >
      {SUPPORTED_PRICING_CURRENCIES.map((c) => {
        const isSelected = value === c.code;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => onChange(c.code)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              border: 'none',
              background: isSelected ? '#0B1F3A' : 'transparent',
              color: isSelected ? '#ffffff' : 'var(--text-secondary, #475569)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            title={`View pricing in ${c.label}`}
          >
            <span>{c.flag}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
};
