import { supabase } from './supabase';

export interface PlatformOverviewStats {
  totalUsers: number;
  totalSignups: number;
  activeUsers: number;
  registeredBusinesses: number;
  activelyUsingBusiness: number;
  trialUsersCount: number;
  freeTierCount: number;
  proSubscribersCount: number;
  businessSuiteCount: number;
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
  subscriptionStatus: 'FREE' | 'TRIAL_ACTIVE' | 'TRIAL_EXPIRED' | 'ACTIVE';
  plan: 'free' | 'pro' | 'business';
  trialDaysLeft: number;
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
   * Fetches aggregate platform-wide performance metrics and real subscription cohorts.
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
      supabase.from('businesses').select('*'),
      supabase.from('documents').select('id, type, total, currency, status'),
      supabase.from('email_logs').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount, status').eq('status', 'completed'),
      supabase.from('expenses').select('amount'),
    ]);

    const totalBusinesses = (businessesList || []).length;
    const totalDocuments = (documents || []).length;
    const totalInvoices = (documents || []).filter((d) => d.type === 'invoice').length;
    const totalQuotes = (documents || []).filter((d) => d.type === 'quote').length;

    const totalRevenue = (revenueData || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalExpenses = (expensesData || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const registeredBusinesses = users.filter((u) => u.hasBusiness).length;
    const activelyUsingBusiness = users.filter((u) => u.documentCount > 0).length;

    const trialUsersCount = users.filter((u) => u.subscriptionStatus === 'TRIAL_ACTIVE').length;
    const freeTierCount = users.filter((u) => u.subscriptionStatus === 'FREE' || u.subscriptionStatus === 'TRIAL_EXPIRED').length;
    const proSubscribersCount = users.filter((u) => u.plan === 'pro' && u.subscriptionStatus === 'ACTIVE').length;
    const businessSuiteCount = users.filter((u) => u.plan === 'business' && u.subscriptionStatus === 'ACTIVE').length;

    return {
      totalUsers: users.length,
      totalSignups: users.length,
      activeUsers: users.filter((u) => u.hasBusiness || u.documentCount > 0).length,
      registeredBusinesses,
      activelyUsingBusiness,
      trialUsersCount,
      freeTierCount,
      proSubscribersCount,
      businessSuiteCount,
      totalBusinesses,
      totalDocuments,
      totalInvoices,
      totalQuotes,
      totalRevenue,
      totalExpenses,
      totalPdfsGenerated: totalDocuments,
      totalEmailsSent: emailsCount || 0,
      users,
    };
  }

  /**
   * Fetches the complete master user roster from Supabase profiles.
   */
  async getPlatformUsers(): Promise<PlatformUserRow[]> {
    const isAdmin = await this.checkIsAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin role required.');
    }

    const [
      { data: profiles, error: profError },
      { data: businesses },
      { data: roles },
      { data: docs },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('businesses').select('*'),
      supabase.from('user_roles').select('*'),
      supabase.from('documents').select('id, business_id'),
    ]);

    if (profError) {
      console.error('Error fetching master profiles:', profError);
      throw profError;
    }

    const businessMap = new Map<string, any>();
    (businesses || []).forEach((b) => {
      businessMap.set(b.user_id, b);
    });

    const roleMap = new Map<string, string>();
    (roles || []).forEach((r) => {
      roleMap.set(r.user_id, r.role);
    });

    const docCountMap = new Map<string, number>();
    (docs || []).forEach((d) => {
      const count = docCountMap.get(d.business_id) || 0;
      docCountMap.set(d.business_id, count + 1);
    });

    return (profiles || []).map((prof) => {
      const business = businessMap.get(prof.id);
      const role = roleMap.get(prof.id) || 'user';
      const docCount = business ? docCountMap.get(business.id) || 0 : 0;

      // Calculate trial status from created_at
      const createdTime = new Date(prof.created_at).getTime();
      const diffDays = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
      const trialDaysLeft = Math.max(0, 15 - diffDays);
      const isTrial = trialDaysLeft > 0;

      return {
        id: prof.id,
        email: prof.email || 'No email provided',
        name: prof.full_name || (business ? business.name : 'Registered Member'),
        role,
        hasBusiness: !!business,
        businessName: business?.name || undefined,
        businessCurrency: business?.currency || 'NGN',
        subscriptionStatus: isTrial ? 'TRIAL_ACTIVE' : 'FREE',
        plan: isTrial ? 'pro' : 'free',
        trialDaysLeft,
        createdAt: prof.created_at,
        businessCount: business ? 1 : 0,
        documentCount: docCount,
      };
    });
  }

  /**
   * Fetches all registered businesses on the platform.
   */
  async getPlatformBusinesses(): Promise<PlatformBusinessRow[]> {
    const isAdmin = await this.checkIsAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin role required.');
    }

    const [
      { data: businesses, error: bError },
      { data: customers },
      { data: documents },
      { data: payments },
    ] = await Promise.all([
      supabase.from('businesses').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, business_id'),
      supabase.from('documents').select('id, business_id'),
      supabase.from('payments').select('amount, business_id, status').eq('status', 'completed'),
    ]);

    if (bError) {
      throw bError;
    }

    const custCountMap = new Map<string, number>();
    (customers || []).forEach((c) => {
      custCountMap.set(c.business_id, (custCountMap.get(c.business_id) || 0) + 1);
    });

    const docCountMap = new Map<string, number>();
    (documents || []).forEach((d) => {
      docCountMap.set(d.business_id, (docCountMap.get(d.business_id) || 0) + 1);
    });

    const revMap = new Map<string, number>();
    (payments || []).forEach((p) => {
      revMap.set(p.business_id, (revMap.get(p.business_id) || 0) + (Number(p.amount) || 0));
    });

    return (businesses || []).map((b) => ({
      id: b.id,
      name: b.name,
      ownerEmail: b.email || 'No email',
      currency: b.currency || 'NGN',
      createdAt: b.created_at,
      customerCount: custCountMap.get(b.id) || 0,
      documentCount: docCountMap.get(b.id) || 0,
      revenueTotal: revMap.get(b.id) || 0,
    }));
  }

  /**
   * Fetches administrative audit log entries.
   */
  async getAuditLogs(): Promise<AdminAuditLogRow[]> {
    const isAdmin = await this.checkIsAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin role required.');
    }

    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Audit logs table not found or empty:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      actorUserId: row.actor_user_id,
      actorEmail: row.actor_email,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }
}

export const adminService = new AdminService();
