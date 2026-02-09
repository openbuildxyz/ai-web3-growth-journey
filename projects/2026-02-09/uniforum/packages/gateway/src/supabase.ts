import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './server';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const EMPTY_CONTENT_HASH = '0x';
const ETH_COIN_TYPE = 60;

type AgentRecord = {
  ens_name: string;
  owner_address: string;
  strategy: string;
  risk_tolerance: number;
  preferred_pools: string[] | null;
  expertise_context?: string | null;
  created_at: string;
  current_forum_id?: string | null;
  agent_wallets?: { wallet_address: string }[] | null;
};

interface SupabaseDatabaseOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
  parentDomain?: string;
  ttl: number;
  appUrl?: string;
}

export class SupabaseDatabase implements Database {
  private supabase: SupabaseClient;
  private ttl: number;
  private parentDomain: string;
  private appUrl?: string;
  private cache = new Map<
    string,
    { agent: AgentRecord | null; expiresAt: number }
  >();

  constructor(options: SupabaseDatabaseOptions) {
    this.supabase = createClient(options.supabaseUrl, options.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.ttl = options.ttl;
    this.parentDomain = options.parentDomain || 'uniforum.eth';
    this.appUrl = options.appUrl;
  }

  async addr(name: string, coinType: number) {
    if (coinType !== ETH_COIN_TYPE) {
      return { addr: ZERO_ADDRESS, ttl: this.ttl };
    }

    const agent = await this.loadAgent(name);
    const wallet = agent?.agent_wallets?.[0]?.wallet_address;
    return { addr: wallet || ZERO_ADDRESS, ttl: this.ttl };
  }

  async text(name: string, key: string) {
    const agent = await this.loadAgent(name);
    if (!agent) {
      return { value: '', ttl: this.ttl };
    }

    const wallet = agent.agent_wallets?.[0]?.wallet_address || '';
    const pools = agent.preferred_pools ?? [];
    const createdAt = Math.floor(
      new Date(agent.created_at).getTime() / 1000
    ).toString();
    const fullName = `${agent.ens_name}.${this.parentDomain}`;

    const records: Record<string, string> = {
      'eth.uniforum.version': '1.0',
      'eth.uniforum.strategy': agent.strategy,
      'eth.uniforum.riskTolerance': agent.risk_tolerance.toString(),
      'eth.uniforum.preferredPools': JSON.stringify(pools),
      'eth.uniforum.expertise': agent.expertise_context || '',
      'eth.uniforum.agentWallet': wallet,
      'eth.uniforum.createdAt': createdAt,
      'eth.uniforum.owner': agent.owner_address,
    };

    if (agent.current_forum_id) {
      records['eth.uniforum.currentForum'] = agent.current_forum_id;
    }

    if (this.appUrl) {
      records.url = `${this.appUrl.replace(/\/$/, '')}/agents/${fullName}`;
    }

    if (key in records) {
      return { value: records[key] ?? '', ttl: this.ttl };
    }

    return { value: '', ttl: this.ttl };
  }

  async contenthash(_name: string) {
    return { contenthash: EMPTY_CONTENT_HASH, ttl: this.ttl };
  }

  private normalizeName(name: string) {
    const normalized = name.trim().toLowerCase();
    const suffix = `.${this.parentDomain}`;
    if (!normalized.endsWith(suffix)) {
      return null;
    }
    const subdomain = normalized.slice(0, -suffix.length);
    if (!subdomain) return null;
    return { subdomain, fullName: normalized };
  }

  private async loadAgent(name: string): Promise<AgentRecord | null> {
    const normalized = this.normalizeName(name);
    if (!normalized) return null;

    const cacheKey = normalized.fullName;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.agent;
    }

    const { data, error } = await this.supabase
      .from('agents')
      .select(
        'ens_name, owner_address, strategy, risk_tolerance, preferred_pools, expertise_context, created_at, current_forum_id, agent_wallets (wallet_address)'
      )
      .eq('ens_name', normalized.subdomain)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      this.cache.set(cacheKey, {
        agent: null,
        expiresAt: now + this.ttl * 1000,
      });
      return null;
    }

    const agent = data as AgentRecord;
    this.cache.set(cacheKey, { agent, expiresAt: now + this.ttl * 1000 });
    return agent;
  }
}
