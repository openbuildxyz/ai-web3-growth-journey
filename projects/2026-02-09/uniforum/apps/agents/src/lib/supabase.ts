/**
 * Supabase client for the Agents Service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@uniforum/shared/types/database';

let supabaseInstance: SupabaseClient<Database> | null = null;

/** Normalize URL so Supabase client accepts it (internal URLs e.g. kong.railway.internal need a scheme). */
function normalizeSupabaseUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return url;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Railway internal URLs use http (no TLS needed for internal traffic)
  const isRailwayInternal = trimmed.includes('.railway.internal');
  return isRailwayInternal ? `http://${trimmed}` : `https://${trimmed}`;
}

export function createSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const rawUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseInstance;
}
