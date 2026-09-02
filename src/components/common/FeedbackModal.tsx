import React, { useState } from 'react';
import { Star, MessageSquare, X, Send, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from './Toast';
import { supabase } from '../../services/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<'feature' | 'praise' | 'bug' | 'general'>('feature');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      showToast('Please enter your feedback or suggestion.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user?.id || null,
        user_email: user?.email || 'Anonymous Visitor',
        rating,
        category,
        content: feedback.trim(),
        created_at: new Date().toISOString(),
      };

      // Try saving to supabase
      try {
        await (supabase as any).from('feedbacks').insert(payload);
      } catch {
        // Fallback to local storage
        const existing = JSON.parse(localStorage.getItem('bizpilotly_feedbacks') || '[]');
        localStorage.setItem('bizpilotly_feedbacks', JSON.stringify([payload, ...existing]));
      }

      setSubmitted(true);
      showToast('Thank you for helping us make BizPilotly better!', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setFeedback('');
        onClose();
      }, 2000);
    } catch {
      showToast('Failed to submit feedback. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
          maxWidth: '460px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D1FAE5', color: '#10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Heart size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', margin: '0 0 0.25rem 0' }}>
              Thank You for Your Feedback!
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              Your ideas shape the future of BizPilotly.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <MessageSquare size={20} color="#0B1F3A" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
                Share Your Feedback
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
              Rate your experience and tell us what features you'd like us to build next.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Star Rating */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  How satisfied are you with BizPilotly?
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Star
                        size={28}
                        fill={(hoverRating || rating) >= star ? '#F59E0B' : 'transparent'}
                        color={(hoverRating || rating) >= star ? '#F59E0B' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>
                  Feedback Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                  {[
                    { id: 'feature', label: '🚀 Feature Request' },
                    { id: 'praise', label: '❤️ What I Love' },
                    { id: 'bug', label: '🐛 Bug / Issue' },
                    { id: 'general', label: '💡 General Idea' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: category === cat.id ? '1px solid #0B1F3A' : '1px solid #E2E8F0',
                        background: category === cat.id ? '#0B1F3A' : '#ffffff',
                        color: category === cat.id ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>
                  Your Comments or Suggestions
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Tell us what you like or what would make BizPilotly 10x better for your business..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ minWidth: '120px', justifyContent: 'center' }}
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
