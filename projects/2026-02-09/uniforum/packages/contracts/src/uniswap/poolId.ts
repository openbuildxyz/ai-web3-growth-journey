/**
 * Uniswap v4 PoolId computation.
 * PoolId = keccak256(abi.encode(PoolKey)) per https://docs.uniswap.org/contracts/v4/reference/core/types/PoolId
 */

import { encodeAbiParameters, keccak256, type Address } from 'viem';

export interface PoolKeyForId {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks?: string;
}

const EMPTY_HOOKS = '0x0000000000000000000000000000000000000000' as const;

/**
 * Compute PoolId from pool key (currency0 < currency1, fee, tickSpacing, hooks).
 * Matches on-chain PoolId.toId(PoolKey).
 */
export function getPoolId(key: PoolKeyForId): `0x${string}` {
  const hooks = (key.hooks ?? EMPTY_HOOKS) as Address;
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'currency0', type: 'address' },
        { name: 'currency1', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'tickSpacing', type: 'int24' },
        { name: 'hooks', type: 'address' },
      ],
      [key.currency0 as Address, key.currency1 as Address, key.fee, key.tickSpacing, hooks]
    )
  );
}
