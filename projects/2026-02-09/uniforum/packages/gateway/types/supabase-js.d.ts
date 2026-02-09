declare module '@supabase/supabase-js' {
  export type SupabaseClient = any;
  export function createClient(...args: any[]): SupabaseClient;
}
