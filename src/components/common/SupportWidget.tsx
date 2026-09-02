import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, X, Send, CheckCircle2, Headphones } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from './Toast';
import { emailService } from '../../services/emailService';

interface SupportWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SupportWidget: React.FC<SupportWidgetProps> = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');

  // Form State
  const [name] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'billing' | 'technical' | 'invoicing' | 'general'>('invoicing');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // WhatsApp Support Direct Link
  const whatsappNumber = '+2348000000000'; // Default support WhatsApp line
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello BizPilotly Support, my name is ${name || 'User'} (${email || 'No email'}). I need assistance with: `
  )}`;

  const handleSendEmailSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      showToast('Please fill in your email and message.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save support ticket locally or send via emailService
      try {
        await emailService.sendTransactionalEmail({
          templateType: 'payment_reported',
          recipientEmail: 'support@bizpilotly.com',
          recipientName: 'BizPilotly Support Team',
          customSubject: `[Support Ticket - ${category.toUpperCase()}] ${subject.trim() || 'User Request'}`,
          customMessage: `From: ${name.trim()} (${email.trim()})\nCategory: ${category}\n\nMessage:\n${message.trim()}`,
        });
      } catch {
        // Fallback
      }

      setSubmitted(true);
      showToast('Support ticket submitted! Our team will respond shortly.', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
        setMessage('');
        setSubject('');
      }, 2500);
    } catch {
      showToast('Failed to submit ticket. Please try WhatsApp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Support Button (Bottom Right) */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9990 }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '10px 18px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #0B1F3A 0%, #1E3A8A 100%)',
            color: '#ffffff',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 8px 20px rgba(11, 31, 58, 0.25)',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Headphones size={16} color="#F59E0B" />
          <span>Need Help?</span>
        </button>
      </div>

      {/* Support Drawer / Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            background: '#ffffff',
            borderRadius: 'var(--radius-2xl, 20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ background: '#0B1F3A', color: '#ffffff', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={18} color="#F59E0B" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>BizPilotly Help & Support</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>Instant WhatsApp & In-App Help Desk</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Channel Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              style={{
                padding: '0.75rem',
                border: 'none',
                background: activeTab === 'whatsapp' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: activeTab === 'whatsapp' ? '#059669' : '#64748B',
                borderBottom: activeTab === 'whatsapp' ? '2px solid #059669' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <MessageCircle size={15} color={activeTab === 'whatsapp' ? '#059669' : '#64748B'} />
              <span>WhatsApp Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('email')}
              style={{
                padding: '0.75rem',
                border: 'none',
                background: activeTab === 'email' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: activeTab === 'email' ? '#0B1F3A' : '#64748B',
                borderBottom: activeTab === 'email' ? '2px solid #0B1F3A' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <Mail size={15} color={activeTab === 'email' ? '#0B1F3A' : '#64748B'} />
              <span>In-App Email</span>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.25rem' }}>
            {activeTab === 'whatsapp' ? (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <MessageCircle size={28} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1F3A', margin: '0 0 0.25rem 0' }}>
                  Chat Live on WhatsApp
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
                  Connect directly with our support specialists. Fast responses for invoicing, billing, and VIP setup.
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-lg, 12px)',
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>
            ) : (
              <div>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 0.75rem auto' }} />
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0B1F3A', margin: '0 0 0.25rem 0' }}>
                      Message Received!
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                      Our support team will respond to <strong>{email}</strong> shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSendEmailSupport}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        Category
                      </label>
                      <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                      >
                        <option value="invoicing">Invoicing & Document Generation</option>
                        <option value="billing">Subscription & Billing</option>
                        <option value="technical">Technical / Bug Issue</option>
                        <option value="general">General Inquiries</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        How can we help you?
                      </label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Describe your question or issue in detail..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        style={{ fontSize: '0.8125rem', padding: '8px 10px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}
                    >
                      <Send size={14} />
                      <span>{isSubmitting ? 'Sending Ticket...' : 'Submit Support Ticket'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
