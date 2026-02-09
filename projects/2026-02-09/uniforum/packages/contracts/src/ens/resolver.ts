/**
 * ENS Offchain Resolver
 *
 * https://railway.com/dashboardHandles ENS resolution for Uniforum agent subdomains via CCIP-Read.
 */

import { ENS_CONFIG } from '@uniforum/shared';

export interface EnsRecord {
  name: string;
  address: string;
  records: Record<string, string>;
}

/**
 * Resolve an ENS name via the offchain gateway
 */
export async function resolveEnsName(name: string): Promise<EnsRecord | null> {
  try {
    const response = await fetch(`${ENS_CONFIG.GATEWAY_URL}/resolve/${name}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`ENS resolution failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ENS resolution error:', error);
    return null;
  }
}

/**
 * Get a specific text record for an ENS name
 */
export async function getEnsTextRecord(name: string, key: string): Promise<string | null> {
  try {
    const response = await fetch(`${ENS_CONFIG.GATEWAY_URL}/text/${name}/${key}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`ENS text record fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('ENS text record error:', error);
    return null;
  }
}

/**
 * Build the full ENS name for an agent
 */
export function buildAgentEnsName(subdomain: string): string {
  return `${subdomain.toLowerCase()}.${ENS_CONFIG.PARENT_DOMAIN}`;
}

/**
 * Extract subdomain from full ENS name
 */
export function extractSubdomain(fullName: string): string {
  return fullName.replace(`.${ENS_CONFIG.PARENT_DOMAIN}`, '');
}

/**
 * Validate that a subdomain is available (not yet registered)
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const fullName = buildAgentEnsName(subdomain);
  const resolved = await resolveEnsName(fullName);
  return resolved === null;
}

/**
 * Standard Uniforum ENS text record keys
 */
export const ENS_TEXT_KEYS = {
  VERSION: 'eth.uniforum.version',
  STRATEGY: 'eth.uniforum.strategy',
  RISK_TOLERANCE: 'eth.uniforum.riskTolerance',
  PREFERRED_POOLS: 'eth.uniforum.preferredPools',
  EXPERTISE: 'eth.uniforum.expertise',
  AGENT_WALLET: 'eth.uniforum.agentWallet',
  CREATED_AT: 'eth.uniforum.createdAt',
  RULES_OF_THUMB: 'eth.uniforum.rulesOfThumb',
  CONSTRAINTS: 'eth.uniforum.constraints',
  OBJECTIVE_WEIGHTS: 'eth.uniforum.objectiveWeights',
  DEBATE: 'eth.uniforum.debate',
  TEMPERATURE_DELTA: 'eth.uniforum.temperatureDelta',
  CHARACTER_PLUGINS: 'eth.uniforum.characterPlugins',
  UNISWAP_HISTORY: 'eth.uniforum.uniswapHistory',
} as const;

/**
 * Build ENS text records from agent configuration
 */
export function buildEnsTextRecords(config: {
  strategy: string;
  riskTolerance: number;
  preferredPools: string[];
  expertiseContext?: string;
  agentWallet: string;
  createdAt: Date;
  characterConfig?: {
    rulesOfThumb?: string[];
    constraints?: Record<string, unknown>;
    objectiveWeights?: Record<string, number>;
    debate?: Record<string, unknown>;
    temperatureDelta?: number;
  };
  characterPlugins?: string[];
  uniswapHistory?: unknown;
}): Record<string, string> {
  const records: Record<string, string> = {
    [ENS_TEXT_KEYS.VERSION]: '1.0',
    [ENS_TEXT_KEYS.STRATEGY]: config.strategy,
    [ENS_TEXT_KEYS.RISK_TOLERANCE]: config.riskTolerance.toString(),
    [ENS_TEXT_KEYS.PREFERRED_POOLS]: JSON.stringify(config.preferredPools),
    [ENS_TEXT_KEYS.EXPERTISE]: config.expertiseContext || '',
    [ENS_TEXT_KEYS.AGENT_WALLET]: config.agentWallet,
    [ENS_TEXT_KEYS.CREATED_AT]: Math.floor(config.createdAt.getTime() / 1000).toString(),
  };

  const safeJson = (value: unknown) => {
    try {
      return JSON.stringify(value);
    } catch {
      return undefined;
    }
  };

  if (config.characterConfig?.rulesOfThumb?.length) {
    const encoded = safeJson(config.characterConfig.rulesOfThumb);
    if (encoded) records[ENS_TEXT_KEYS.RULES_OF_THUMB] = encoded;
  }

  if (config.characterConfig?.constraints) {
    const encoded = safeJson(config.characterConfig.constraints);
    if (encoded && encoded !== '{}') records[ENS_TEXT_KEYS.CONSTRAINTS] = encoded;
  }

  if (config.characterConfig?.objectiveWeights) {
    const encoded = safeJson(config.characterConfig.objectiveWeights);
    if (encoded && encoded !== '{}') records[ENS_TEXT_KEYS.OBJECTIVE_WEIGHTS] = encoded;
  }

  if (config.characterConfig?.debate) {
    const encoded = safeJson(config.characterConfig.debate);
    if (encoded && encoded !== '{}') records[ENS_TEXT_KEYS.DEBATE] = encoded;
  }

  if (typeof config.characterConfig?.temperatureDelta === 'number') {
    records[ENS_TEXT_KEYS.TEMPERATURE_DELTA] = config.characterConfig.temperatureDelta.toString();
  }

  if (config.characterPlugins?.length) {
    const encoded = safeJson(config.characterPlugins);
    if (encoded) records[ENS_TEXT_KEYS.CHARACTER_PLUGINS] = encoded;
  }

  if (config.uniswapHistory != null) {
    const encoded = safeJson(config.uniswapHistory);
    if (encoded) records[ENS_TEXT_KEYS.UNISWAP_HISTORY] = encoded;
  }

  return records;
}
