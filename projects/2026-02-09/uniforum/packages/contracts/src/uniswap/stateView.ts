/**
 * Uniswap v4 StateView – fetch pool state on-chain (getSlot0, getLiquidity).
 * @see https://docs.uniswap.org/contracts/v4/reference/periphery/lens/StateView
 * @see https://docs.uniswap.org/sdk/v4/guides/advanced/pool-data
 */

import { createPublicClient, http, type Address } from 'viem';
import { unichainSepolia, unichainMainnet } from '../chains';
import { getUniswapAddresses } from './client';
import { getPoolId, type PoolKeyForId } from './poolId';

const STATE_VIEW_ABI = [
  {
    inputs: [{ name: 'poolId', type: 'bytes32' }],
    name: 'getSlot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'protocolFee', type: 'uint24' },
      { name: 'lpFee', type: 'uint24' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'poolId', type: 'bytes32' }],
    name: 'getLiquidity',
    outputs: [{ name: 'liquidity', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface PoolState {
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
  protocolFee?: number;
  lpFee?: number;
}

const FEE_TIERS = [
  { fee: 100, tickSpacing: 1 },
  { fee: 500, tickSpacing: 10 },
  { fee: 3000, tickSpacing: 60 },
  { fee: 10000, tickSpacing: 200 },
] as const;

/**
 * Fetch pool state (slot0 + liquidity) from StateView. Returns null if pool is not initialized.
 */
export async function getPoolState(
  chainId: number,
  rpcUrl: string,
  poolId: `0x${string}`
): Promise<PoolState | null> {
  const addresses = getUniswapAddresses(chainId) as { stateView?: Address };
  const stateView = addresses.stateView;
  if (!stateView) return null;
  const chain = chainId === 130 ? unichainMainnet : unichainSepolia;
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  try {
    const [slot0, liquidity] = await Promise.all([
      client.readContract({
        address: stateView,
        abi: STATE_VIEW_ABI,
        functionName: 'getSlot0',
        args: [poolId],
      }),
      client.readContract({
        address: stateView,
        abi: STATE_VIEW_ABI,
        functionName: 'getLiquidity',
        args: [poolId],
      }),
    ]);
    const [sqrtPriceX96, tick, protocolFee, lpFee] = slot0;
    return {
      sqrtPriceX96,
      tick: Number(tick),
      liquidity,
      protocolFee: Number(protocolFee),
      lpFee: Number(lpFee),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch pool state by pool key (computes poolId then calls getPoolState).
 */
export async function getPoolStateByKey(
  chainId: number,
  rpcUrl: string,
  key: PoolKeyForId
): Promise<PoolState | null> {
  const poolId = getPoolId(key);
  return getPoolState(chainId, rpcUrl, poolId);
}

export interface DiscoveredPool {
  fee: number;
  tickSpacing: number;
  poolId: `0x${string}`;
  state: PoolState;
}

/**
 * Discover which fee tier exists for a pair by trying StateView.getSlot0 for each tier.
 * Returns { fee, tickSpacing, poolId, state } for the first initialized pool, or null.
 */
export async function discoverPoolFeeTier(
  chainId: number,
  rpcUrl: string,
  currency0: string,
  currency1: string,
  hooks?: string
): Promise<DiscoveredPool | null> {
  for (const { fee, tickSpacing } of FEE_TIERS) {
    const key: PoolKeyForId = {
      currency0,
      currency1,
      fee,
      tickSpacing,
      hooks,
    };
    const poolId = getPoolId(key);
    const state = await getPoolState(chainId, rpcUrl, poolId);
    if (state != null) {
      return { fee, tickSpacing, poolId, state };
    }
  }
  return null;
}

/**
 * Discover ALL initialized pools for a token pair across every standard fee tier.
 * Returns an array of { fee, tickSpacing, poolId, state } sorted by fee ascending.
 */
export async function discoverAllPools(
  chainId: number,
  rpcUrl: string,
  currency0: string,
  currency1: string,
  hooks?: string
): Promise<DiscoveredPool[]> {
  const results: DiscoveredPool[] = [];
  // Query all tiers in parallel for speed
  const promises = FEE_TIERS.map(async ({ fee, tickSpacing }) => {
    const key: PoolKeyForId = { currency0, currency1, fee, tickSpacing, hooks };
    const poolId = getPoolId(key);
    const state = await getPoolState(chainId, rpcUrl, poolId);
    if (state != null) {
      return { fee, tickSpacing, poolId, state };
    }
    return null;
  });
  const settled = await Promise.all(promises);
  for (const result of settled) {
    if (result) results.push(result);
  }
  return results;
}
