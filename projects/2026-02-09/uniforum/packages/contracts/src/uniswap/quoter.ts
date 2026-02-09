/**
 * Uniswap v4 Quoter – get amountOut for exact-in swap (for amountOutMinimum).
 * Quoter reverts with QuoteSwap(uint256 amount); we decode the revert data.
 * @see https://docs.uniswap.org/contracts/v4/reference/periphery/interfaces/IV4Quoter
 * @see https://docs.uniswap.org/contracts/v4/reference/periphery/libraries/QuoterRevert
 */

import { createPublicClient, decodeErrorResult, encodeFunctionData, http, type Address } from 'viem';
import { getUniswapAddresses } from './client';
import { unichainSepolia, unichainMainnet } from '../chains';

const QUOTER_ABI = [
  {
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          {
            name: 'poolKey',
            type: 'tuple',
            components: [
              { name: 'currency0', type: 'address' },
              { name: 'currency1', type: 'address' },
              { name: 'fee', type: 'uint24' },
              { name: 'tickSpacing', type: 'int24' },
              { name: 'hooks', type: 'address' },
            ],
          },
          { name: 'zeroForOne', type: 'bool' },
          { name: 'exactAmount', type: 'uint128' },
          { name: 'hookData', type: 'bytes' },
        ],
      },
    ],
    name: 'quoteExactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'gasEstimate', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/** QuoteSwap(uint256 amount) – Quoter reverts with this to return the quote */
const QUOTE_SWAP_ERROR = {
  name: 'QuoteSwap',
  type: 'error',
  inputs: [{ name: 'amount', type: 'uint256' }],
} as const;

export interface QuotePoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks?: string;
}

/**
 * Get exact-in quote (amountOut) from V4 Quoter. Uses static call; Quoter reverts with QuoteSwap(amount).
 * Returns amountOut as decimal string, or null on failure.
 */
export async function getQuoteExactInputSingle(
  chainId: number,
  rpcUrl: string,
  poolKey: QuotePoolKey,
  zeroForOne: boolean,
  amountIn: string,
  hookData: `0x${string}` = '0x' as `0x${string}`
): Promise<string | null> {
  try {
    const addresses = getUniswapAddresses(chainId);
    const chain = chainId === 130 ? unichainMainnet : unichainSepolia;
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    const params = {
      poolKey: {
        currency0: poolKey.currency0 as Address,
        currency1: poolKey.currency1 as Address,
        fee: poolKey.fee,
        tickSpacing: poolKey.tickSpacing,
        hooks: (poolKey.hooks ?? '0x0000000000000000000000000000000000000000') as Address,
      },
      zeroForOne,
      exactAmount: BigInt(amountIn),
      hookData,
    };

    const data = encodeFunctionData({
      abi: QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [params],
    });

    // Quoter reverts with QuoteSwap(amount); use call and catch revert
    await publicClient.call({
      to: addresses.quoter,
      data,
      account: '0x0000000000000000000000000000000000000001' as Address,
    });
    return null; // no revert = unexpected
  } catch (err: unknown) {
    const e = err as { data?: `0x${string}`; cause?: { data?: `0x${string}` } };
    const revertData = e?.data ?? e?.cause?.data;
    if (!revertData || typeof revertData !== 'string') return null;
    try {
      const decoded = decodeErrorResult({
        abi: [QUOTE_SWAP_ERROR],
        data: revertData,
      });
      if (decoded.errorName === 'QuoteSwap' && decoded.args?.[0] != null) {
        return String(decoded.args[0]);
      }
    } catch {
      // not a QuoteSwap revert
    }
    return null;
  }
}
