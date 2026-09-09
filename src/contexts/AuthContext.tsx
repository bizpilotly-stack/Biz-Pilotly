import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

import { subscriptionService } from '../services/subscriptionService';
import { PlanTier } from '../config/pricing';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Authoritative Server-Side User Validation
    const validateServerUser = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        const { data: { user: serverUser }, error } = await supabase.auth.getUser();
        if (error || !serverUser) {
          // User was deleted from Supabase backend -> Purge session and log out
          await supabase.auth.signOut().catch(() => {});
          try {
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith('sb-') || key.startsWith('bizpilotly_')) {
                localStorage.removeItem(key);
              }
            });
            sessionStorage.clear();
          } catch {}
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(serverUser);
        setLoading(false);

        // Process pending plan for OAuth login / return
        const pendingPlan = localStorage.getItem('bizpilotly_selected_plan_id') as PlanTier | null;
        if (pendingPlan && (pendingPlan === 'free' || pendingPlan === 'pro' || pendingPlan === 'business')) {
          subscriptionService.initializePlanForUser(
            {
              id: serverUser.id,
              email: serverUser.email,
              name: serverUser.user_metadata?.full_name || serverUser.user_metadata?.name,
            },
            pendingPlan
          ).catch(console.warn);
          localStorage.removeItem('bizpilotly_selected_plan_id');
        }
      } catch {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    };

    validateServerUser();

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_OUT' || !currentSession) {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      const { data: { user: serverUser }, error } = await supabase.auth.getUser();
      if (error || !serverUser) {
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(serverUser);
      setLoading(false);

      const pendingPlan = localStorage.getItem('bizpilotly_selected_plan_id') as PlanTier | null;
      if (pendingPlan && (pendingPlan === 'free' || pendingPlan === 'pro' || pendingPlan === 'business')) {
        subscriptionService.initializePlanForUser(
          {
            id: serverUser.id,
            email: serverUser.email,
            name: serverUser.user_metadata?.full_name || serverUser.user_metadata?.name,
          },
          pendingPlan
        ).catch(console.warn);
        localStorage.removeItem('bizpilotly_selected_plan_id');
      }
    });

    // 3. Re-verify user existence on window focus / tab switch
    const handleWindowFocus = () => {
      validateServerUser();
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
        },
      },
    });

    return { user: data.user, session: data.session, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, session: data.session, error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    }
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.startsWith('bizpilotly_')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch {}
    setUser(null);
    setSession(null);
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
