import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { BRAND_NAME, SUPPORT_EMAIL } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been sent successfully!', 'success');
  };

  return (
    <div className="section-py-sm">
      <SEO
        title={`Contact & Support | ${BRAND_NAME}`}
        description={`Get in touch with the ${BRAND_NAME} team for support, feature suggestions, or business inquiries.`}
        canonical="https://example.com/contact"
      />

      <div className="container">
        <div className="text-center" style={{ maxWidth: '640px', margin: '0 auto 3rem' }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>Support & Feedback</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            We'd Love to Hear From You
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)' }}>
            Have a question about our calculators, document builder, or upcoming Pro capabilities? Send us a message anytime.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', maxWidth: '960px', margin: '0 auto' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Direct Inquiries</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Whether you are an independent freelancer, an agency founder, or have feedback on calculation formulas, our product team is here to assist.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Direct Email</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{SUPPORT_EMAIL}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--brand-gold-50)', color: 'var(--brand-gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Community Feedback</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Product Suggestion Portal</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Thank you for reaching out!</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  We have received your message and will get back to you shortly.
                </p>
                <Button variant="secondary" style={{ marginTop: '1.5rem' }} onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Subject"
                  placeholder="How can we help?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <div className="form-group">
                  <label className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Tell us what you need or how we can improve..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <Send size={16} />
                  <span>Send Message</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
