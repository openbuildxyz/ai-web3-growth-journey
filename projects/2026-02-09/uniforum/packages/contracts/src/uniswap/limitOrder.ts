/**
 * Uniswap v4 Limit Order Operations
 *
 * Executes limit orders as a swap with hook data (pool with LimitOrderHook).
 * See: https://docs.uniswap.org/contracts/v4/ (hooks, limit order)
 */

import type { Hash } from 'viem';
import { encodeAbiParameters } from 'viem';
import type { LimitOrderParams } from '@uniforum/shared';
import type { ProposalHooks } from '@uniforum/shared';
import { executeSwap } from './swap';

export interface ExecuteLimitOrderOptions {
  privateKey: `0x${string}`;
  params: LimitOrderParams;
  hooks?: ProposalHooks;
  chainId?: number;
}

export interface LimitOrderResult {
  success: boolean;
  txHash?: Hash;
  error?: string;
}

/**
 * Encode hook data for a limit order (targetTick, zeroForOne).
 * Format may depend on the pool's LimitOrderHook; this is a common encoding.
 */
function encodeLimitOrderHookData(targetTick: number, zeroForOne: boolean): `0x${string}` {
  return encodeAbiParameters(
    [{ name: 'targetTick', type: 'int24' }, { name: 'zeroForOne', type: 'bool' }],
    [targetTick, zeroForOne]
  ) as `0x${string}`;
}

/**
 * Execute a limit order by running a swap with limit-order hook data.
 * Params (and optional hooks) supply tokenIn, tokenOut, amount, targetTick, zeroForOne.
 * When the execution payload includes v4 pool key (currency0, currency1, fee, tickSpacing, amountOutMinimum)
 * and optionally hooksAddress (pool with LimitOrderHook), the swap is submitted with hookData
 * so the hook can enforce the limit (fill when price reaches targetTick).
 */
export async function executeLimitOrder(
  options: ExecuteLimitOrderOptions
): Promise<LimitOrderResult> {
  const { privateKey, params, hooks, chainId = 1301 } = options;

  const targetTick = params.targetTick ?? hooks?.limitOrder?.targetTick ?? 0;
  const zeroForOne = params.zeroForOne ?? hooks?.limitOrder?.zeroForOne ?? true;
  const hookData = encodeLimitOrderHookData(targetTick, zeroForOne);

  const swapParams = {
    ...params,
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    amount: params.amount,
    deadline: (params as { deadline?: number }).deadline,
    amountOutMinimum: (params as { amountOutMinimum?: string }).amountOutMinimum ?? '0',
    zeroForOne,
    currency0: (params as { currency0?: string }).currency0,
    currency1: (params as { currency1?: string }).currency1,
    fee: (params as { fee?: number }).fee,
    tickSpacing: (params as { tickSpacing?: number }).tickSpacing,
    hooksAddress: (params as { hooksAddress?: string }).hooksAddress ?? (hooks?.limitOrder ? (params as { hooksAddress?: string }).hooksAddress : undefined),
    hookData,
  };

  const result = await executeSwap({
    privateKey,
    params: swapParams,
    hooks: hooks ? { ...hooks, limitOrder: { enabled: true, targetTick, zeroForOne } } : { limitOrder: { enabled: true, targetTick, zeroForOne } },
    chainId,
  });

  if (result.error?.includes('requires v4 pool key')) {
    return {
      success: false,
      error:
        'Limit order requires currency0, currency1, fee, tickSpacing, amountOutMinimum (and pool with LimitOrderHook) in params',
    };
  }

  return {
    success: result.success,
    txHash: result.txHash,
    error: result.error,
  };
}
