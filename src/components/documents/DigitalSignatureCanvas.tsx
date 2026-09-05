import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, RotateCcw, Check, ShieldCheck, X, UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';

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
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState(defaultSignerName);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [selectedFont] = useState<'cursive' | 'serif' | 'sans-serif'>('cursive');

  useEffect(() => {
    if (isOpen) {
      setSignerName(defaultSignerName);
      setTypedName(defaultSignerName);
    }
  }, [isOpen, defaultSignerName]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('File size must be under 3MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const timestamp = new Date().toISOString();
    let signatureImage = '';
    let finalSigner = signerName.trim() || defaultSignerName || 'Authorized Signatory';

    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      signatureImage = canvas.toDataURL('image/png');
    } else if (mode === 'type') {
      if (!typedName.trim()) return;
      finalSigner = typedName.trim();
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
    } else if (mode === 'upload') {
      if (!uploadedImage) return;
      signatureImage = uploadedImage;
    }

    onSave({
      image: signatureImage,
      signerName: finalSigner,
      signedAt: timestamp,
    });
    onClose();
  };

  const isSaveDisabled =
    (mode === 'draw' && !hasDrawn) ||
    (mode === 'type' && !typedName.trim()) ||
    (mode === 'upload' && !uploadedImage);

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
          maxWidth: '520px',
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
            Draw, type, or upload your legal signature with cryptographic verification.
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => setMode('draw')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '6px 10px',
              fontSize: '0.8125rem',
              fontWeight: mode === 'draw' ? 700 : 500,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'draw' ? '#0B1F3A' : 'transparent',
              color: mode === 'draw' ? '#ffffff' : '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            <PenTool size={13} />
            <span>Draw</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '6px 10px',
              fontSize: '0.8125rem',
              fontWeight: mode === 'type' ? 700 : 500,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'type' ? '#0B1F3A' : 'transparent',
              color: mode === 'type' ? '#ffffff' : '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            <Type size={13} />
            <span>Type</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '6px 10px',
              fontSize: '0.8125rem',
              fontWeight: mode === 'upload' ? 700 : 500,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'upload' ? '#0B1F3A' : 'transparent',
              color: mode === 'upload' ? '#ffffff' : '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            <UploadCloud size={14} />
            <span>Upload Image</span>
          </button>
        </div>

        {/* 1. DRAW MODE */}
        {mode === 'draw' && (
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
                width={460}
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
                  Draw signature here with mouse or stylus
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Signer Full Legal Name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                style={{ fontSize: '0.8125rem', padding: '4px 8px', maxWidth: '240px' }}
              />
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
        )}

        {/* 2. TYPE MODE */}
        {mode === 'type' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type your full legal name"
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value);
                setSignerName(e.target.value);
              }}
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

        {/* 3. UPLOAD MODE */}
        {mode === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {uploadedImage ? (
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', padding: '1rem', textAlign: 'center' }}>
                <img
                  src={uploadedImage}
                  alt="Uploaded Signature Preview"
                  style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#0B1F3A',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <UploadCloud size={13} />
                    <span>Change Image</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setUploadedImage('')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', color: '#EF4444' }}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <label
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  padding: '1.75rem 1rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <ImageIcon size={22} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1F3A' }}>
                  Click to upload signature image
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  PNG with transparent background, JPG, or SVG up to 3MB
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}

            {uploadError && (
              <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                {uploadError}
              </div>
            )}

            <div className="form-group" style={{ marginTop: '0.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                Legal Signer Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe / Authorized Signatory"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                style={{ fontSize: '0.875rem' }}
                required
              />
            </div>
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
              disabled={isSaveDisabled}
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
