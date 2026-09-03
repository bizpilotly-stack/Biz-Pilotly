import React from 'react';
import {
  Users,
  FileCheck,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export type ModuleType = 'client' | 'proposal' | 'invoice' | 'payment' | 'expense' | 'profit';

interface FloatingModule3DProps {
  type: ModuleType;
  x: number;
  y: number;
  z: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  floatDelay?: string;
  isHero?: boolean;
}

export const FloatingModule3D: React.FC<FloatingModule3DProps> = ({
  type,
  x,
  y,
  z,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  scale = 1,
  floatDelay = '0s',
}) => {
  const getModuleContent = () => {
    switch (type) {
      case 'client':
        return {
          icon: <Users size={14} color="#38BDF8" />,
          badge: 'Verified Client',
          badgeBg: 'rgba(56, 189, 248, 0.15)',
          badgeColor: '#38BDF8',
          title: 'Apex Digital Studio',
          value: '$19,800 LTV',
          subtext: 'Retainer Active • Net 15',
        };
      case 'proposal':
        return {
          icon: <FileCheck size={14} color="#A78BFA" />,
          badge: 'Scope & Terms',
          badgeBg: 'rgba(167, 139, 250, 0.15)',
          badgeColor: '#A78BFA',
          title: 'Q3 Brand Sprint',
          value: '45% Target Margin',
          subtext: 'Signed Contract • 3 Milestones',
        };
      case 'invoice':
        return {
          icon: <Receipt size={14} color="#FBBF24" />,
          badge: 'Due in 5 Days',
          badgeBg: 'rgba(251, 191, 36, 0.15)',
          badgeColor: '#FBBF24',
          title: 'INV-2026-0001',
          value: '$2,500.00',
          subtext: 'UX Design & Interactive Retainer',
        };
      case 'payment':
        return {
          icon: <CreditCard size={14} color="#34D399" />,
          badge: 'Settled Direct',
          badgeBg: 'rgba(52, 211, 153, 0.15)',
          badgeColor: '#34D399',
          title: 'Incoming Wire Deposit',
          value: '+$2,500.00',
          subtext: 'Receipt Auto-Dispatched',
        };
      case 'expense':
        return {
          icon: <FileSpreadsheet size={14} color="#F87171" />,
          badge: 'Deductible',
          badgeBg: 'rgba(248, 113, 113, 0.15)',
          badgeColor: '#F87171',
          title: 'Server & SaaS Overheads',
          value: '-$318.00',
          subtext: 'Direct Cost of Service',
        };
      case 'profit':
        return {
          icon: <TrendingUp size={14} color="#C9A227" />,
          badge: 'Realized Margin',
          badgeBg: 'rgba(201, 162, 39, 0.2)',
          badgeColor: '#C9A227',
          title: 'Realized Net Profit',
          value: '$16,227.52',
          subtext: '81.9% Realized Net Margin',
        };
    }
  };

  const content = getModuleContent();

  const transformStyle = {
    left: `${x}px`,
    top: `${y}px`,
    transform: `translate3d(-50%, -50%, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
    animation: `floatGentleA 6s ease-in-out infinite`,
    animationDelay: floatDelay,
  };

  return (
    <div className="module-card-3d" style={transformStyle}>
      <div className="module-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {content.icon}
          <span className="module-card-title">{content.title}</span>
        </div>
        <span
          className="module-card-badge"
          style={{ background: content.badgeBg, color: content.badgeColor }}
        >
          {type === 'payment' && <CheckCircle2 size={10} />}
          {type === 'profit' && <Sparkles size={10} />}
          <span>{content.badge}</span>
        </span>
      </div>

      <div className="module-card-value">{content.value}</div>
      <div className="module-card-subtext">{content.subtext}</div>
    </div>
  );
};
