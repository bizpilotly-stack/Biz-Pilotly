import { supabase } from './supabase';

export interface SendEmailOptions {
  templateType:
    | 'invoice_sent'
    | 'quote_sent'
    | 'proposal_sent'
    | 'receipt_sent'
    | 'welcome'
    | 'payment_received'
    | 'payment_reminder';
  recipientEmail: string;
  recipientName?: string;
  documentId?: string;
  customSubject?: string;
  customMessage?: string;
  attachPdf?: boolean;
}

export interface EmailLogEntry {
  id: string;
  businessId: string;
  documentId?: string;
  templateType: string;
  recipientEmail: string;
  subject: string;
  status: 'queued' | 'sent' | 'failed' | 'delivered';
  sentAt: string;
  errorMessage?: string;
}

class EmailService {
  /**
   * Dispatches transactional email through the secure Supabase Edge Function without exposing Resend keys.
   */
  async sendTransactionalEmail(options: SendEmailOptions): Promise<{ success: boolean; resendId?: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required to send business emails.');
    }

    const { data, error } = await supabase.functions.invoke('send-transactional-email', {
      body: options,
    });

    if (error) {
      console.error('Error invoking send-transactional-email Edge Function:', error);
      throw new Error(error.message || 'Failed to dispatch email.');
    }

    return {
      success: data?.success ?? true,
      resendId: data?.resendId,
    };
  }

  /**
   * Fetches recent email dispatch history for the current business.
   */
  async getEmailLogs(): Promise<EmailLogEntry[]> {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching email logs:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      businessId: row.business_id,
      documentId: row.document_id,
      templateType: row.template_type,
      recipientEmail: row.recipient_email,
      subject: row.subject,
      status: row.status,
      sentAt: row.sent_at || row.created_at,
      errorMessage: row.error_message,
    }));
  }
}

export const emailService = new EmailService();
