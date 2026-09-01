import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

export const AdminProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const verifyAdmin = async () => {
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }
      try {
        const adminStatus = await adminService.checkIsAdmin();
        if (isMounted) {
          setIsAdmin(adminStatus);
          setChecking(false);
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    };

    if (!authLoading) {
      verifyAdmin();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verifying platform administrator permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '2rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: '#FEE2E2', borderRadius: '50%', color: '#DC2626', marginBottom: '1rem' }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.5rem' }}>
          Access Denied (403 Forbidden)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Your authenticated account is not assigned an active platform administrator role (<code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>admin</code> or <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>super_admin</code>).
        </p>
        <Button variant="primary" onClick={() => window.location.assign('/app')}>
          Return to Business Dashboard
        </Button>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
