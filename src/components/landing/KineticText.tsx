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
        const wordOffset = (index / Math.max(1, words.length - 1)) * (isHigh ? 0.22 : 0.15);
        const wordProgress = Math.max(0, Math.min(1, (progress - wordOffset) / (1 - (isHigh ? 0.22 : 0.15))));

        const remaining = 1 - wordProgress;

        // Alternating Left & Right initial displacement
        const maxOffset = isMobile
          ? (isHigh ? 12 : 6)
          : (isHigh ? 24 : 10);

        const isLeft = index % 2 === 0;
        const translateX = (isLeft ? -maxOffset : maxOffset) * remaining;
        const translateY = remaining * (isMobile ? (isHigh ? 8 : 4) : (isHigh ? 14 : 6));
        const rotateZ = (isLeft ? -1.5 : 1.5) * remaining * (isHigh ? 1 : 0.5);
        const blur = remaining * (isMobile ? (isHigh ? 2.5 : 1.2) : (isHigh ? 4 : 2));
        const scale = 0.95 + (wordProgress * 0.05);
        const opacity = isHigh ? Math.max(0.25, wordProgress) : Math.max(0.4, wordProgress);

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
              transition: isHigh
                ? 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), filter 0.16s ease, opacity 0.16s ease'
                : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), filter 0.12s ease, opacity 0.12s ease',
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
