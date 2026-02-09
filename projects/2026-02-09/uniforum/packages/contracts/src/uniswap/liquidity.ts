/**
 * Uniswap v4 Liquidity Operations
 *
 * Add and remove liquidity via Universal Router (V4_POSITION_MANAGER_CALL 0x14) per:
 * https://docs.uniswap.org/contracts/v4/quickstart/manage-liquidity/mint-position
 * https://docs.uniswap.org/contracts/v4/quickstart/manage-liquidity/decrease-liquidity
 */

import type { Hash } from 'viem';
import { unichainSepolia, unichainMainnet } from '../chains';
import { createUniswapClients, getUniswapAddresses } from './client';
import { buildAddLiquidityCalldata, buildAddLiquidityFromDeltasCalldata, buildDecreaseLiquidityUnlockData } from './v4PositionCalldata';
import type { LiquidityParams, ProposalHooks } from '@uniforum/shared';

const UNIVERSAL_ROUTER_ABI = [
  {
    inputs: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

function isConfiguredAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

/** Extended add liquidity params: execution payload may include v4 pool key */
export type AddLiquidityParamsWithV4 = LiquidityParams & {
  currency0?: string;
  currency1?: string;
  fee?: number;
  tickSpacing?: number;
  hooksAddress?: string;
  liquidity?: string;
  recipient?: string;
};

export interface LiquidityResult {
  success: boolean;
  txHash?: Hash;
  tokenId?: bigint;
  error?: string;
}

export interface AddLiquidityOptions {
  privateKey: `0x${string}`;
  params: LiquidityParams;
  hooks?: ProposalHooks;
  chainId?: number;
}

export interface RemoveLiquidityOptions {
  privateKey: `0x${string}`;
  tokenId: bigint;
  liquidityToRemove: bigint;
  hooks?: ProposalHooks;
  chainId?: number;
  /** Required for encoding: pool currencies and recipient */
  currency0?: string;
  currency1?: string;
  recipient?: string;
  amount0Min?: string;
  amount1Min?: string;
}

/**
 * Add liquidity (mint position) via Universal Router 0x14.
 * Params must include currency0, currency1, fee, tickSpacing, amount0, amount1, tickLower, tickUpper.
 * Optional: liquidity (default 0), hooksAddress, recipient (default executor).
 */
export async function addLiquidity(options: AddLiquidityOptions): Promise<LiquidityResult> {
  const { privateKey, params, hooks, chainId = 1301 } = options;
  const p = params as AddLiquidityParamsWithV4;

  try {
    const addresses = getUniswapAddresses(chainId);
    if (!isConfiguredAddress(addresses.universalRouter)) {
      return { success: false, error: 'Universal Router not configured for this chain' };
    }

    const chain = chainId === 130 ? unichainMainnet : unichainSepolia;
    const { publicClient, walletClient, account } = createUniswapClients(privateKey, chain);
    const recipient = p.recipient ?? account?.address ?? '0x0000000000000000000000000000000000000000';
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);

    const hasPoolKey =
      p.currency0 &&
      p.currency1 &&
      typeof p.fee === 'number' &&
      typeof p.tickSpacing === 'number' &&
      p.amount0 != null &&
      p.amount1 != null &&
      typeof p.tickLower === 'number' &&
      typeof p.tickUpper === 'number';

    if (!hasPoolKey) {
      return {
        success: false,
        error:
          'Add liquidity requires currency0, currency1, fee, tickSpacing, amount0, amount1, tickLower, tickUpper in params',
      };
    }

    const hookData = hooks?.dynamicFee?.enabled || hooks?.overrideFee?.enabled
      ? '0x'
      : '0x';
    const liquidityValue = p.liquidity ?? '0';
    const useFromDeltas = liquidityValue === '0' || liquidityValue === '';
    const mintBaseParams = {
      poolKey: {
        currency0: p.currency0!,
        currency1: p.currency1!,
        fee: p.fee!,
        tickSpacing: p.tickSpacing!,
        hooks: p.hooksAddress,
      },
      tickLower: p.tickLower!,
      tickUpper: p.tickUpper!,
      amount0Max: p.amount0!,
      amount1Max: p.amount1!,
      recipient,
      hookData,
      useNativeEth: p.currency0 === '0x0000000000000000000000000000000000000000',
    };

    // Use MINT_POSITION_FROM_DELTAS (0x05) when no liquidity specified — auto-calculates from amounts
    const { commands, inputs } = useFromDeltas
      ? buildAddLiquidityFromDeltasCalldata(mintBaseParams, deadline)
      : buildAddLiquidityCalldata({ ...mintBaseParams, liquidity: liquidityValue }, deadline);

    const value = p.currency0 === '0x0000000000000000000000000000000000000000' ? BigInt(p.amount0!) : 0n;
    const { request } = await publicClient.simulateContract({
      address: addresses.universalRouter as `0x${string}`,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args: [commands, inputs, deadline],
      account: account!,
      value,
    });
    const txHash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    return {
      success: receipt.status === 'success',
      txHash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

const POSITION_MANAGER_ABI = [
  {
    inputs: [
      { name: 'unlockData', type: 'bytes' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'modifyLiquidities',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

/**
 * Remove liquidity (decrease + take pair) via PositionManager.modifyLiquidities() directly.
 *
 * DECREASE_LIQUIDITY cannot go through the Universal Router's V4_POSITION_MANAGER_CALL (0x14)
 * because the router's _checkV4PositionManagerCall() only allows MINT_POSITION actions.
 */
export async function removeLiquidity(options: RemoveLiquidityOptions): Promise<LiquidityResult> {
  const { privateKey, tokenId, liquidityToRemove, hooks, chainId = 1301, currency0, currency1, recipient: optRecipient, amount0Min, amount1Min } = options;

  try {
    const addresses = getUniswapAddresses(chainId);
    if (!isConfiguredAddress(addresses.positionManager)) {
      return { success: false, error: 'Position Manager not configured for this chain' };
    }

    const chain = chainId === 130 ? unichainMainnet : unichainSepolia;
    const { publicClient, walletClient, account } = createUniswapClients(privateKey, chain);
    const recipient = optRecipient ?? account?.address ?? '0x0000000000000000000000000000000000000000';
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);

    if (!currency0 || !currency1) {
      return {
        success: false,
        error: 'Remove liquidity requires currency0, currency1 (and optionally recipient) in options',
      };
    }

    const unlockData = buildDecreaseLiquidityUnlockData({
      tokenId: tokenId.toString(),
      liquidity: liquidityToRemove.toString(),
      amount0Min: amount0Min ?? '0',
      amount1Min: amount1Min ?? '0',
      currency0,
      currency1,
      recipient,
      hookData: '0x',
    });

    const { request } = await publicClient.simulateContract({
      address: addresses.positionManager as `0x${string}`,
      abi: POSITION_MANAGER_ABI,
      functionName: 'modifyLiquidities',
      args: [unlockData, deadline],
      account: account!,
    });
    const txHash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    return {
      success: receipt.status === 'success',
      txHash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get position details by token ID
 */
export async function getPosition(tokenId: bigint, chainId: number = 1301) {
  // TODO: Implement position lookup via Position Manager getPoolAndPositionInfo
  return {
    tokenId,
    liquidity: 0n,
    tickLower: 0,
    tickUpper: 0,
    token0: '',
    token1: '',
    fee: 0,
  };
}
