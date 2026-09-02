// src/hooks/useScrollProgress.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Returns a scroll progress value (0 – 1) for the element referenced by `ref`.
 * The progress is based on the element's position inside the viewport.
 * Uses requestAnimationFrame for smooth updates and cleans up listeners on unmount.
 */
export function useScrollProgress<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height + viewportHeight;
      const scrolled = viewportHeight - rect.top;
      let pct = scrolled / total;
      pct = Math.min(Math.max(pct, 0), 1);
      setProgress(pct);
      rafId.current = requestAnimationFrame(update);
    };
    rafId.current = requestAnimationFrame(update);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ref]);

  return progress;
}
