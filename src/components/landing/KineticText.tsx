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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setIsReducedMotion(true);
        return;
      }
      setIsMobile(window.innerWidth < 768);
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Start when entering bottom of viewport, finish when past comfortable viewing zone
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
      <Component className={className} style={{ display: 'block', width: '100%', ...style }}>
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
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.28em',
        width: '100%',
        ...style,
      }}
    >
      {words.map((word, index) => {
        // Differential timing per word for staggered convergence
        const wordOffset = (index / Math.max(1, words.length - 1)) * 0.2;
        const wordProgress = Math.max(0, Math.min(1, (progress - wordOffset) / 0.8));

        const remaining = 1 - wordProgress;

        // Alternating Left & Right initial displacement
        const maxOffset = isMobile ? 12 : 22;
        const isLeft = index % 2 === 0;
        const translateX = (isLeft ? -maxOffset : maxOffset) * remaining;
        const translateY = remaining * (isMobile ? 8 : 14);
        const rotateZ = (isLeft ? -1.5 : 1.5) * remaining;
        const blur = remaining * (isMobile ? 2.5 : 4);
        const scale = 0.95 + (wordProgress * 0.05);
        const opacity = Math.max(0.25, wordProgress);

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
              transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), filter 0.16s ease, opacity 0.16s ease',
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
