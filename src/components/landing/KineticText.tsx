import React, { useEffect, useRef, useState } from 'react';

interface KineticTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div' | 'p' | 'span';
  children: string;
  className?: string;
  style?: React.CSSProperties;
  intensity?: 'high' | 'subtle';
}

export const KineticText: React.FC<KineticTextProps> = ({
  as: Tag = 'h2',
  children,
  className = '',
  style = {},
  intensity = 'high',
}) => {
  const ref = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkState = () => {
      if (typeof window !== 'undefined') {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setIsReducedMotion(true);
          return;
        }
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkState();
    window.addEventListener('resize', checkState, { passive: true });

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Responsive scrub window
          const start = windowHeight * 0.96;
          const end = windowHeight * 0.32;
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkState);
    };
  }, []);

  const Component = Tag as any;

  if (isReducedMotion) {
    return (
      <Component className={className} style={{ display: 'block', width: '100%', ...style }}>
        {children}
      </Component>
    );
  }

  const words = children.split(' ');
  const isHigh = intensity === 'high';

  return (
    <Component
      ref={ref}
      className={`kinetic-text-wrapper ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isHigh ? '0.28em' : '0.22em',
        width: '100%',
        maxWidth: '100%',
        ...style,
      }}
    >
      {words.map((word, index) => {
        // Staggered timing per word
        const wordOffset = (index / Math.max(1, words.length - 1)) * (isHigh ? 0.20 : 0.12);
        const wordProgress = Math.max(0, Math.min(1, (progress - wordOffset) / (1 - (isHigh ? 0.20 : 0.12))));

        const remaining = 1 - wordProgress;

        // Mobile touch devices: smooth vertical emergence + clarity unfolding
        // Desktop: alternating spatial convergence
        const isLeft = index % 2 === 0;
        const translateX = isMobile
          ? (isLeft ? -4 : 4) * remaining
          : (isLeft ? -24 : 24) * remaining * (isHigh ? 1 : 0.5);

        const translateY = remaining * (isMobile ? (isHigh ? 10 : 5) : (isHigh ? 14 : 6));
        const rotateZ = isMobile ? 0 : (isLeft ? -1.5 : 1.5) * remaining * (isHigh ? 1 : 0.5);
        const blur = remaining * (isMobile ? (isHigh ? 2 : 1) : (isHigh ? 3.5 : 1.8));
        const scale = 0.96 + (wordProgress * 0.04);
        const opacity = isHigh ? Math.max(0.2, wordProgress) : Math.max(0.35, wordProgress);

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              transform: wordProgress >= 0.99
                ? 'none'
                : `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotateZ}deg) scale(${scale})`,
              filter: blur > 0.15 ? `blur(${blur}px)` : 'none',
              opacity,
              transition: 'transform 0.14s cubic-bezier(0.16, 1, 0.3, 1), filter 0.14s ease, opacity 0.14s ease',
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
