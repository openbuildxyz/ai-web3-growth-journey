/**
 * Pool snapshot provider (cached)
 *
 * Looks for snapshots via:
 * 1) POOL_SNAPSHOT_<POOL> env (JSON string)
 * 2) POOL_SNAPSHOT_URL env (JSON response)
 *
 * Expected JSON formats:
 * - { "pools": { "ETH-USDC": { ... } } }
 * - { "ETH-USDC": { ... } }
 */

type Snapshot = Record<string, unknown>;

interface CacheEntry {
  value: Snapshot | null;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 30_000;

function normalizePoolKey(pool?: string | null): string | null {
  if (!pool) return null;
  return pool.trim().toUpperCase();
}

function resolveEnvSnapshot(poolKey: string): Snapshot | null {
  const envKey = `POOL_SNAPSHOT_${poolKey.replace(/[^A-Z0-9]/g, '_')}`;
  const raw = process.env[envKey];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Snapshot;
  } catch {
    return null;
  }
  return null;
}

async function fetchRemoteSnapshot(poolKey: string): Promise<Snapshot | null> {
  const url = process.env.POOL_SNAPSHOT_URL;
  if (!url) return null;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as Record<string, any>;
  if (!data) return null;

  if (data.pools && typeof data.pools === 'object') {
    return data.pools[poolKey] || null;
  }

  return data[poolKey] || null;
}

export async function getPoolSnapshot(pool?: string | null): Promise<Snapshot | null> {
  const poolKey = normalizePoolKey(pool);
  if (!poolKey) return null;

  const existing = cache.get(poolKey);
  const now = Date.now();
  if (existing && existing.expiresAt > now) return existing.value;

  const fromEnv = resolveEnvSnapshot(poolKey);
  if (fromEnv) {
    cache.set(poolKey, { value: fromEnv, expiresAt: now + DEFAULT_TTL_MS });
    return fromEnv;
  }

  const fromRemote = await fetchRemoteSnapshot(poolKey);
  cache.set(poolKey, { value: fromRemote, expiresAt: now + DEFAULT_TTL_MS });
  return fromRemote;
}

