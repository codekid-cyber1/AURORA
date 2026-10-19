import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './store-logic';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

let singletonClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith('https://') &&
      supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY'
  );
}

export function getSupabaseClient(): SupabaseClient {
  if (!singletonClient) {
    const url = isSupabaseConfigured()
      ? supabaseUrl
      : 'https://placeholder-project.supabase.co';
    const key = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key';

    singletonClient = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
  }
  return singletonClient;
}

export const supabase = getSupabaseClient();
