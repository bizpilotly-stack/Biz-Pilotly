import React, { useRef, useEffect, useState } from 'react';

/**
 * Wrapper that adds a reveal class when its child enters the viewport.
 * Uses IntersectionObserver for performant detection. The class `.reveal-on-scroll.is-revealed`
 * is defined in landing-animation.css and provides smooth fade-up animation.
 */
export const RevealOnScroll: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style = {},
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${revealed ? 'is-revealed' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
