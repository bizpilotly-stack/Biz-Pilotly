import React, { useState, useEffect, useRef } from 'react';
import { FloatingModule3D } from './FloatingModule3D';
import { ConnectionLines3D } from './ConnectionLines3D';
import { Sparkles } from 'lucide-react';

export const Ecosystem3DHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 4, y: -6 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse parallax interpolation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Restrained pitch & yaw (Max ±8 degrees)
      const targetX = -(y / (rect.height / 2)) * 6;
      const targetY = (x / (rect.width / 2)) * 8;

      setRotation({ x: targetX, y: targetY });
    };

    const handleMouseLeave = () => {
      // Settle gently back to default perspective
      setRotation({ x: 4, y: -6 });
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

  return (
    <div
      ref={containerRef}
      className="ecosystem-3d-viewport"
      style={{
        cursor: isHovered ? 'grab' : 'default',
      }}
    >
      {/* Ambient 3D Depth Glow */}
      <div className="ecosystem-3d-ambient-glow" />

      {/* 3D World Space */}
      <div
        className="ecosystem-3d-world"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0px)`,
        }}
      >
        {/* Dynamic Vector Connections */}
        <ConnectionLines3D progress={1} />

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

        {/* 1. Client Card (Top-Left, z: 25) */}
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
