import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Singleton Supabase client with lazy initialization
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    console.log('Initializing Supabase client...');
    client = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      }
    );
    console.log('Supabase client initialized');
  }
  return client;
}
