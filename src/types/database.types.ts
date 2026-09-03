export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DocumentType = 'invoice' | 'quote' | 'estimate' | 'proposal' | 'contract' | 'receipt';
export type DocumentStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected'
  | 'signed'
  | 'declined'
  | 'paid' 
  | 'partially_paid'
  | 'pending_confirmation' 
  | 'overdue' 
  | 'expired' 
  | 'cancelled';
export type CustomerStatus = 'active' | 'inactive' | 'lead';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type ExpenseStatus = 'cleared' | 'pending' | 'reimbursed';
export type ExpenseCategory =
  | 'Software'
  | 'Marketing'
  | 'Transport'
  | 'Equipment'
  | 'Contractors'
  | 'Utilities'
  | 'Other';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      businesses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          tagline: string | null;
          logo_url: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          website: string | null;
          tax_number: string | null;
          currency: string;
          currency_symbol: string;
          default_tax_rate: number;
          invoice_prefix: string;
          quote_prefix: string;
          receipt_prefix: string;
          proposal_prefix: string;
          estimate_prefix?: string;
          contract_prefix?: string;
          default_payment_terms: string | null;
          default_notes: string | null;
          bank_name: string | null;
          bank_account_name: string | null;
          bank_account_number: string | null;
          bank_routing_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          tagline?: string | null;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          website?: string | null;
          tax_number?: string | null;
          currency?: string;
          currency_symbol?: string;
          default_tax_rate?: number;
          invoice_prefix?: string;
          quote_prefix?: string;
          receipt_prefix?: string;
          proposal_prefix?: string;
          estimate_prefix?: string;
          contract_prefix?: string;
          default_payment_terms?: string | null;
          default_notes?: string | null;
          bank_name?: string | null;
          bank_account_name?: string | null;
          bank_account_number?: string | null;
          bank_routing_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          tagline?: string | null;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          website?: string | null;
          tax_number?: string | null;
          currency?: string;
          currency_symbol?: string;
          default_tax_rate?: number;
          invoice_prefix?: string;
          quote_prefix?: string;
          receipt_prefix?: string;
          proposal_prefix?: string;
          estimate_prefix?: string;
          contract_prefix?: string;
          default_payment_terms?: string | null;
          default_notes?: string | null;
          bank_name?: string | null;
          bank_account_name?: string | null;
          bank_account_number?: string | null;
          bank_routing_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'businesses_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          website: string | null;
          currency: string;
          status: CustomerStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          website?: string | null;
          currency?: string;
          status?: CustomerStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          website?: string | null;
          currency?: string;
          status?: CustomerStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          type: DocumentType;
          document_number: string;
          title: string;
          issue_date: string;
          due_date: string | null;
          valid_until: string | null;
          status: DocumentStatus;
          currency: string;
          currency_symbol: string;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          discount_rate: number;
          discount_amount: number;
          total: number;
          notes: string | null;
          terms: string | null;
          payment_details: Json | null;
          business_snapshot: Json | null;
          client_snapshot: Json | null;
          pdf_storage_path: string | null;
          pdf_generated_at: string | null;
          pdf_version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string | null;
          type: DocumentType;
          document_number: string;
          title: string;
          issue_date?: string;
          due_date?: string | null;
          valid_until?: string | null;
          status?: DocumentStatus;
          currency?: string;
          currency_symbol?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_rate?: number;
          discount_amount?: number;
          total?: number;
          notes?: string | null;
          terms?: string | null;
          payment_details?: Json | null;
          business_snapshot?: Json | null;
          client_snapshot?: Json | null;
          pdf_storage_path?: string | null;
          pdf_generated_at?: string | null;
          pdf_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string | null;
          type?: DocumentType;
          document_number?: string;
          title?: string;
          issue_date?: string;
          due_date?: string | null;
          valid_until?: string | null;
          status?: DocumentStatus;
          currency?: string;
          currency_symbol?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_rate?: number;
          discount_amount?: number;
          total?: number;
          notes?: string | null;
          terms?: string | null;
          payment_details?: Json | null;
          business_snapshot?: Json | null;
          client_snapshot?: Json | null;
          pdf_storage_path?: string | null;
          pdf_generated_at?: string | null;
          pdf_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_customer_id_fkey';
            columns: ['customer_id'];
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          }
        ];
      };
      document_items: {
        Row: {
          id: string;
          document_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          amount: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          amount?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          amount?: number;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'document_items_document_id_fkey';
            columns: ['document_id'];
            referencedRelation: 'documents';
            referencedColumns: ['id'];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          business_id: string;
          document_id: string | null;
          customer_id: string | null;
          payment_number: string;
          amount: number;
          currency: string;
          currency_symbol: string;
          method: string;
          date: string;
          status: PaymentStatus;
          reference: string | null;
          notes: string | null;
          provider?: string | null;
          provider_transaction_id?: string | null;
          provider_reference?: string | null;
          checkout_reference?: string | null;
          webhook_event_id?: string | null;
          paid_at?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          document_id?: string | null;
          customer_id?: string | null;
          payment_number: string;
          amount: number;
          currency?: string;
          currency_symbol?: string;
          method: string;
          date?: string;
          status?: PaymentStatus;
          reference?: string | null;
          notes?: string | null;
          provider?: string | null;
          provider_transaction_id?: string | null;
          provider_reference?: string | null;
          checkout_reference?: string | null;
          webhook_event_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          document_id?: string | null;
          customer_id?: string | null;
          payment_number?: string;
          amount?: number;
          currency?: string;
          currency_symbol?: string;
          method?: string;
          date?: string;
          status?: PaymentStatus;
          reference?: string | null;
          notes?: string | null;
          provider?: string | null;
          provider_transaction_id?: string | null;
          provider_reference?: string | null;
          checkout_reference?: string | null;
          webhook_event_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_document_id_fkey';
            columns: ['document_id'];
            referencedRelation: 'documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_customer_id_fkey';
            columns: ['customer_id'];
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          }
        ];
      };
      expenses: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          category: ExpenseCategory;
          amount: number;
          currency: string;
          currency_symbol: string;
          date: string;
          vendor: string | null;
          payment_method: string | null;
          status: ExpenseStatus;
          receipt_attached: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          category: ExpenseCategory;
          amount: number;
          currency?: string;
          currency_symbol?: string;
          date?: string;
          vendor?: string | null;
          payment_method?: string | null;
          status?: ExpenseStatus;
          receipt_attached?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title?: string;
          category?: ExpenseCategory;
          amount?: number;
          currency?: string;
          currency_symbol?: string;
          date?: string;
          vendor?: string | null;
          payment_method?: string | null;
          status?: ExpenseStatus;
          receipt_attached?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          }
        ];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'super_admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'admin' | 'super_admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'super_admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          actor_user_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      email_logs: {
        Row: {
          id: string;
          business_id: string | null;
          document_id: string | null;
          template_type: string;
          recipient_email: string;
          subject: string;
          status: 'queued' | 'sent' | 'failed' | 'delivered';
          resend_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          document_id?: string | null;
          template_type: string;
          recipient_email: string;
          subject: string;
          status?: 'queued' | 'sent' | 'failed' | 'delivered';
          resend_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          document_id?: string | null;
          template_type?: string;
          recipient_email?: string;
          subject?: string;
          status?: 'queued' | 'sent' | 'failed' | 'delivered';
          resend_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      document_type: DocumentType;
      document_status: DocumentStatus;
      customer_status: CustomerStatus;
      payment_status: PaymentStatus;
      expense_status: ExpenseStatus;
      expense_category: ExpenseCategory;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
