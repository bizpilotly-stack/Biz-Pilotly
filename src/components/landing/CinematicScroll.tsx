import React, { useRef, useState, useEffect } from 'react';
import {
  AlertCircle,
  Clock,
  Calculator,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Sparkles,
  Activity,
} from 'lucide-react';

interface StageConfig {
  id: number;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  title: string;
  subtitle: string;
}

const STAGES: StageConfig[] = [
  {
    id: 1,
    badge: 'Phase 1 · The Everyday Reality',
    badgeColor: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    badgeBorder: 'rgba(239, 68, 68, 0.25)',
    title: 'The Chaos of Disconnected Tools',
    subtitle: 'Spreadsheets everywhere, uncalculated margins, missed payment follow-ups, and scattered client paperwork.',
  },
  {
    id: 2,
    badge: 'Phase 2 · Automated Alignment',
    badgeColor: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeBorder: 'rgba(245, 158, 11, 0.25)',
    title: 'Instant Connected Workflow',
    subtitle: 'From price calculation to document creation, automated ledger tracking links every business step.',
  },
  {
    id: 3,
    badge: 'Phase 3 · Unified Engine',
    badgeColor: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.12)',
    badgeBorder: 'rgba(56, 189, 248, 0.25)',
    title: 'The BizPilotly Command Center',
    subtitle: 'A single, high-contrast dashboard synthesizing revenue, real margins, client balances, and document status.',
  },
  {
    id: 4,
    badge: 'Phase 4 · Full Financial Mastery',
    badgeColor: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.25)',
    title: 'Realized Clarity & Confidence',
    subtitle: 'Know your exact profit before signing, get paid on time, and project executive authority to your clients.',
  },
];

export const CinematicScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [manualStage, setManualStage] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Determine current active stage (0 to 3) based on scroll progress (or manual override)
  const currentStageIndex = manualStage !== null
    ? manualStage
    : scrollProgress < 0.25
    ? 0
    : scrollProgress < 0.55
    ? 1
    : scrollProgress < 0.82
    ? 2
    : 3;

  const currentStage = STAGES[currentStageIndex];

  // Continuous interpolation helper
  const p = scrollProgress; // 0.0 to 1.0

  // Card Positions & Rotations based on scroll progress p
  // Stage 1 (Chaos, p: 0.0 - 0.25): cards are scattered, tilted, slightly red/amber tinted
  // Stage 2 (Alignment, p: 0.25 - 0.55): cards form an ordered horizontal pipeline
  // Stage 3 (Assembly, p: 0.55 - 0.82): cards fold directly into the Command Center dashboard
  // Stage 4 (Mastery, p: 0.82 - 1.0): Command Center expands with glowing metrics

  // Calculate interpolation factor between phases
  const getCardStyle = (cardIndex: number) => {
    // Card 0: Pricing & Margins
    // Card 1: Invoicing & Quotes
    // Card 2: Payment Tracking
    // Card 3: Net Profit Realization

    if (p < 0.25) {
      // CHAOS
      const chaosPositions = [
        { x: -280, y: -90, rot: -8, scale: 0.95, opacity: 1 },
        { x: 260, y: -100, rot: 7, scale: 0.95, opacity: 1 },
        { x: -260, y: 110, rot: 6, scale: 0.95, opacity: 1 },
        { x: 270, y: 120, rot: -6, scale: 0.95, opacity: 1 },
      ];
      const pos = chaosPositions[cardIndex];
      return {
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${pos.rot}deg) scale(${pos.scale})`,
        opacity: pos.opacity,
        zIndex: 10 + cardIndex,
      };
    } else if (p < 0.55) {
      // ALIGNED PIPELINE
      // Line them up horizontally in sequence
      const pipelineX = [-330, -110, 110, 330];
      const targetX = pipelineX[cardIndex];
      return {
        transform: `translate3d(${targetX}px, 0px, 0) rotate(0deg) scale(0.92)`,
        opacity: 1,
        zIndex: 15,
      };
    } else {
      // CONVERGED INTO DASHBOARD
      // Cards seamlessly scale down into the dashboard preview slots
      const dashboardSlotX = [-300, -100, 100, 300];
      const targetX = dashboardSlotX[cardIndex];
      return {
        transform: `translate3d(${targetX}px, -20px, 0) scale(0.82)`,
        opacity: p > 0.85 ? 0 : 0.4,
        pointerEvents: 'none' as const,
        zIndex: 5,
      };
    }
  };

  const isDashboardVisible = p >= 0.5;
  const dashboardScale = p < 0.55 ? 0.9 : p < 0.82 ? 0.98 : 1.02;
  const dashboardOpacity = p < 0.5 ? 0 : Math.min(1, (p - 0.5) / 0.15);

  return (
    <div ref={containerRef} className="cinematic-scroll-track" id="cinematic-experience">
      <div className="cinematic-sticky-viewport">
        {/* Ambient Subtle Animated Background Elements */}
        <div className="cinematic-grid-bg" />
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.08) 0%, rgba(11, 31, 58, 0) 70%)',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Dynamic Story Header */}
        <div className="cinematic-header">
          <div
            className="cinematic-phase-badge"
            style={{
              color: currentStage.badgeColor,
              backgroundColor: currentStage.badgeBg,
              border: `1px solid ${currentStage.badgeBorder}`,
            }}
          >
            <Sparkles size={13} />
            <span>{currentStage.badge}</span>
          </div>

          <h2 className="cinematic-headline">{currentStage.title}</h2>
          <p className="cinematic-subtext">{currentStage.subtitle}</p>
        </div>

        {/* Visual Arena Container */}
        <div className="cinematic-arena">
          {/* Animated Connecting Vector Path (Visible in Stage 2) */}
          <svg
            className="cinematic-svg-canvas"
            viewBox="0 0 1000 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: p >= 0.25 && p <= 0.65 ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            <path
              d="M 180 250 L 380 250 L 600 250 L 820 250"
              stroke="url(#cinematicGoldGradient)"
              strokeWidth="3"
              strokeDasharray="6 6"
              className="cinematic-flow-path"
              style={{ strokeDashoffset: -p * 200 }}
            />
            <defs>
              <linearGradient id="cinematicGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* CARD 1: Pricing / Calculator */}
          <div
            className="cinematic-card"
            style={{
              width: '240px',
              ...getCardStyle(0),
              borderLeft: p < 0.25 ? '3px solid #EF4444' : '3px solid #F59E0B',
            }}
          >
            <div className="cinematic-card-tag" style={{ color: p < 0.25 ? '#EF4444' : '#F59E0B' }}>
              {p < 0.25 ? <AlertCircle size={14} /> : <Calculator size={14} />}
              <span>{p < 0.25 ? 'Uncertain Margins' : 'Step 1 · Profit Model'}</span>
            </div>
            <div className="cinematic-card-title">
              {p < 0.25 ? 'Hourly Guesswork' : 'Margin Engine'}
            </div>
            <div className="cinematic-card-desc">
              {p < 0.25
                ? 'Undercharging by 35% without factoring tax overheads.'
                : 'Targeting 45% net margin with calibrated hourly floor.'}
            </div>
            <div className="cinematic-card-metric" style={{ color: p < 0.25 ? '#EF4444' : '#F59E0B' }}>
              {p < 0.25 ? '$45/hr (Lost Profit)' : '$135.00/hr ✓'}
            </div>
          </div>

          {/* CARD 2: Invoices & Paperwork */}
          <div
            className="cinematic-card"
            style={{
              width: '240px',
              ...getCardStyle(1),
              borderLeft: p < 0.25 ? '3px solid #EF4444' : '3px solid #38BDF8',
            }}
          >
            <div className="cinematic-card-tag" style={{ color: p < 0.25 ? '#EF4444' : '#38BDF8' }}>
              {p < 0.25 ? <Clock size={14} /> : <FileSpreadsheet size={14} />}
              <span>{p < 0.25 ? 'Scattered Docs' : 'Step 2 · Instant Invoice'}</span>
            </div>
            <div className="cinematic-card-title">
              {p < 0.25 ? 'Messy Formats' : 'Executive PDF'}
            </div>
            <div className="cinematic-card-desc">
              {p < 0.25
                ? 'Invoices created late on spreadsheets with manual errors.'
                : '1-click generation from calculation models with live sheet.'}
            </div>
            <div className="cinematic-card-metric" style={{ color: p < 0.25 ? '#EF4444' : '#38BDF8' }}>
              {p < 0.25 ? 'INV-Draft-old.xlsx' : 'INV-2026-0842'}
            </div>
          </div>

          {/* CARD 3: Payment Tracking */}
          <div
            className="cinematic-card"
            style={{
              width: '240px',
              ...getCardStyle(2),
              borderLeft: p < 0.25 ? '3px solid #EF4444' : '3px solid #818CF8',
            }}
          >
            <div className="cinematic-card-tag" style={{ color: p < 0.25 ? '#EF4444' : '#818CF8' }}>
              {p < 0.25 ? <AlertCircle size={14} /> : <CreditCard size={14} />}
              <span>{p < 0.25 ? 'Unpaid & Forgotten' : 'Step 3 · Follow-Up'}</span>
            </div>
            <div className="cinematic-card-title">
              {p < 0.25 ? '45 Days Overdue' : 'Auto-Ledger Track'}
            </div>
            <div className="cinematic-card-desc">
              {p < 0.25
                ? 'No central record of who has paid or who needs a reminder.'
                : 'Status ledger monitors payment timestamps and overdue days.'}
            </div>
            <div className="cinematic-card-metric" style={{ color: p < 0.25 ? '#EF4444' : '#818CF8' }}>
              {p < 0.25 ? '$3,400 Overdue' : 'Settlement Logged'}
            </div>
          </div>

          {/* CARD 4: Net Profit Analytics */}
          <div
            className="cinematic-card"
            style={{
              width: '240px',
              ...getCardStyle(3),
              borderLeft: p < 0.25 ? '3px solid #EF4444' : '3px solid #10B981',
            }}
          >
            <div className="cinematic-card-tag" style={{ color: p < 0.25 ? '#EF4444' : '#10B981' }}>
              {p < 0.25 ? <AlertCircle size={14} /> : <TrendingUp size={14} />}
              <span>{p < 0.25 ? 'Tax Mystery' : 'Step 4 · Realized Net'}</span>
            </div>
            <div className="cinematic-card-title">
              {p < 0.25 ? 'Unclear Take-Home' : 'Net Margin Clear'}
            </div>
            <div className="cinematic-card-desc">
              {p < 0.25
                ? 'Revenue looked high, but zero cash left after expenses.'
                : 'Real-time overhead deduction reveals genuine take-home pay.'}
            </div>
            <div className="cinematic-card-metric" style={{ color: p < 0.25 ? '#EF4444' : '#10B981' }}>
              {p < 0.25 ? 'Unknown Profit' : '+$16,227.52 (81%)'}
            </div>
          </div>

          {/* MASTER COMMAND CENTER DASHBOARD (Converged Stage 3 & 4) */}
          <div
            className="cinematic-dashboard-frame"
            style={{
              opacity: dashboardOpacity,
              transform: `scale(${dashboardScale})`,
              pointerEvents: isDashboardVisible ? 'auto' : 'none',
              maxWidth: '960px',
              height: '420px',
              margin: '0 auto',
            }}
          >
            {/* Dashboard Mock Window Bar */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div className="dashboard-window-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
                  <span
                    style={{
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      marginLeft: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    app.bizpilotly.com/live-command-center
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#10B981',
                        boxShadow: '0 0 8px #10B981',
                      }}
                    />
                    SYSTEM OPERATIONAL
                  </span>
                </div>
              </div>

              {/* Dashboard Content Interior */}
              <div
                style={{
                  flex: 1,
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  overflowY: 'auto',
                }}
              >
                {/* Metric Summary Bar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Monthly Gross
                    </div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
                      $19,800.00
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#10B981', marginTop: '0.25rem' }}>
                      ↑ +14.8% vs last month
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Realized Profit
                    </div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.25rem' }}>
                      $16,227.52
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#C9A227', marginTop: '0.25rem' }}>
                      81.9% net margin target
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Outstanding Invoices
                    </div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.25rem' }}>
                      $2,500.00
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                      1 client pending payment
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Active Retainers
                    </div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem' }}>
                      6 Clients
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#10B981', marginTop: '0.25rem' }}>
                      100% on-schedule
                    </div>
                  </div>
                </div>

                {/* Pipeline Flow Snapshot in Dashboard */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        background: 'rgba(201, 162, 39, 0.15)',
                        color: '#C9A227',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Activity size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Live Client Stream: Apex Digital Studio
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Contract Signed → Invoice Generated → Payment Received ($2,500.00)
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Settled to Bank Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Scroll Step Indicators */}
        <div className="scroll-step-indicator">
          {STAGES.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                setManualStage(idx);
                setTimeout(() => setManualStage(null), 3000);
              }}
              className={`scroll-step-dot ${currentStageIndex === idx ? 'active' : ''}`}
              title={`Phase ${st.id}: ${st.title}`}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
          <span
            style={{
              fontSize: '0.6875rem',
              color: '#94A3B8',
              marginLeft: '0.375rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
