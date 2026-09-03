import React, { useEffect, useRef, useState } from 'react';
import {
  Calculator,
  FileText,
  FileCheck,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

export const KineticWorkflow: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const workflowItems = [
    { step: 1, title: 'Price & Target Margin', desc: 'Calculate break-even rates and markup with built-in financial models.', icon: <Calculator size={20} color="#C9A227" /> },
    { step: 2, title: 'Scope & Proposal', desc: 'Draft clean proposals with timeline milestones and deliverables.', icon: <FileText size={20} color="#0B1F3A" /> },
    { step: 3, title: 'Client Sign-off', desc: 'Convert agreed terms into confirmed contracts with uploaded signatures.', icon: <FileCheck size={20} color="#0B1F3A" /> },
    { step: 4, title: 'Invoice Delivery', desc: 'Generate printable invoices and share via WhatsApp, Telegram, or Discord links.', icon: <Receipt size={20} color="#C9A227" /> },
    { step: 5, title: 'Payment Collection', desc: 'Record incoming bank transfers and card deposits with automatic ledger updates.', icon: <CreditCard size={20} color="#0B1F3A" /> },
    { step: 6, title: 'Expense Logging', desc: 'Track project expenses and subcontractor payouts against billables.', icon: <FileSpreadsheet size={20} color="#0B1F3A" /> },
    { step: 7, title: 'Realized Net Profit', desc: 'View your true net profit and margin without messy spreadsheet formulas.', icon: <TrendingUp size={20} color="#10b981" /> },
  ];

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          const rect = sectionRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // Calculate active step based on scroll progress through section
          const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (rect.height + windowHeight * 0.5)));
          const currentStep = Math.min(6, Math.floor(progress * 7));
          setActiveStep(currentStep);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-py"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}
    >
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <span className="editorial-number">02</span>
              <span className="editorial-divider" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C9A227' }}>
                End-to-End Workflow
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', margin: 0 }}>
              From Initial Quote to Realized Net Profit
            </h2>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.6, margin: 0 }}>
            BizPilotly structures the complete financial lifecycle of client projects into 7 clear, automated milestones.
          </p>
        </div>

        {/* Visual Connected Step Chain with Progressive Focus */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch',
            position: 'relative',
          }}
        >
          {workflowItems.map((item, index) => {
            const isCurrent = index <= activeStep;
            const isHighlight = index === 6;

            return (
              <div
                key={item.step}
                style={{
                  background: isCurrent ? 'var(--bg-app)' : 'rgba(248, 250, 252, 0.5)',
                  border: isCurrent
                    ? isHighlight ? '2px solid #C9A227' : '1px solid var(--brand-navy-600)'
                    : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: isCurrent ? 'var(--shadow-sm)' : 'none',
                  position: 'relative',
                  opacity: isCurrent ? 1 : 0.6,
                  transform: isCurrent ? 'translate3d(0, 0, 0)' : 'translate3d(0, 4px, 0)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform, opacity, border-color',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    background: isHighlight ? 'var(--brand-gold-500)' : 'var(--brand-navy-800)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    transform: isCurrent ? 'scale(1)' : 'scale(0.9)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {item.step}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>{item.icon}</div>

                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
