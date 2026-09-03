import React, { useEffect, useRef, useState } from 'react';

interface KineticTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p' | 'span';
  children: string;
  className?: string;
  style?: React.CSSProperties;
}

export const KineticText: React.FC<KineticTextProps> = ({
  as: Tag = 'h2',
  children,
  className = '',
  style = {},
}) => {
  const ref = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Respect accessibility settings
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsReducedMotion(true);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Responsive scrub window: starts when element enters bottom, resolves when it reaches comfortable viewing zone
          const start = windowHeight * 0.95;
          const end = windowHeight * 0.35;
          const current = rect.top;
          const raw = (start - current) / (start - end);
          const clamped = Math.max(0, Math.min(1, raw));
          setProgress(clamped);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const Component = Tag as any;

  if (isReducedMotion) {
    return (
      <Component className={className} style={style}>
        {children}
      </Component>
    );
  }

  const words = children.split(' ');

  return (
    <Component
      ref={ref}
      className={`kinetic-text-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: '0.28em',
        ...style,
      }}
    >
      {words.map((word, index) => {
        // Differential timing per word for natural kinetic organization
        const wordOffset = (index / Math.max(1, words.length - 1)) * 0.2;
        const wordProgress = Math.max(0, Math.min(1, (progress - wordOffset) / 0.8));

        // Multi-axis kinetic arrangement vectors
        const remaining = 1 - wordProgress;
        const translateY = remaining * 14;
        const translateX = (index % 2 === 0 ? 6 : -6) * remaining;
        const rotateZ = (index % 2 === 0 ? 0.8 : -0.8) * remaining;
        const blur = remaining * 3.5;
        const scale = 0.96 + (wordProgress * 0.04);
        const opacity = Math.max(0.3, wordProgress);

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              transform: wordProgress >= 0.99
                ? 'none'
                : `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotateZ}deg) scale(${scale})`,
              filter: blur > 0.2 ? `blur(${blur}px)` : 'none',
              opacity,
              transition: 'transform 0.14s cubic-bezier(0.2, 0.9, 0.3, 1), filter 0.14s ease, opacity 0.14s ease',
              willChange: 'transform, filter, opacity',
            }}
          >
            {word}
          </span>
        );
      })}
    </Component>
  );
};
