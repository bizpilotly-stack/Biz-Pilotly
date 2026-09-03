import React, { useState, useEffect, useRef } from 'react';
import { FloatingModule3D } from './FloatingModule3D';
import { ConnectionLines3D } from './ConnectionLines3D';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EcosystemScrollStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      // Calculate progress between 0 and 1
      const current = -rect.top;
      const rawProgress = current / totalScrollable;
      const clamped = Math.min(1, Math.max(0, rawProgress));
      setScrollProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine current active narrative phase
  const phase = scrollProgress < 0.35 ? 1 : scrollProgress < 0.7 ? 2 : 3;

  // Camera depth & convergence transforms
  const cameraZ = scrollProgress * 180;
  const moduleSpread = Math.max(0, 1 - scrollProgress * 1.3);
  const dashboardOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.65) / 0.3));
  const modulesOpacity = Math.max(0, 1 - (scrollProgress - 0.6) * 3);

  return (
    <section ref={containerRef} className="scroll-story-container" style={{ height: '220vh' }}>
      <div className="scroll-story-sticky">
        {/* Story Narrative Header */}
        <div className="scroll-story-header">
          <div className="scroll-story-tag">
            <Sparkles size={13} />
            <span>
              {phase === 1 && 'Phase 1 • Fragmented Operations'}
              {phase === 2 && 'Phase 2 • Automated Financial Flow'}
              {phase === 3 && 'Phase 3 • Unified Command Center'}
            </span>
          </div>

          <h2 className="scroll-story-title">
            {phase === 1 && 'Isolated business tools cost you time & margin.'}
            {phase === 2 && 'BizPilotly connects every milestone seamlessly.'}
            {phase === 3 && 'One unified dashboard. Total financial clarity.'}
          </h2>

          <p className="scroll-story-desc">
            {phase === 1 &&
              'Scattered client notes, manual invoices, separate bank apps, and guesswork spreadsheets create blind spots.'}
            {phase === 2 &&
              'Accepted proposals automatically generate invoices. Settled payments instantly reconcile into net profit margins.'}
            {phase === 3 &&
              'Say goodbye to spreadsheet formulas. See your true revenue, expenses, and net profit in real time.'}
          </p>
        </div>

        {/* 3D Dynamic Spatial Transformation Stage */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '960px',
            height: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1200px',
          }}
        >
          {/* 1. Spatial 3D World (Phases 1 & 2) */}
          <div
            className="ecosystem-3d-world"
            style={{
              opacity: modulesOpacity,
              transform: `rotateX(${6 - scrollProgress * 6}deg) rotateY(${-8 + scrollProgress * 8}deg) translateZ(${cameraZ}px)`,
              pointerEvents: modulesOpacity < 0.1 ? 'none' : 'auto',
              position: 'absolute',
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Dynamic Circuit Connections */}
            <ConnectionLines3D progress={scrollProgress > 0.25 ? 1 : 0.3} />

            {/* Central BizPilotly Anchor Node */}
            <div className="ecosystem-central-anchor">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#0B1F3A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C9A227',
                  boxShadow: 'inset 0 0 10px rgba(201, 162, 39, 0.5)',
                }}
              >
                <Sparkles size={20} />
              </div>
            </div>

            {/* 1. Client Card */}
            <FloatingModule3D
              type="client"
              x={290 - 180 * moduleSpread}
              y={230 - 140 * moduleSpread}
              z={30 * moduleSpread}
              rotateX={2 * moduleSpread}
              rotateY={-3 * moduleSpread}
            />

            {/* 2. Proposal Card */}
            <FloatingModule3D
              type="proposal"
              x={290}
              y={230 - 170 * moduleSpread}
              z={15 * moduleSpread}
            />

            {/* 3. Invoice Card */}
            <FloatingModule3D
              type="invoice"
              x={290 + 180 * moduleSpread}
              y={230 - 120 * moduleSpread}
              z={35 * moduleSpread}
              rotateX={4 * moduleSpread}
            />

            {/* 4. Payment Card */}
            <FloatingModule3D
              type="payment"
              x={290 + 160 * moduleSpread}
              y={230 + 100 * moduleSpread}
              z={20 * moduleSpread}
            />

            {/* 5. Expense Card */}
            <FloatingModule3D
              type="expense"
              x={290 - 170 * moduleSpread}
              y={230 + 100 * moduleSpread}
              z={10 * moduleSpread}
            />

            {/* 6. Net Profit Card */}
            <FloatingModule3D
              type="profit"
              x={290}
              y={230 + 160 * moduleSpread}
              z={45 * moduleSpread}
            />
          </div>

          {/* 2. Converged Product Dashboard Window (Phase 3 & 4) */}
          <div
            className="scroll-story-product-window"
            style={{
              opacity: dashboardOpacity,
              transform: `scale(${0.9 + dashboardOpacity * 0.1}) translateY(${30 - dashboardOpacity * 30}px)`,
              pointerEvents: dashboardOpacity > 0.5 ? 'auto' : 'none',
              position: 'absolute',
              width: '100%',
              maxWidth: '920px',
            }}
          >
            {/* Window Topbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: '#0A0A0A',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#C9A227' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '1rem', fontFamily: 'var(--font-mono)' }}>
                app.bizpilotly.com/overview — Live Operating Command Center
              </span>
            </div>

            {/* Realistic Dashboard Interior */}
            <div style={{ padding: '1.5rem', background: '#0B1F3A' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Gross Revenue (August)</div>
                  <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>$19,800.00</div>
                  <div style={{ color: '#10b981', fontSize: '0.6875rem', marginTop: '2px' }}>↑ +14.8% vs previous month</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Pending Receivables</div>
                  <div style={{ color: '#FBBF24', fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>$2,500.00</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.6875rem', marginTop: '2px' }}>1 invoice due in 5 days</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Realized Net Profit</div>
                  <div style={{ color: '#38BDF8', fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>$16,227.52</div>
                  <div style={{ color: '#C9A227', fontSize: '0.6875rem', marginTop: '2px' }}>81.9% net margin target</div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>All documents, payments, and expenses fully reconciled.</span>
                </div>
                <Link to="/signup" className="btn btn-gold btn-sm">
                  <span>Open Your Command Center</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Progress Step Indicator */}
        <div className="scroll-step-indicator">
          <span className={`step-dot ${phase === 1 ? 'active' : ''}`} title="Phase 1: Fragmented" />
          <span className={`step-dot ${phase === 2 ? 'active' : ''}`} title="Phase 2: Connected" />
          <span className={`step-dot ${phase === 3 ? 'active' : ''}`} title="Phase 3: Command Center" />
        </div>
      </div>
    </section>
  );
};
