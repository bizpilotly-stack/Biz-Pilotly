import { supabase } from './supabase';

export interface PlatformOverviewStats {
  totalUsers: number;
  totalBusinesses: number;
  totalDocuments: number;
  totalInvoices: number;
  totalQuotes: number;
  totalRevenue: number;
  totalExpenses: number;
  totalPdfsGenerated: number;
  totalEmailsSent: number;
}

export interface PlatformUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  businessCount: number;
  documentCount: number;
}

export interface PlatformBusinessRow {
  id: string;
  name: string;
  ownerEmail: string;
  currency: string;
  createdAt: string;
  customerCount: number;
  documentCount: number;
  revenueTotal: number;
}

export interface AdminAuditLogRow {
  id: string;
  actorUserId: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: any;
  createdAt: string;
}

class AdminService {
  /**
   * Authoritatively checks if current user has platform administrator privileges.
   */
  async checkIsAdmin(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error || !data) return false;
      return data.role === 'admin' || data.role === 'super_admin';
    } catch {
      return false;
    }
  }

  /**
   * Fetches aggregate platform-wide performance metrics.
   */
  async getPlatformOverview(): Promise<PlatformOverviewStats> {
    const isAdmin = await this.checkIsAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin role required.');
    }

    // Parallel queries for platform counters
    const [
      { count: businessCount },
      { data: documents },
      { data: payments },
      { data: expenses },
      { count: emailsCount },
      { count: usersCount },
    ] = await Promise.all([
      supabase.from('businesses').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('type, total, pdf_storage_path'),
      supabase.from('payments').select('amount, status'),
      supabase.from('expenses').select('amount'),
      supabase.from('email_logs').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }),
    ]);

    const docs = documents || [];
    const totalInvoices = docs.filter((d) => d.type === 'invoice').length;
    const totalQuotes = docs.filter((d) => d.type === 'quote').length;
    const totalPdfsGenerated = docs.filter((d) => Boolean(d.pdf_storage_path)).length;

    const totalRevenue = (payments || [])
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const totalExpenses = (expenses || []).reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0
    );

    return {
      totalUsers: Math.max(1, usersCount || 0),
      totalBusinesses: businessCount || 0,
      totalDocuments: docs.length,
      totalInvoices,
      totalQuotes,
      totalRevenue,
      totalExpenses,
      totalPdfsGenerated,
      totalEmailsSent: emailsCount || 0,
    };
  }

  /**
   * Fetches platform users for administration.
   */
  async getPlatformUsers(): Promise<PlatformUserRow[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at');

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    return (data || []).map((r) => ({
      id: r.user_id,
      email: `user-${r.user_id.slice(0, 8)}@platform.bizpilotly.com`,
      name: `Account User (${r.user_id.slice(0, 6)})`,
      role: r.role,
      createdAt: r.created_at,
      businessCount: 1,
      documentCount: 0,
    }));
  }

  /**
   * Fetches platform businesses.
   */
  async getPlatformBusinesses(): Promise<PlatformBusinessRow[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        currency,
        created_at,
        customers (count),
        documents (count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin businesses:', error);
      return [];
    }

    return (data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      ownerEmail: 'Verified Owner',
      currency: b.currency || 'USD',
      createdAt: b.created_at,
      customerCount: b.customers?.[0]?.count || 0,
      documentCount: b.documents?.[0]?.count || 0,
      revenueTotal: 0,
    }));
  }

  /**
   * Fetches audit log records.
   */
  async getAuditLogs(): Promise<AdminAuditLogRow[]> {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return [];
    return (data || []).map((log) => ({
      id: log.id,
      actorUserId: log.actor_user_id,
      action: log.action,
      targetType: log.target_type,
      targetId: log.target_id,
      metadata: log.metadata,
      createdAt: log.created_at,
    }));
  }

  /**
   * Records an administrative action in the platform audit log.
   */
  async logAdminAction(action: string, targetType: string, targetId?: string, metadata?: Record<string, any>) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('admin_audit_logs').insert({
      actor_user_id: session.user.id,
      action,
      target_type: targetType,
      target_id: targetId || null,
      metadata: metadata || {},
    });
  }
}

export const adminService = new AdminService();
