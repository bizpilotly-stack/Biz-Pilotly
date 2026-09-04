import React, { useState, useEffect, useRef } from 'react';
import { FloatingModule3D } from './FloatingModule3D';
import { ConnectionLines3D } from './ConnectionLines3D';
import { Sparkles } from 'lucide-react';

export const Ecosystem3DHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 3, y: -4 });
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const availableWidth = Math.min(window.innerWidth - 32, 580);
      return Math.min(1, Math.max(0.46, availableWidth / 580));
    }
    return 1;
  });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Dynamic Auto-Scaling for exact 50% center fit on any screen (mobile, tablet, desktop)
  useEffect(() => {
    const updateScale = () => {
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const measuredWidth = containerRef.current?.clientWidth || screenWidth;
      const availableWidth = Math.min(screenWidth - 32, measuredWidth);
      if (availableWidth > 0) {
        // 580px is base coordinate width
        const targetScale = Math.min(1, Math.max(0.46, availableWidth / 580));
        setScale(targetScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale, { passive: true });
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Smooth mouse parallax interpolation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Restrained pitch & yaw (Max ±7 degrees)
      const targetX = -(y / (rect.height / 2)) * 6;
      const targetY = (x / (rect.width / 2)) * 7;

      setRotation({ x: targetX, y: targetY });
    };

    const handleMouseLeave = () => {
      // Settle gently back to default perspective
      setRotation({ x: 3, y: -4 });
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
  }, []);

  // Touch Parallax Handling on Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1 || !containerRef.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartRef.current.x;
    const deltaY = currentY - touchStartRef.current.y;

    const targetY = Math.max(-10, Math.min(10, deltaX * 0.08));
    const targetX = Math.max(-8, Math.min(8, -deltaY * 0.06));

    setRotation({ x: targetX, y: targetY });
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setRotation({ x: 3, y: -4 });
  };

  const viewportHeight = Math.round(460 * scale);

  return (
    <div
      ref={containerRef}
      className="ecosystem-3d-viewport"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isHovered ? 'grab' : 'default',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        height: `${viewportHeight}px`,
        minHeight: `${viewportHeight}px`,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      {/* Ambient 3D Depth Glow */}
      <div className="ecosystem-3d-ambient-glow" />

      {/* 3D World Space (Anchored directly at 50% center on all devices) */}
      <div
        className="ecosystem-3d-world"
        style={{
          width: '580px',
          height: '460px',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Dynamic Vector Connections */}
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
          z={30}
          rotateX={2}
          rotateY={-3}
          floatDelay="0s"
        />

        {/* 2. Proposal / Scope Card (Top-Middle, z: 15) */}
        <FloatingModule3D
          type="proposal"
          x={290}
          y={60}
          z={15}
          rotateX={-2}
          rotateY={2}
          floatDelay="1.2s"
        />

        {/* 3. Invoice Card (Top-Right, z: 35) */}
        <FloatingModule3D
          type="invoice"
          x={470}
          y={110}
          z={35}
          rotateX={4}
          rotateY={-4}
          floatDelay="2.1s"
        />

        {/* 4. Payment Card (Bottom-Right, z: 20) */}
        <FloatingModule3D
          type="payment"
          x={450}
          y={330}
          z={20}
          rotateX={-3}
          rotateY={3}
          floatDelay="0.8s"
        />

        {/* 5. Expense Card (Bottom-Left, z: 10) */}
        <FloatingModule3D
          type="expense"
          x={120}
          y={330}
          z={10}
          rotateX={3}
          rotateY={-2}
          floatDelay="1.8s"
        />

        {/* 6. Realized Net Profit (Bottom-Center, z: 45) */}
        <FloatingModule3D
          type="profit"
          x={290}
          y={390}
          z={45}
          rotateX={-4}
          rotateY={1}
          floatDelay="2.5s"
        />
      </div>
    </div>
  );
};
