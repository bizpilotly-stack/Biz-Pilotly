import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[BizPilotly Auth Warning]: Missing or placeholder Supabase credentials in .env. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set and restart the Vite dev server.'
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://ifcflqbsfmiypwhpfmbp.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmY2ZscWJzZm1peXB3aHBmbWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MTEzMDcsImV4cCI6MjEwMzE4NzMwN30.uvi7tf3F7qJ0_VcrZPqQ41zk033ZiW1fknzSUXb0T6A',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
