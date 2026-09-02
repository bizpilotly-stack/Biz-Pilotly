import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Sparkles, CreditCard, FileText, Settings, ExternalLink } from 'lucide-react';
import { notificationService, AppNotification, NotificationCategory } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'All'>('All');

  const userId = user?.id || '';

  const loadNotifications = () => {
    if (userId) {
      setNotifications(notificationService.getNotifications(userId));
    }
  };

  useEffect(() => {
    loadNotifications();
    const unsubscribe = notificationService.subscribe(loadNotifications);
    return () => unsubscribe();
  }, [userId]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = notifications.filter(
    (n) => activeCategory === 'All' || n.category === activeCategory
  );

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return 'Yesterday';
      if (days < 30) return `${days}d ago`;
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Trial':
        return <Sparkles size={14} color="#D97706" />;
      case 'Payments':
        return <CreditCard size={14} color="#10B981" />;
      case 'Invoices':
        return <FileText size={14} color="#3B82F6" />;
      case 'Account':
      case 'System':
      default:
        return <Settings size={14} color="#64748B" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 'min(380px, 92vw)',
        maxHeight: '480px',
        background: '#ffffff',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: 'var(--radius-xl, 16px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface-muted, #f8fafc)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} color="#0B1F3A" />
          <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0B1F3A' }}>Notifications</span>
          {notifications.some((n) => !n.read) && (
            <span
              style={{
                fontSize: '0.6875rem',
                background: '#EF4444',
                color: '#ffffff',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '999px',
              }}
            >
              {notifications.filter((n) => !n.read).length} new
            </span>
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => notificationService.markAllAsRead(userId)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.75rem',
              color: 'var(--brand-navy-600, #2563eb)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Check size={12} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          overflowX: 'auto',
          background: '#ffffff',
        }}
      >
        {(['All', 'Trial', 'Invoices', 'Payments'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.6875rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeCategory === cat ? '#0B1F3A' : '#f1f5f9',
              color: activeCategory === cat ? '#ffffff' : '#64748b',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
            <Bell size={28} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>No notifications</div>
            <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>You are completely caught up!</div>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) notificationService.markAsRead(userId, n.id);
              }}
              style={{
                padding: '0.875rem 1rem',
                borderBottom: '1px solid var(--border-color, #f1f5f9)',
                background: n.read ? '#ffffff' : '#F8FAFC',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                position: 'relative',
              }}
            >
              {!n.read && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '6px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#3B82F6',
                  }}
                />
              )}

              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: n.category === 'Trial' ? '#FEF3C7' : n.category === 'Payments' ? '#D1FAE5' : '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {getCategoryIcon(n.category)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontWeight: n.read ? 600 : 700, fontSize: '0.8125rem', color: '#0B1F3A', lineHeight: 1.3 }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  {n.message}
                </p>

                {n.actionUrl && (
                  <Link
                    to={n.actionUrl}
                    onClick={() => {
                      notificationService.markAsRead(userId, n.id);
                      onClose();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '6px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#2563EB',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{n.actionLabel || 'View'}</span>
                    <ExternalLink size={10} />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
