import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  hideText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'dark',
  hideText = false,
}) => {
  const iconSizes = {
    sm: 26,
    md: 32,
    lg: 40,
  };

  const fontSizes = {
    sm: '0.9375rem',
    md: '1.125rem',
    lg: '1.375rem',
  };

  const iconDim = iconSizes[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {/* Abstract Direction & Business Control Nexus Icon */}
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect
          width="40"
          height="40"
          rx="10"
          fill={variant === 'light' ? '#0B1F3A' : '#0A0A0A'}
          stroke={variant === 'light' ? 'rgba(255,255,255,0.15)' : '#262626'}
          strokeWidth="1.5"
        />
        {/* White Ascending Arrow / Chevron */}
        <path
          d="M 11 26 L 20 10 L 29 26 L 20 21 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />
        {/* Gold Directional Diamond Anchor */}
        <polygon
          points="20,13 24.5,22 20,19 15.5,22"
          fill="#C9A227"
        />
        {/* Precision Node */}
        <circle cx="20" cy="30" r="2.2" fill="#C9A227" />
      </svg>

      {!hideText && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: fontSizes[size],
            letterSpacing: '-0.03em',
            color: variant === 'light' ? '#FFFFFF' : '#0A0A0A',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Biz<span style={{ color: '#C9A227' }}>Pilotly</span>
        </span>
      )}
    </div>
  );
};
