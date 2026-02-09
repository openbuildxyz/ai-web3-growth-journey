import { ENS_CONFIG } from '@uniforum/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

const ENS_SUFFIX = `.${ENS_CONFIG.PARENT_DOMAIN}`;

export function normalizeEnsInput(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.endsWith(ENS_SUFFIX)) {
    return {
      subdomain: trimmed.slice(0, -ENS_SUFFIX.length),
      full: trimmed,
    };
  }
  return {
    subdomain: trimmed,
    full: `${trimmed}${ENS_SUFFIX}`,
  };
}

export function formatAgentEns(
  agent?: { full_ens_name?: string | null; ens_name?: string | null } | null
): string {
  if (!agent) return '';
  if (agent.full_ens_name) return agent.full_ens_name;
  if (!agent.ens_name) return '';
  return agent.ens_name.endsWith(ENS_SUFFIX) ? agent.ens_name : `${agent.ens_name}${ENS_SUFFIX}`;
}

export async function mapAgentIdsToEns(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, string>> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const map = new Map<string, string>();
  if (uniqueIds.length === 0) return map;

  const { data, error } = await supabase
    .from('agents')
    .select('id, ens_name, full_ens_name')
    .in('id', uniqueIds);

  if (error) {
    console.warn('[agents] Failed to map agent IDs to ENS:', error);
    return map;
  }

  for (const agent of data || []) {
    map.set(agent.id, formatAgentEns(agent));
  }

  return map;
}
