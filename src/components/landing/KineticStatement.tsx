import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const KineticStatement: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          const rect = sectionRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // Calculate scrub progress: starts when section enters bottom, completes when center hits upper third
          const currentDistance = windowHeight - rect.top;
          const rawProgress = Math.max(0, Math.min(1, currentDistance / (windowHeight * 0.9)));
          setProgress(rawProgress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const statementLines = [
    { text: 'Run your business operations', emphasis: false },
    { text: 'from one central command center.', emphasis: true },
    { text: 'From scope to net realized profit.', emphasis: false },
  ];

  return (
    <section
      ref={sectionRef}
      className="kinetic-statement-section"
      style={{
        background: '#0B1F3A',
        color: '#ffffff',
        padding: '6rem 0',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(201, 162, 39, 0.12) 0%, rgba(11, 31, 58, 0) 70%)',
          pointerEvents: 'none',
          borderRadius: '50%',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          {/* Section Subtitle Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(201, 162, 39, 0.15)',
              border: '1px solid rgba(201, 162, 39, 0.4)',
              color: '#C9A227',
              padding: '0.3rem 0.875rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '2rem',
              opacity: Math.min(1, progress * 1.5),
              transform: `translateY(${(1 - Math.min(1, progress * 1.5)) * 12}px)`,
              transition: 'transform 0.3s ease, opacity 0.3s ease',
            }}
          >
            <Sparkles size={14} />
            <span>The Operating Principle</span>
          </div>

          {/* Large Kinetic Typography Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {statementLines.map((line, lineIdx) => {
              const lineWords = line.text.split(' ');
              const lineProgressOffset = lineIdx * 0.15;
              const effectiveProgress = Math.max(0, Math.min(1, (progress - lineProgressOffset) / 0.7));

              return (
                <div
                  key={lineIdx}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '0.35em',
                  }}
                >
                  {lineWords.map((word, wordIdx) => {
                    const wordDelay = (wordIdx / lineWords.length) * 0.1;
                    const wordProgress = Math.max(0, Math.min(1, (effectiveProgress - wordDelay) / 0.85));

                    // Kinetic transforms: translate, blur-to-sharp, scale, tracking
                    const translateY = (1 - wordProgress) * 16;
                    const blur = (1 - wordProgress) * 5;
                    const scale = 0.94 + (wordProgress * 0.06);
                    const opacity = Math.max(0.2, wordProgress);
                    const isGold = line.emphasis && (word.toLowerCase().includes('command') || word.toLowerCase().includes('center.'));

                    return (
                      <span
                        key={wordIdx}
                        style={{
                          display: 'inline-block',
                          fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                          fontWeight: 800,
                          letterSpacing: '-0.03em',
                          lineHeight: 1.2,
                          color: isGold ? '#C9A227' : line.emphasis ? '#ffffff' : '#cbd5e1',
                          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                          filter: blur > 0.3 ? `blur(${blur}px)` : 'none',
                          opacity,
                          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), filter 0.15s ease, opacity 0.15s ease',
                          willChange: 'transform, filter, opacity',
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Settle Message & Fast-Action Link */}
          <div
            style={{
              opacity: Math.max(0, (progress - 0.5) * 2),
              transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.5) * 2))) * 10}px)`,
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '580px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Eliminate spreadsheet chaos and scattered tools. Pitch with authority, deliver with confidence, and collect payments without friction.
            </p>
            <Link
              to="/signup"
              className="btn btn-gold btn-md"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
            >
              <span>Explore The Platform</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
