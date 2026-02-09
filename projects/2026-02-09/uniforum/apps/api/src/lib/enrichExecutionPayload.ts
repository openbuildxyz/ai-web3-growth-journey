/**
 * Enrich execution payload params so the agent gets execution-ready data.
 *
 * Integrations (optional env):
 * - TOKEN_LIST_URL or TOKEN_LIST_URL_<chainId>: JSON token list (Uniswap format: { tokens: [{ address, symbol, chainId }] }) → token addresses
 * - GRAPH_API_KEY or UNISWAP_V4_SUBGRAPH_URL: Uniswap v4 subgraph → pool fee/tickSpacing by token pair
 * - UNICHAIN_SEPOLIA_RPC_URL (or chain-specific RPC): Quoter contract call → amountOutMinimum for swap
 */

import { getQuoteExactInputSingle } from '@uniforum/contracts';

/** Uniswap v4 subgraph id (Unichain) – official from https://docs.uniswap.org/api/subgraph/overview */
const UNISWAP_V4_SUBGRAPH_ID_UNICHAIN = 'EoCvJ5tyMLMJcTnLQwWpjAtPdn74PcrZgzfcT5bYxNBH';

/** Default token list: Uniswap Labs default (includes chainId + bridgeInfo for Unichain 130, etc.) */
const DEFAULT_TOKEN_LIST_URL =
  'https://unpkg.com/@uniswap/default-token-list@latest/build/uniswap-default.tokenlist.json';

/** Token list cache: chainId -> { symbol -> address } */
let tokenListCache: Record<number, Record<string, string>> = {};

/** Fallback when no token list URL is set. From Unichain docs (contract-addresses). */
const TOKENS_BY_CHAIN: Record<number, Record<string, string>> = {
  1301: {
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
  },
  130: {
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x078d782b760474a361dda0af3839290b0ef57ad6',
  },
};

/** Fallback when no subgraph: pair key -> fee, tickSpacing (from on-chain discovery) */
const POOLS_BY_CHAIN: Record<number, Record<string, { fee: number; tickSpacing: number }>> = {
  1301: { 'ETH-USDC': { fee: 100, tickSpacing: 1 }, 'WETH-USDC': { fee: 100, tickSpacing: 1 } },
  130: { 'ETH-USDC': { fee: 500, tickSpacing: 10 }, 'WETH-USDC': { fee: 500, tickSpacing: 10 } },
};

/** Common fee -> tickSpacing (v4) when subgraph only returns feeTier */
const FEE_TO_TICK_SPACING: Record<number, number> = {
  100: 1,
  500: 10,
  3000: 60,
  10000: 200,
};

function normalizeSymbol(s: string): string {
  return (s || '').toUpperCase().trim();
}

type TokenEntry = {
  address: string;
  symbol: string;
  chainId?: number;
  extensions?: { bridgeInfo?: Record<string, { tokenAddress?: string }> };
};

/**
 * Load token list from URL. Uses Uniswap default list when no env URL is set.
 * Format: { tokens: [ { address, symbol, chainId?, extensions?.bridgeInfo?.[chainId].tokenAddress } ] }.
 * For Unichain (130/1301), many tokens in the default list use extensions.bridgeInfo["130"].
 */
async function getTokenListForChain(
  chainId: number,
  options?: { tokenListUrl?: string; tokenListUrlByChain?: Record<number, string> }
): Promise<Record<string, string>> {
  if (tokenListCache[chainId]) return tokenListCache[chainId];
  const url =
    options?.tokenListUrlByChain?.[chainId] ?? options?.tokenListUrl ?? DEFAULT_TOKEN_LIST_URL;
  try {
    const res = await fetch(url);
    const json = (await res.json()) as { tokens?: TokenEntry[] };
    const tokens = json.tokens ?? [];
    const bySymbol: Record<string, string> = {};
    const chainKey = String(chainId);
    for (const t of tokens) {
      const sym = normalizeSymbol(t.symbol);
      if (!sym) continue;
      const addr =
        Number(t.chainId) === chainId
          ? t.address
          : t.extensions?.bridgeInfo?.[chainKey]?.tokenAddress;
      if (addr) bySymbol[sym] = addr;
    }
    if (!bySymbol['ETH'] && bySymbol['WETH']) bySymbol['ETH'] = bySymbol['WETH'];
    // Only use fetched list if it actually has meaningful entries (> 1 token)
    const hasMeaningfulEntries =
      Object.keys(bySymbol).length > 1 ||
      (Object.keys(bySymbol).length === 1 && Object.values(bySymbol)[0] !== '');
    tokenListCache[chainId] =
      hasMeaningfulEntries ? bySymbol : (TOKENS_BY_CHAIN[chainId] ?? {});
    return tokenListCache[chainId];
  } catch {
    tokenListCache[chainId] = TOKENS_BY_CHAIN[chainId] ?? {};
    return tokenListCache[chainId];
  }
}

function resolveTokenFromMap(tokens: Record<string, string>, symbol: string): string | null {
  const n = normalizeSymbol(symbol);
  // Uniswap v4 uses native ETH (0x000...000) as currency0 in pool keys, not WETH.
  // Only fall back to WETH if the map doesn't have a native ETH entry.
  if (n === 'ETH') return tokens['ETH'] ?? tokens['WETH'] ?? null;
  return tokens[n] ?? null;
}

/**
 * Fetch pool (fee, tickSpacing) from Uniswap v4 subgraph by token pair.
 * Env: GRAPH_API_KEY (then URL = https://gateway.thegraph.com/api/<key>/subgraphs/id/<id>) or UNISWAP_V4_SUBGRAPH_URL.
 */
async function getPoolFromSubgraph(
  chainId: number,
  currency0: string,
  currency1: string,
  options?: { graphApiKey?: string; subgraphUrl?: string }
): Promise<{ fee: number; tickSpacing: number } | null> {
  const key = options?.graphApiKey;
  const baseUrl = options?.subgraphUrl;
  const url = baseUrl
    ? baseUrl
    : key
      ? `https://gateway.thegraph.com/api/${key}/subgraphs/id/${UNISWAP_V4_SUBGRAPH_ID_UNICHAIN}`
      : null;
  if (!url) return null;
  const id0 = currency0.toLowerCase();
  const id1 = currency1.toLowerCase();
  const query = `
    query($id0: String!, $id1: String!) {
      pools(first: 1, where: { token0: $id0, token1: $id1 }) {
        id
        feeTier
      }
    }
  `;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id0, id1 } }),
    });
    const json = (await res.json()) as { data?: { pools?: Array<{ feeTier?: number }> } };
    const pools = json.data?.pools ?? [];
    const pool = pools[0];
    if (!pool?.feeTier) return null;
    const fee = Number(pool.feeTier);
    const tickSpacing = FEE_TO_TICK_SPACING[fee] ?? 10;
    return { fee, tickSpacing };
  } catch {
    return null;
  }
}

function getPoolConfigFallback(
  chainId: number,
  tokenIn: string,
  tokenOut: string
): { fee: number; tickSpacing: number } | null {
  const pools = POOLS_BY_CHAIN[chainId];
  if (!pools) return null;
  const pairKey = [normalizeSymbol(tokenIn), normalizeSymbol(tokenOut)].sort().join('-');
  return pools[pairKey] ?? null;
}

export interface EnrichOptions {
  rpcUrl?: string;
  tokenListUrl?: string;
  tokenListUrlByChain?: Record<number, string>;
  graphApiKey?: string;
  subgraphUrl?: string;
}

/**
 * Enrich swap params: token list (1), subgraph/fallback pool (2), Quoter for amountOutMinimum (3).
 *
 * If the agent specifies `fee` (and optionally `tickSpacing`) in proposal params,
 * those values are used directly — allowing agents to deliberately choose a fee tier.
 * Otherwise, the enrichment auto-discovers the pool via subgraph or fallback config.
 */
export async function enrichSwapParams(
  params: Record<string, unknown>,
  chainId: number,
  _forumGoal?: string,
  options?: EnrichOptions
): Promise<Record<string, unknown>> {
  const tokenIn = typeof params.tokenIn === 'string' ? params.tokenIn : '';
  const tokenOut = typeof params.tokenOut === 'string' ? params.tokenOut : '';
  const amount = typeof params.amount === 'string' ? params.amount : '0';
  const slippage = typeof params.slippage === 'number' ? params.slippage : 50;

  const tokens = await getTokenListForChain(chainId, options);
  const addr0 = resolveTokenFromMap(tokens, tokenIn);
  const addr1 = resolveTokenFromMap(tokens, tokenOut);
  if (!addr0 || !addr1) return params;

  const [currency0, currency1] = BigInt(addr0) <= BigInt(addr1) ? [addr0, addr1] : [addr1, addr0];
  const zeroForOne = BigInt(addr0) <= BigInt(addr1);

  // If the agent explicitly specified a fee tier, honour it.
  // FEE_TO_TICK_SPACING provides the canonical mapping.
  const agentFee = typeof params.fee === 'number' ? params.fee : undefined;
  const agentTickSpacing = typeof params.tickSpacing === 'number' ? params.tickSpacing : undefined;

  let pool: { fee: number; tickSpacing: number } | null = null;
  if (agentFee !== undefined) {
    const ts = agentTickSpacing ?? FEE_TO_TICK_SPACING[agentFee] ?? 10;
    pool = { fee: agentFee, tickSpacing: ts };
  } else {
    pool = await getPoolFromSubgraph(chainId, currency0, currency1, options);
    if (!pool) pool = getPoolConfigFallback(chainId, tokenIn, tokenOut);
  }
  if (!pool) return { ...params, currency0, currency1, zeroForOne };

  let amountOutMinimum = '0';
  const rpcUrl = options?.rpcUrl;
  if (rpcUrl && amount !== '0') {
    const quote = await getQuoteExactInputSingle(
      chainId,
      rpcUrl,
      { currency0, currency1, fee: pool.fee, tickSpacing: pool.tickSpacing },
      zeroForOne,
      amount
    );
    if (quote) {
      const min = (BigInt(quote) * BigInt(10000 - slippage)) / 10000n;
      amountOutMinimum = String(min);
    }
  }

  return {
    ...params,
    currency0,
    currency1,
    fee: pool.fee,
    tickSpacing: pool.tickSpacing,
    amountOutMinimum,
    zeroForOne,
  };
}

/**
 * Enrich limit-order params. A limit order uses the same pool key as a swap
 * (same currency pair, fee, tickSpacing) so we reuse enrichSwapParams and
 * preserve the limit-order-specific fields (targetTick, zeroForOne).
 */
export async function enrichLimitOrderParams(
  params: Record<string, unknown>,
  chainId: number,
  forumGoal?: string,
  options?: EnrichOptions
): Promise<Record<string, unknown>> {
  // Enrich pool key + quote exactly like a swap
  const enriched = await enrichSwapParams(params, chainId, forumGoal, options);
  // Preserve limit-order-specific fields from the original params
  if (params.targetTick !== undefined) enriched.targetTick = params.targetTick;
  if (params.zeroForOne !== undefined) enriched.zeroForOne = params.zeroForOne;
  return enriched;
}

/** Enrich execution payload params by action (async when swap/limitOrder + quoter/subgraph). */
export async function enrichExecutionPayloadParams(
  action: string,
  params: Record<string, unknown>,
  chainId: number,
  forumGoal?: string,
  options?: EnrichOptions
): Promise<Record<string, unknown>> {
  if (action === 'swap') {
    return enrichSwapParams(params, chainId, forumGoal, options);
  }
  if (action === 'limitOrder') {
    return enrichLimitOrderParams(params, chainId, forumGoal, options);
  }
  return params;
}
