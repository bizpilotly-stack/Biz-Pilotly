import React from 'react';
import { DocumentStatus } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';
  status?: DocumentStatus | 'active' | 'inactive' | 'lead' | 'completed' | 'pending' | 'cleared' | 'failed' | 'refunded';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  className = '',
}) => {
  let resolvedVariant = variant || 'neutral';

  if (status) {
    switch (status) {
      case 'paid':
      case 'accepted':
      case 'active':
      case 'completed':
      case 'cleared':
        resolvedVariant = 'success';
        break;
      case 'sent':
      case 'viewed':
      case 'pending':
      case 'lead':
        resolvedVariant = 'info';
        break;
      case 'overdue':
      case 'cancelled':
      case 'failed':
        resolvedVariant = 'danger';
        break;
      case 'draft':
      case 'inactive':
      case 'refunded':
      default:
        resolvedVariant = 'neutral';
        break;
    }
  }

  return (
    <span className={`badge badge-${resolvedVariant} ${className}`.trim()}>
      {children}
    </span>
  );
};
