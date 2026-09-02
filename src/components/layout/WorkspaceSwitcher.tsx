import React, { useState, useEffect, useRef } from 'react';
import { Building, ChevronDown, Plus, Check } from 'lucide-react';
import { businessService } from '../../services/businessService';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface BusinessBrand {
  id: string;
  name: string;
  currency: string;
  isPrimary?: boolean;
}

const BRANDS_STORAGE_KEY = 'bizpilotly_multi_brands';

export const WorkspaceSwitcher: React.FC = () => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState<BusinessBrand[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string>('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCurrency, setNewBrandCurrency] = useState('NGN');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadBrands = async () => {
    try {
      const primary = await businessService.getCurrentBusiness();
      const primaryBrand: BusinessBrand = {
        id: primary?.id || 'brand_1',
        name: primary?.name || 'My Studio Workspace',
        currency: primary?.currency || 'NGN',
        isPrimary: true,
      };

      const stored = localStorage.getItem(BRANDS_STORAGE_KEY);
      let list: BusinessBrand[] = [primaryBrand];
      if (stored) {
        const extra: BusinessBrand[] = JSON.parse(stored);
        list = [primaryBrand, ...extra.filter((b) => b.id !== primaryBrand.id)];
      }

      setBrands(list);
      if (!activeBrandId) {
        setActiveBrandId(primaryBrand.id);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeBrand = brands.find((b) => b.id === activeBrandId) || brands[0];

  const handleSelectBrand = (brand: BusinessBrand) => {
    setActiveBrandId(brand.id);
    setIsOpen(false);
    showToast(`Switched workspace to ${brand.name}`, 'success');
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    if (brands.length >= 5) {
      showToast('Maximum 5 business entities reached on Business Suite.', 'error');
      return;
    }

    const newBrand: BusinessBrand = {
      id: `brand_${Date.now()}`,
      name: newBrandName.trim(),
      currency: newBrandCurrency,
      isPrimary: false,
    };

    const extraBrands = brands.filter((b) => !b.isPrimary);
    const updatedExtra = [...extraBrands, newBrand];
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(updatedExtra));

    setBrands([...brands, newBrand]);
    setActiveBrandId(newBrand.id);
    setIsNewModalOpen(false);
    setNewBrandName('');
    showToast(`✓ New business entity "${newBrand.name}" created!`, 'success');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-surface-muted, #f1f5f9)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '4px 10px',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#0B1F3A',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Building size={14} color="#0B1F3A" />
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeBrand?.name || 'Workspace'}
        </span>
        <ChevronDown size={14} color="#64748B" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '240px',
            background: '#ffffff',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 'var(--radius-xl, 16px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '0.625rem 0.875rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            Switch Business Workspace ({brands.length}/5)
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {brands.map((b) => {
              const isSelected = b.id === activeBrandId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBrand(b)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.625rem 0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isSelected ? '#EFF6FF' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: isSelected ? '#1E40AF' : '#1E293B',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                  {isSelected && <Check size={14} color="#2563EB" />}
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', padding: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsNewModalOpen(true);
              }}
              disabled={brands.length >= 5}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md, 8px)',
                background: '#F1F5F9',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0B1F3A',
                cursor: brands.length >= 5 ? 'not-allowed' : 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Add Business Brand</span>
            </button>
          </div>
        </div>
      )}

      {/* Add New Brand Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Create New Business Brand">
        <form onSubmit={handleCreateBrand}>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.25rem' }}>
            Manage up to 5 separate business entities or client-facing brand studios under your Business Suite account.
          </p>

          <Input
            label="Business / Studio Name"
            placeholder="e.g. Apex Digital Studios"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            required
          />

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Primary Invoicing Currency</label>
            <select className="form-select" value={newBrandCurrency} onChange={(e) => setNewBrandCurrency(e.target.value)}>
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Brand Entity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
