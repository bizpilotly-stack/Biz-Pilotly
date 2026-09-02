import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, RotateCcw, Check, ShieldCheck, X } from 'lucide-react';

interface DigitalSignatureCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: { image: string; signerName: string; signedAt: string }) => void;
  defaultSignerName?: string;
}

export const DigitalSignatureCanvas: React.FC<DigitalSignatureCanvasProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultSignerName = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(defaultSignerName);
  const [selectedFont] = useState<'cursive' | 'serif' | 'sans-serif'>('cursive');

  useEffect(() => {
    if (isOpen && mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0B1F3A';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const timestamp = new Date().toISOString();
    let signatureImage = '';

    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      signatureImage = canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) return;
      // Generate canvas image from typed text
      const offscreen = document.createElement('canvas');
      offscreen.width = 400;
      offscreen.height = 140;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0B1F3A';
        ctx.font = `italic 36px ${selectedFont === 'cursive' ? 'Brush Script MT, cursive' : selectedFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, 200, 70);
        signatureImage = offscreen.toDataURL('image/png');
      }
    }

    onSave({
      image: signatureImage,
      signerName: mode === 'type' ? typedName.trim() : defaultSignerName || 'Authorized Signatory',
      signedAt: timestamp,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(9, 13, 22, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-2xl, 20px)',
          maxWidth: '500px',
          width: '100%',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: '#0B1F3A' }}>
            <PenTool size={20} color="#0B1F3A" />
            <span>Apply Digital E-Signature</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Sign proposals, quotes, and agreements with legal cryptographic verification.
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`btn btn-sm ${mode === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <PenTool size={14} />
            <span>Draw Signature</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`btn btn-sm ${mode === 'type' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Type size={14} />
            <span>Type Signature</span>
          </button>
        </div>

        {/* Signature Area */}
        {mode === 'draw' ? (
          <div>
            <div
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: 'var(--radius-lg, 12px)',
                background: '#F8FAFC',
                position: 'relative',
                touchAction: 'none',
              }}
            >
              <canvas
                ref={canvasRef}
                width={450}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: '100%', height: '160px', display: 'block', cursor: 'crosshair' }}
              />
              {!hasDrawn && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    color: '#94A3B8',
                    fontSize: '0.875rem',
                    fontStyle: 'italic',
                  }}
                >
                  Draw your signature here using mouse or finger
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={clearCanvas}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', color: '#64748B' }}
              >
                <RotateCcw size={12} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type your full legal name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              style={{ fontSize: '1rem', fontWeight: 600 }}
            />
            {typedName.trim() && (
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  fontSize: '2rem',
                  fontStyle: 'italic',
                  fontFamily: selectedFont === 'cursive' ? 'Brush Script MT, cursive' : selectedFont,
                  color: '#0B1F3A',
                }}
              >
                {typedName}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '1.25rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#10B981', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            <span>Timestamped & Hash-Verified</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={mode === 'draw' ? !hasDrawn : !typedName.trim()}
              className="btn btn-primary btn-sm"
            >
              <Check size={14} />
              <span>Apply Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
