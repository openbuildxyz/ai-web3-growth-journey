/**
 * Uniswap v4 Swap Operations
 *
 * Execute swaps via Universal Router on Unichain per official docs:
 * - Single-hop: https://docs.uniswap.org/sdk/v4/guides/swaps/single-hop-swapping
 * - Technical ref: https://docs.uniswap.org/contracts/universal-router/technical-reference (V4_SWAP = 0x10)
 */

import type { Hash } from 'viem';
import { parseUnits } from 'viem';
import { unichainSepolia, unichainMainnet } from '../chains';
import { createUniswapClients, getUniswapAddresses } from './client';
import { buildV4SingleHopSwapCalldata } from './v4SwapCalldata';
import type { SwapParams, ProposalHooks } from '@uniforum/shared';

/** Convert a human-readable amount (e.g. "1.2") to wei string for the given decimals */
function toWei(amount: string, decimals: number = 18): string {
  try {
    return parseUnits(amount, decimals).toString();
  } catch {
    return amount; // already in wei or unparseable — pass through
  }
}

/** True if address is configured (42-char hex), not a placeholder like 0x... */
function isConfiguredAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

// Universal Router ABI (execute with deadline per technical reference)
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

/** Extended swap params: execution payload may include v4 pool key + amountOutMinimum + hookData for SDK encoding */
export type SwapParamsWithV4 = SwapParams & {
  currency0?: string;
  currency1?: string;
  fee?: number;
  tickSpacing?: number;
  amountOutMinimum?: string;
  hooksAddress?: string;
  /** true = sell currency0 for currency1; false = sell currency1 for currency0. Default true. */
  zeroForOne?: boolean;
  /** Optional hook data (e.g. for LimitOrderHook: targetTick, zeroForOne). */
  hookData?: string;
};

export interface ExecuteSwapOptions {
  privateKey: `0x${string}`;
  params: SwapParams;
  hooks?: ProposalHooks;
  chainId?: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: Hash;
  error?: string;
}

/**
 * Execute a swap on Uniswap v4 via Universal Router.
 * Params must include v4 pool key (currency0, currency1, fee, tickSpacing) and amountOutMinimum
 * when using the real Universal Router; these can be provided by the execution payload (e.g. from a quote).
 */
export async function executeSwap(options: ExecuteSwapOptions): Promise<SwapResult> {
  const { privateKey, params, chainId = 1301 } = options;
  const swapParams = params as SwapParamsWithV4;

  try {
    const addresses = getUniswapAddresses(chainId);
    if (!isConfiguredAddress(addresses.universalRouter)) {
      return {
        success: false,
        error:
          'Universal Router not configured; set UNISWAP_V4_ADDRESSES for this chain and use real swap encoding (e.g. v4 SDK)',
      };
    }

    const chain = chainId === 130 ? unichainMainnet : unichainSepolia;
    const { publicClient, walletClient, account } = createUniswapClients(privateKey, chain);

    const deadline = BigInt(swapParams.deadline || Math.floor(Date.now() / 1000) + 1800);

    // Convert human-readable amounts to wei
    // ETH and most tokens use 18 decimals; USDC/USDT use 6
    const tokenInUpper = (swapParams.tokenIn || '').toUpperCase();
    const tokenOutUpper = (swapParams.tokenOut || '').toUpperCase();
    const inDecimals = ['USDC', 'USDT'].includes(tokenInUpper) ? 6 : 18;
    const outDecimals = ['USDC', 'USDT'].includes(tokenOutUpper) ? 6 : 18;
    // Hardcode ETH amount to 0.01 ETH for safety
    const rawAmount = tokenInUpper === 'ETH' ? '0.01' : swapParams.amount;
    const amountInWei = toWei(rawAmount, inDecimals);
    const amountOutMinWei = swapParams.amountOutMinimum
      ? toWei(swapParams.amountOutMinimum, outDecimals)
      : '0';

    let commands: `0x${string}`;
    let inputs: `0x${string}`[];
    const zeroForOne = swapParams.zeroForOne ?? true;
    const hasV4PoolKey =
      swapParams.currency0 &&
      swapParams.currency1 &&
      typeof swapParams.fee === 'number' &&
      typeof swapParams.tickSpacing === 'number' &&
      swapParams.amountOutMinimum != null;

    if (hasV4PoolKey) {
      const { commands: c, inputs: i } = buildV4SingleHopSwapCalldata({
        poolKey: {
          currency0: swapParams.currency0!,
          currency1: swapParams.currency1!,
          fee: swapParams.fee!,
          tickSpacing: swapParams.tickSpacing!,
          hooks: swapParams.hooksAddress,
        },
        zeroForOne,
        amountIn: amountInWei,
        amountOutMinimum: amountOutMinWei,
        hookData: swapParams.hookData,
      });
      commands = c;
      inputs = i;
    } else {
      return {
        success: false,
        error:
          'Swap execution requires v4 pool key and minimum out: include currency0, currency1, fee, tickSpacing, amountOutMinimum in execution payload (e.g. from quote or config)',
      };
    }

    // When input is native ETH (zeroForOne and tokenIn is ETH), send amountIn as value
    const value =
      zeroForOne && tokenInUpper === 'ETH' ? BigInt(amountInWei) : 0n;
    const { request } = await publicClient.simulateContract({
      address: addresses.universalRouter as `0x${string}`,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args: [commands, inputs, deadline],
      account,
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

/**
 * Get a quote for a swap (no execution)
 */
export async function getSwapQuote(params: SwapParams, chainId: number = 1301) {
  // TODO: Implement quote fetching via Quoter contract
  // This requires:
  // 1. Finding the best pool for the pair
  // 2. Calculating expected output
  // 3. Accounting for fees and slippage

  return {
    amountIn: params.amount,
    amountOut: '0', // Placeholder
    priceImpact: 0,
    route: [],
  };
}
