import React from 'react';

interface ConnectionLines3DProps {
  progress?: number;
}

export const ConnectionLines3D: React.FC<ConnectionLines3DProps> = ({
  progress = 1,
}) => {
  const opacity = Math.min(1, Math.max(0.3, progress));

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        opacity: opacity,
        transition: 'opacity 0.3s ease',
      }}
      viewBox="0 0 580 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="circuitGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#C9A227" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </linearGradient>

        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Client -> Proposal Pathway */}
      <path
        d="M 120 110 C 180 80, 220 70, 270 80"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1.5"
      />
      <path
        d="M 120 110 C 180 80, 220 70, 270 80"
        stroke="url(#circuitGoldGradient)"
        strokeWidth="2"
        className="circuit-path-flow"
        filter="url(#glowFilter)"
      />

      {/* 2. Proposal -> Central Hub Pathway */}
      <path
        d="M 310 110 C 310 160, 290 180, 290 200"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1.5"
      />
      <path
        d="M 310 110 C 310 160, 290 180, 290 200"
        stroke="#A78BFA"
        strokeWidth="2"
        className="circuit-path-flow"
        filter="url(#glowFilter)"
      />

      {/* 3. Central Hub -> Invoice Pathway */}
      <path
        d="M 325 220 C 380 200, 420 160, 460 140"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1.5"
      />
      <path
        d="M 325 220 C 380 200, 420 160, 460 140"
        stroke="#FBBF24"
        strokeWidth="2"
        className="circuit-path-flow"
        filter="url(#glowFilter)"
      />

      {/* 4. Invoice -> Payment Pathway */}
      <path
        d="M 470 170 C 490 240, 480 280, 460 320"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1.5"
      />
      <path
        d="M 470 170 C 490 240, 480 280, 460 320"
        stroke="#34D399"
        strokeWidth="2"
        className="circuit-path-flow"
        filter="url(#glowFilter)"
      />

      {/* 5. Expense -> Profit Inflow Pathway */}
      <path
        d="M 140 340 C 180 370, 220 380, 260 380"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1.5"
      />
      <path
        d="M 140 340 C 180 370, 220 380, 260 380"
        stroke="#F87171"
        strokeWidth="2"
        className="circuit-path-flow"
        filter="url(#glowFilter)"
      />

      {/* 6. Payment -> Realized Net Profit Pathway */}
      <path
        d="M 420 350 C 380 380, 340 380, 310 380"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1.5"
      />
      <path
        d="M 420 350 C 380 380, 340 380, 310 380"
        stroke="url(#circuitGoldGradient)"
        strokeWidth="2.5"
        className="circuit-path-flow"
        filter="url(#glowFilter)"
      />
    </svg>
  );
};
