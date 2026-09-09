import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileCheck2,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Send,
  Building2,
  Sparkles,
} from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';

interface MetricTab {
  id: 'revenue' | 'profit' | 'receivables';
  label: string;
  value: string;
  subtext: string;
  trend: string;
  chartHeights: number[];
}

export const LiveBusinessCockpit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'profit' | 'receivables'>('revenue');
  const [activeStep, setActiveStep] = useState<number>(2);
  const [pulse, setPulse] = useState(false);

  // Pulse animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const metrics: Record<'revenue' | 'profit' | 'receivables', MetricTab> = {
    revenue: {
      id: 'revenue',
      label: 'Gross Billed',
      value: '$24,850.00',
      subtext: '+28.4% vs last month',
      trend: '+28.4%',
      chartHeights: [45, 62, 58, 80, 72, 95, 88, 100],
    },
    profit: {
      id: 'profit',
      label: 'Realized Net Profit',
      value: '$18,630.00',
      subtext: '74.9% healthy margin',
      trend: '+19.2%',
      chartHeights: [38, 50, 48, 68, 60, 82, 75, 90],
    },
    receivables: {
      id: 'receivables',
      label: 'Active Receivables',
      value: '$3,420.00',
      subtext: '2 pending client settlements',
      trend: '94% On-time',
      chartHeights: [65, 45, 30, 20, 15, 25, 18, 12],
    },
  };

  const currentMetric = metrics[activeTab];

  const workflowSteps = [
    { num: 1, name: 'Scope & Quote', status: 'Approved', icon: <FileCheck2 size={13} />, time: 'Yesterday' },
    { num: 2, name: 'Smart Invoice #INV-2026', status: 'Sent to Client', icon: <Send size={13} />, time: '2h ago' },
    { num: 3, name: 'Online Settlement', status: 'Paid via Card', icon: <CreditCard size={13} />, time: 'Just now' },
    { num: 4, name: 'Proof Receipt', status: 'Auto-Dispatched', icon: <CheckCircle2 size={13} />, time: 'Instant' },
  ];

  return (
    <div
      className="live-business-cockpit"
      style={{
        width: '100%',
        maxWidth: '560px',
        background: 'linear-gradient(145deg, #0B1F3A 0%, #061120 100%)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 20px 45px -10px rgba(11, 31, 58, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Ambient Background Accent */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 162, 39, 0.25) 0%, rgba(201, 162, 39, 0) 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      {/* Cockpit Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.875rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'rgba(201, 162, 39, 0.2)',
              border: '1px solid rgba(201, 162, 39, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C9A227',
            }}
          >
            <Building2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Apex Design Studio
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span>Verified Business Workspace • {BRAND_NAME}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#F8FAFC',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Sparkles size={12} color="#C9A227" />
          <span>Real-time OS</span>
        </div>
      </div>

      {/* Interactive Metric Switcher Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        {(['revenue', 'profit', 'receivables'] as const).map((tabKey) => {
          const item = metrics[tabKey];
          const isSelected = activeTab === tabKey;

          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid rgba(201, 162, 39, 0.6)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '0.625rem 0.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.6875rem', color: isSelected ? '#E2E8F0' : '#94A3B8', fontWeight: 600 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginTop: '2px', color: isSelected ? '#ffffff' : '#CBD5E1' }}>
                {item.value}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Mini Chart & Highlight Bar */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '14px',
          padding: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 700 }}>
              Performance Analytics
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {currentMetric.value}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <ArrowUpRight size={13} />
            <span>{currentMetric.trend}</span>
          </div>
        </div>

        {/* Dynamic Histogram Bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            height: '48px',
            paddingTop: '6px',
          }}
        >
          {currentMetric.chartHeights.map((h, i) => {
            const isHighest = h === 100;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: isHighest
                    ? 'linear-gradient(180deg, #C9A227 0%, #A37F16 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                  borderRadius: '4px',
                  transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Live Lifecycle Workflow Progress */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 700 }}>
            Live Project Milestone
          </span>
          <span style={{ fontSize: '0.6875rem', color: '#C9A227', fontWeight: 700 }}>
            Step 3 of 4: Settlement
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
          {workflowSteps.map((step) => {
            const isCompleted = step.num <= activeStep;
            const isCurrent = step.num === activeStep;

            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                style={{
                  background: isCurrent
                    ? 'rgba(201, 162, 39, 0.15)'
                    : isCompleted
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent
                    ? '1px solid rgba(201, 162, 39, 0.6)'
                    : isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.375rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    color: isCurrent ? '#C9A227' : isCompleted ? '#10B981' : '#64748B',
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '3px',
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {step.name}
                </div>
                <div style={{ fontSize: '0.5625rem', color: isCompleted ? '#34D399' : '#64748B', marginTop: '1px' }}>
                  {step.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Assurance Strip */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: '#94A3B8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>Bilateral Audit Ledger & Direct Bank / Card Settled</span>
        </div>
        <div style={{ color: '#E2E8F0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: pulse ? '#C9A227' : '#10B981', transition: 'background 0.5s' }} />
          <span>Syncing Live</span>
        </div>
      </div>
    </div>
  );
};
