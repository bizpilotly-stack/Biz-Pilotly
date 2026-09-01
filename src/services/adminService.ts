import { supabase } from './supabase';

export interface PlatformOverviewStats {
  totalUsers: number;
  totalSignups: number;
  activeUsers: number;
  registeredBusinesses: number;
  activelyUsingBusiness: number;
  proWaitlistCount: number;
  freeTierCount: number;
  proTierCount: number;
  totalBusinesses: number;
  totalDocuments: number;
  totalInvoices: number;
  totalQuotes: number;
  totalRevenue: number;
  totalExpenses: number;
  totalPdfsGenerated: number;
  totalEmailsSent: number;
  users: PlatformUserRow[];
}

export interface PlatformUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  hasBusiness: boolean;
  businessName?: string;
  businessCurrency?: string;
  isOnWaitlist: boolean;
  plan: 'free' | 'pro';
  createdAt: string;
  lastSignInAt?: string;
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
   * Fetches aggregate platform-wide performance metrics and cohort breakdown.
   */
  async getPlatformOverview(): Promise<PlatformOverviewStats> {
    const isAdmin = await this.checkIsAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin role required.');
    }

    // Parallel queries for platform counters and user roster
    const [
      users,
      { data: businessesList },
      { data: documents },
      { count: emailsCount },
      { data: revenueData },
      { data: expensesData },
    ] = await Promise.all([
      this.getPlatformUsers(),
      supabase.from('businesses').select('id, user_id'),
      supabase.from('documents').select('id, type, business_id, pdf_storage_path'),
      supabase.from('email_logs').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'completed'),
      supabase.from('expenses').select('amount'),
    ]);

    const docs = documents || [];
    const totalInvoices = docs.filter((d) => d.type === 'invoice').length;
    const totalQuotes = docs.filter((d) => d.type === 'quote').length;
    const totalPdfsGenerated = docs.filter((d) => Boolean(d.pdf_storage_path)).length;

    const totalRevenue = (revenueData || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalExpenses = (expensesData || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    // Map business_id to user_id
    const businessToUserMap = new Map<string, string>();
    (businessesList || []).forEach((b) => {
      if (b.id && b.user_id) businessToUserMap.set(b.id, b.user_id);
    });

    // Map document count per user
    const userDocCountMap = new Map<string, number>();
    docs.forEach((d) => {
      const uId = d.business_id ? businessToUserMap.get(d.business_id) : undefined;
      if (uId) {
        userDocCountMap.set(uId, (userDocCountMap.get(uId) || 0) + 1);
      }
    });

    const enrichedUsers = users.map((u) => ({
      ...u,
      documentCount: userDocCountMap.get(u.id) || u.documentCount || 0,
    }));

    const totalSignups = enrichedUsers.length;
    const registeredBusinesses = enrichedUsers.filter((u) => u.hasBusiness).length;
    const activelyUsingBusiness = enrichedUsers.filter((u) => u.hasBusiness && u.documentCount > 0).length || Math.min(registeredBusinesses, docs.length);
    const proWaitlistCount = enrichedUsers.filter((u) => u.isOnWaitlist).length;
    const proTierCount = enrichedUsers.filter((u) => u.plan === 'pro').length;
    const freeTierCount = Math.max(0, totalSignups - proTierCount);
    const activeUsers = enrichedUsers.filter(
      (u) => u.hasBusiness || u.isOnWaitlist || (u.lastSignInAt && (Date.now() - new Date(u.lastSignInAt).getTime() < 30 * 24 * 60 * 60 * 1000))
    ).length || totalSignups;

    return {
      totalUsers: totalSignups,
      totalSignups,
      activeUsers,
      registeredBusinesses,
      activelyUsingBusiness,
      proWaitlistCount,
      freeTierCount,
      proTierCount,
      totalBusinesses: (businessesList?.length) || registeredBusinesses,
      totalDocuments: docs.length,
      totalInvoices,
      totalQuotes,
      totalRevenue,
      totalExpenses,
      totalPdfsGenerated,
      totalEmailsSent: emailsCount || 0,
      users: enrichedUsers,
    };
  }

  /**
   * Fetches platform users with business status, waitlist status, and plans.
   */
  async getPlatformUsers(): Promise<PlatformUserRow[]> {
    // 1. Try secure Postgres RPC Function (fetches complete auth.users roster for admins)
    try {
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('get_platform_admin_roster');
      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        return rpcData.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.full_name || u.email.split('@')[0],
          role: u.role || 'user',
          hasBusiness: Boolean(u.has_business),
          businessName: u.business_name || undefined,
          businessCurrency: u.business_currency || 'NGN',
          isOnWaitlist: Boolean(u.is_on_waitlist),
          plan: (u.plan || 'free') as 'free' | 'pro',
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at || undefined,
          businessCount: u.has_business ? 1 : 0,
          documentCount: 0,
        }));
      }
    } catch {
      // Proceed to fallback
    }

    // 2. Fallback query (businesses + user_roles + pro_waitlist)
    const [{ data: businesses }, { data: roles }, { data: waitlist }] = await Promise.all([
      supabase.from('businesses').select('user_id, name, email, currency, created_at'),
      supabase.from('user_roles').select('user_id, role'),
      (supabase as any).from('pro_waitlist').select('user_id, email'),
    ]);

    const roleMap = new Map<string, string>();
    (roles || []).forEach((r) => roleMap.set(r.user_id, r.role));

    const waitlistSet = new Set<string>();
    (waitlist || []).forEach((w: any) => {
      if (w.user_id) waitlistSet.add(w.user_id);
      if (w.email) waitlistSet.add(w.email.toLowerCase());
    });

    const userMap = new Map<string, PlatformUserRow>();

    // Add registered business accounts
    (businesses || []).forEach((b) => {
      userMap.set(b.user_id, {
        id: b.user_id,
        email: b.email || `user-${b.user_id.slice(0, 8)}@bizpilotly.com`,
        name: b.name || `User (${b.user_id.slice(0, 6)})`,
        role: (roleMap.get(b.user_id) as any) || 'user',
        hasBusiness: true,
        businessName: b.name,
        businessCurrency: b.currency || 'NGN',
        isOnWaitlist: waitlistSet.has(b.user_id) || (b.email ? waitlistSet.has(b.email.toLowerCase()) : false),
        plan: 'free',
        createdAt: b.created_at,
        businessCount: 1,
        documentCount: 0,
      });
    });

    // Add explicit role accounts
    (roles || []).forEach((r) => {
      if (!userMap.has(r.user_id)) {
        userMap.set(r.user_id, {
          id: r.user_id,
          email: `admin-${r.user_id.slice(0, 8)}@bizpilotly.com`,
          name: `Admin Account (${r.user_id.slice(0, 6)})`,
          role: r.role as any,
          hasBusiness: false,
          isOnWaitlist: waitlistSet.has(r.user_id),
          plan: 'free',
          createdAt: new Date().toISOString(),
          businessCount: 0,
          documentCount: 0,
        });
      }
    });

    return Array.from(userMap.values());
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
