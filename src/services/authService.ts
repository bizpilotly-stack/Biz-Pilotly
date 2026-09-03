import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  businessName?: string;
}

class AuthService {
  async getSession(): Promise<Session | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  }

  async getUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  }

  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async signup(name: string, email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name,
        },
      },
    });
  }

  async loginWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
  }

  async logout() {
    return supabase.auth.signOut();
  }

  async deleteAccount(): Promise<void> {
    const user = await this.getUser();
    if (!user) throw new Error('No authenticated user found');

    try {
      // 1. Delete user business data
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (business) {
        await supabase.from('document_items').delete().filter('document_id', 'in', `(select id from documents where business_id='${business.id}')`);
        await supabase.from('documents').delete().eq('business_id', business.id);
        await supabase.from('payments').delete().eq('business_id', business.id);
        await supabase.from('expenses').delete().eq('business_id', business.id);
        await supabase.from('customers').delete().eq('business_id', business.id);
        await supabase.from('businesses').delete().eq('id', business.id);
      }

      await supabase.from('profiles').delete().eq('id', user.id);
    } catch (err) {
      console.warn('Account data cascade cleanup notice:', err);
    }

    // Clear user local storage cache
    const prefix = 'bizpilotly_';
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(prefix) || key.includes(user.id))) {
        localStorage.removeItem(key);
      }
    }

    // Sign out
    await supabase.auth.signOut();
  }
}

export const authService = new AuthService();
