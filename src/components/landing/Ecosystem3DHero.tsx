import React, { useState, useEffect, useRef } from 'react';
import { FloatingModule3D } from './FloatingModule3D';
import { ConnectionLines3D } from './ConnectionLines3D';
import { Sparkles } from 'lucide-react';

export const Ecosystem3DHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  // Responsive scale and device detection
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const isLarge = screenWidth >= 1024;
      setIsDesktop(isLarge);

      const measuredWidth = containerRef.current?.clientWidth || screenWidth;
      const availableWidth = Math.min(screenWidth - 24, measuredWidth);
      if (availableWidth > 0) {
        // Base width is 580px
        const targetScale = Math.min(1, Math.max(0.48, availableWidth / 580));
        setScale(targetScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Mouse Parallax (Only on Desktop >= 1024px)
  useEffect(() => {
    if (!isDesktop) {
      setRotation({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Restrained pitch & yaw (Max ±6 degrees)
      const targetX = -(y / (rect.height / 2)) * 5;
      const targetY = (x / (rect.width / 2)) * 6;

      setRotation({ x: targetX, y: targetY });
    };

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 });
      setIsHovered(false);
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove);
      node.addEventListener('mouseleave', handleMouseLeave);
      node.addEventListener('mouseenter', () => setIsHovered(true));
    }

    return () => {
      if (node) {
        node.removeEventListener('mousemove', handleMouseMove);
        node.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isDesktop]);

  const viewportHeight = Math.round(460 * scale);

  return (
    <div
      ref={containerRef}
      className={`ecosystem-3d-viewport ${isDesktop ? 'is-desktop' : 'is-mobile-fixed'}`}
      style={{
        cursor: isDesktop && isHovered ? 'grab' : 'default',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        height: `${viewportHeight}px`,
        minHeight: `${viewportHeight}px`,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient 3D Depth Glow */}
      <div className="ecosystem-3d-ambient-glow" />

      {/* Symmetrical Scaling Wrapper */}
      <div
        className="ecosystem-scaler"
        style={{
          width: '580px',
          height: '460px',
          flexShrink: 0,
          margin: '0 auto',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* World Space (Flat on Mobile, Parallax on Desktop) */}
        <div
          className="ecosystem-3d-world"
          style={{
            width: '580px',
            height: '460px',
            position: 'relative',
            margin: '0 auto',
            transform: isDesktop
              ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
              : 'none',
            transformStyle: isDesktop ? 'preserve-3d' : 'flat',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Dynamic Moving Dotted Circuit Lines */}
          <ConnectionLines3D progress={1} />

          {/* Central BizPilotly Engine Node (At exact 50% / 50% origin) */}
          <div className="ecosystem-central-anchor" title="BizPilotly Unified Engine">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#0B1F3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C9A227',
                boxShadow: 'inset 0 0 10px rgba(201, 162, 39, 0.5)',
              }}
            >
              <Sparkles size={22} color="#C9A227" />
            </div>
          </div>

          {/* 1. Client Card (Top-Left, z: 30) */}
          <FloatingModule3D
            type="client"
            x={110}
            y={90}
            z={isDesktop ? 30 : 0}
            rotateX={isDesktop ? 2 : 0}
            rotateY={isDesktop ? -3 : 0}
            floatDelay="0s"
          />

          {/* 2. Proposal / Scope Card (Top-Middle, z: 15) */}
          <FloatingModule3D
            type="proposal"
            x={290}
            y={60}
            z={isDesktop ? 15 : 0}
            rotateX={isDesktop ? -2 : 0}
            rotateY={isDesktop ? 2 : 0}
            floatDelay="1.2s"
          />

          {/* 3. Invoice Card (Top-Right, z: 35) */}
          <FloatingModule3D
            type="invoice"
            x={470}
            y={110}
            z={isDesktop ? 35 : 0}
            rotateX={isDesktop ? 4 : 0}
            rotateY={isDesktop ? -4 : 0}
            floatDelay="2.1s"
          />

          {/* 4. Payment Card (Bottom-Right, z: 20) */}
          <FloatingModule3D
            type="payment"
            x={450}
            y={330}
            z={isDesktop ? 20 : 0}
            rotateX={isDesktop ? -3 : 0}
            rotateY={isDesktop ? 3 : 0}
            floatDelay="0.8s"
          />

          {/* 5. Expense Card (Bottom-Left, z: 10) */}
          <FloatingModule3D
            type="expense"
            x={120}
            y={330}
            z={isDesktop ? 10 : 0}
            rotateX={isDesktop ? 3 : 0}
            rotateY={isDesktop ? -2 : 0}
            floatDelay="1.8s"
          />

          {/* 6. Realized Net Profit (Bottom-Center, z: 45) */}
          <FloatingModule3D
            type="profit"
            x={290}
            y={390}
            z={isDesktop ? 45 : 0}
            rotateX={isDesktop ? -4 : 0}
            rotateY={isDesktop ? 1 : 0}
            floatDelay="2.5s"
          />
        </div>
      </div>
    </div>
  );
};
