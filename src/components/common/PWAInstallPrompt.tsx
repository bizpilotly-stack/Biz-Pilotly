import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed recently
      const dismissed = localStorage.getItem('bizpilotly_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('bizpilotly_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        background: '#0B1F3A',
        color: '#FFFFFF',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '380px',
        border: '1px solid rgba(212,175,55,0.4)',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B1F3A', flexShrink: 0 }}>
        <Download size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Install BizPilotly App</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
          Access calculators & documents anytime from your home screen.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button variant="primary" size="sm" onClick={handleInstall} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
          Install
        </Button>
        <button
          onClick={handleDismiss}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px' }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
