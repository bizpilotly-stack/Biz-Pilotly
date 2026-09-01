import { supabase } from './supabase';

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  userId?: string;
  businessName?: string;
  plan?: string;
  source?: string;
  createdAt: string;
}

const LOCAL_STORAGE_WAITLIST_KEY = 'bizpilotly_pro_waitlist_cache';

class WaitlistService {
  /**
   * Submits a user to the Pro early access waitlist.
   */
  async joinWaitlist(params: {
    email: string;
    name?: string;
    userId?: string;
    businessName?: string;
    plan?: string;
    source?: string;
  }): Promise<{ success: boolean; message: string }> {
    const entry: WaitlistEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `wl_${Date.now()}`,
      email: params.email.trim().toLowerCase(),
      name: params.name || 'Interested User',
      userId: params.userId,
      businessName: params.businessName,
      plan: params.plan || 'Pro',
      source: params.source || 'app_dashboard',
      createdAt: new Date().toISOString(),
    };

    // Save locally
    try {
      const existing = this.getLocalWaitlist();
      if (!existing.some((e) => e.email === entry.email)) {
        existing.unshift(entry);
        localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(existing));
      }
    } catch {
      // ignore local storage errors
    }

    // Try Supabase insert
    try {
      const { error } = await (supabase as any).from('pro_waitlist').insert({
        email: entry.email,
        name: entry.name,
        user_id: entry.userId,
        business_name: entry.businessName,
        plan: entry.plan,
        source: entry.source,
      });

      if (error) {
        console.warn('Waitlist Supabase fallback to local storage:', error.message);
      }
    } catch (err) {
      console.warn('Waitlist database insert fallback:', err);
    }

    return {
      success: true,
      message: 'You have been added to the Pro Early Access Waitlist!',
    };
  }

  /**
   * Fetches all waitlist entries for admin dashboard.
   */
  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('pro_waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          userId: d.user_id,
          businessName: d.business_name,
          plan: d.plan || 'Pro',
          source: d.source || 'web',
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Error querying pro_waitlist table, using local cache:', err);
    }

    return this.getLocalWaitlist();
  }

  private getLocalWaitlist(): WaitlistEntry[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_WAITLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const waitlistService = new WaitlistService();
