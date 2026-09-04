import React, { useState, useEffect, useRef } from 'react';
import { FloatingModule3D } from './FloatingModule3D';
import { ConnectionLines3D } from './ConnectionLines3D';
import { Sparkles } from 'lucide-react';

export const Ecosystem3DHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 3, y: -4 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Detect Mobile Viewport (< 640px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Touch Parallax Handling on Mobile
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

  return (
    <div
      ref={containerRef}
      className={`ecosystem-3d-viewport ${isMobile ? 'is-mobile-hero' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isHovered ? 'grab' : 'default',
      }}
    >
      {/* Ambient 3D Depth Glow */}
      <div className="ecosystem-3d-ambient-glow" />

      {/* 3D World Space */}
      <div
        className={`ecosystem-3d-world ${isMobile ? 'mobile-3d-world' : 'desktop-3d-world'}`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0px)`,
        }}
      >
        {/* Dynamic Vector Connections */}
        <ConnectionLines3D progress={1} isMobile={isMobile} />

        {isMobile ? (
          /* ============================================================
             MOBILE 3-CARD SPATIAL FOCUS (Crisp, Readable, Elegant)
             ============================================================ */
          <>
            {/* 1. Client Card (Top) */}
            <FloatingModule3D
              type="client"
              x={180}
              y={55}
              z={25}
              rotateX={2}
              rotateY={-2}
              floatDelay="0s"
            />

            {/* 2. Invoice Card (Middle) */}
            <FloatingModule3D
              type="invoice"
              x={180}
              y={185}
              z={35}
              rotateX={-1}
              rotateY={2}
              floatDelay="1.4s"
            />

            {/* 3. Realized Net Profit (Bottom) */}
            <FloatingModule3D
              type="profit"
              x={180}
              y={315}
              z={30}
              rotateX={-3}
              rotateY={-1}
              floatDelay="2.2s"
            />
          </>
        ) : (
          /* ============================================================
             DESKTOP & TABLET 6-CARD NETWORK
             ============================================================ */
          <>
            {/* Central BizPilotly Engine Node */}
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
          </>
        )}
      </div>
    </div>
  );
};
