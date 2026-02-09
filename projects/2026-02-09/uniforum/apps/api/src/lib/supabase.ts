import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/** Normalize URL so Supabase client accepts it (internal URLs e.g. kong.railway.internal need a scheme). */
function normalizeSupabaseUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return url;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Railway internal URLs use http (no TLS needed for internal traffic)
  const isRailwayInternal = trimmed.includes('.railway.internal');
  return isRailwayInternal ? `http://${trimmed}` : `https://${trimmed}`;
}

export function getSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const rawUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  console.log(`[api] Supabase client init → ${supabaseUrl}`);
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}
