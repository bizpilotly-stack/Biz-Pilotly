import React, { useEffect, useRef, useState } from 'react';

interface KineticHeadlineProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export const KineticHeadline: React.FC<KineticHeadlineProps> = ({ text, className, style }) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // Calculate progress from entering top of viewport
          const progress = Math.max(0, Math.min(1, 1 - (rect.bottom / (windowHeight * 1.2))));
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = text.split(' ');

  return (
    <h1
      ref={containerRef}
      className={`kinetic-headline ${className || ''}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.35em',
        lineHeight: 1.08,
        margin: '0 0 0.5rem',
        ...style,
      }}
    >
      {words.map((word, idx) => {
        // Differential scrub speed per word for subtle inertia
        const wordOffset = (idx - words.length / 2) * 0.05;
        const localProgress = Math.max(0, Math.min(1, scrollProgress * 1.5 + wordOffset));
        const translateY = (1 - localProgress) * 0; // Natural base
        const blurAmount = Math.max(0, (1 - localProgress) * 0); // Crisp at start, responds on scroll
        const tracking = (1 - localProgress) * -0.02;

        return (
          <span
            key={idx}
            className="kinetic-word"
            style={{
              display: 'inline-block',
              transform: `translate3d(0, ${translateY}px, 0)`,
              filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
              letterSpacing: `${tracking}em`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease',
              willChange: 'transform, filter',
            }}
          >
            {word}
          </span>
        );
      })}
    </h1>
  );
};
