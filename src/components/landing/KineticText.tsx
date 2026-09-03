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
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
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
          // Progress: 0 when top is at bottom of viewport, 1 when element is past lower third
          const start = windowHeight;
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

  if (isReducedMotion) {
    return (
      // @ts-ignore
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const words = children.split(' ');

  return (
    // @ts-ignore
    <Tag
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
        // Differential timing per word for subtle inertia
        const wordOffset = (index / Math.max(1, words.length - 1)) * 0.15;
        const wordProgress = Math.max(0, Math.min(1, (progress - wordOffset) / 0.85));

        const translateY = (1 - wordProgress) * 12;
        const blur = (1 - wordProgress) * 4;
        const scale = 0.95 + (wordProgress * 0.05);
        const opacity = Math.max(0.2, wordProgress);

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
              filter: blur > 0.2 ? `blur(${blur}px)` : 'none',
              opacity,
              transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), filter 0.12s ease, opacity 0.12s ease',
              willChange: 'transform, filter, opacity',
            }}
          >
            {word}
          </span>
        );
      })}
    </Tag>
  );
};
