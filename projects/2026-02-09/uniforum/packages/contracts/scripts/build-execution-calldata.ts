/**
 * Build execution calldata from a sample ExecutionPayload
 *
 * Uses Uniswap v4 SDK when available to encode V4_SWAP (0x10) per:
 * https://docs.uniswap.org/sdk/v4/guides/swaps/single-hop-swapping
 *
 * Run from repo root: pnpm --filter @uniforum/contracts run build:calldata
 * Or: cd packages/contracts && bun run scripts/build-execution-calldata.ts
 */

import { encodeAbiParameters, encodeFunctionData } from 'viem';
import type { ExecutionPayload } from '@uniforum/shared';
import { buildV4SingleHopSwapCalldata } from '../src/uniswap/v4SwapCalldata';
import {
  buildAddLiquidityCalldata as buildAddLiquidityEncoded,
  buildAddLiquidityFromDeltasCalldata as buildAddLiquidityFromDeltasEncoded,
  buildDecreaseLiquidityUnlockData,
} from '../src/uniswap/v4PositionCalldata';

// Enriched execution payloads (params include v4 pool key etc. for encoding)
type EnrichedPayload = Omit<ExecutionPayload, 'params'> & { params: Record<string, unknown> };

// Sample payload: swap with v4 pool key so SDK can encode (Unichain Sepolia)
const SAMPLE_SWAP_PAYLOAD: EnrichedPayload = {
  proposalId: '00000000-0000-0000-0000-000000000001',
  forumId: '00000000-0000-0000-0000-000000000002',
  executorEnsName: 'creator.uniforum.eth',
  action: 'swap',
  params: {
    tokenIn: 'ETH',
    tokenOut: 'USDC',
    amount: '100000000000000000', // 0.1 ETH in wei
    slippage: 50,
    deadline: Math.floor(Date.now() / 1000) + 1800,
    currency0: '0x0000000000000000000000000000000000000000',
    currency1: '0x0000000000000000000000000000000000000000',
    fee: 500,
    tickSpacing: 10,
    amountOutMinimum: '0',
    zeroForOne: true,
  },
  chainId: 1301,
  forumGoal: 'Swap 0.1 ETH for USDC with low slippage',
};

const SAMPLE_ADD_LIQUIDITY_PAYLOAD: EnrichedPayload = {
  proposalId: '00000000-0000-0000-0000-000000000003',
  forumId: '00000000-0000-0000-0000-000000000004',
  executorEnsName: 'creator.uniforum.eth',
  action: 'addLiquidity',
  params: {
    pool: 'ETH-USDC',
    amount0: '100000000000000000',
    amount1: '200000000',
    tickLower: -887220,
    tickUpper: 887220,
    currency0: '0x0000000000000000000000000000000000000000',
    currency1: '0x0000000000000000000000000000000000000000',
    fee: 500,
    tickSpacing: 10,
    liquidity: '0',
    recipient: '0x0000000000000000000000000000000000000001',
  },
  hooks: { dynamicFee: { enabled: false, feeBps: 0 } },
  chainId: 1301,
};

const SAMPLE_REMOVE_LIQUIDITY_PAYLOAD: EnrichedPayload = {
  proposalId: '00000000-0000-0000-0000-000000000005',
  forumId: '00000000-0000-0000-0000-000000000006',
  executorEnsName: 'creator.uniforum.eth',
  action: 'removeLiquidity',
  params: {
    tokenId: '1',
    liquidityAmount: '1000000',
    currency0: '0x0000000000000000000000000000000000000000',
    currency1: '0x0000000000000000000000000000000000000000',
    recipient: '0x0000000000000000000000000000000000000001',
    amount0Min: '0',
    amount1Min: '0',
  },
  chainId: 1301,
};

const SAMPLE_LIMIT_ORDER_PAYLOAD: EnrichedPayload = {
  proposalId: '00000000-0000-0000-0000-000000000007',
  forumId: '00000000-0000-0000-0000-000000000008',
  executorEnsName: 'creator.uniforum.eth',
  action: 'limitOrder',
  params: {
    tokenIn: 'ETH',
    tokenOut: 'USDC',
    amount: '100000000000000000',
    targetTick: -100,
    zeroForOne: true,
    currency0: '0x0000000000000000000000000000000000000000',
    currency1: '0x0000000000000000000000000000000000000000',
    fee: 500,
    tickSpacing: 10,
    amountOutMinimum: '0',
    deadline: Math.floor(Date.now() / 1000) + 1800,
  },
  hooks: { limitOrder: { enabled: true, targetTick: -100, zeroForOne: true } },
  chainId: 1301,
};

/** Universal Router address per chain (from docs.uniswap.org/contracts/v4/deployments) */
export const UNIVERSAL_ROUTER_BY_CHAIN: Record<number, string> = {
  1301: '0xf70536b3bcc1bd1a972dc186a2cf84cc6da6be5d',
  130: '0xef740bf23acae26f6492b10de645d6b98dc8eaf3',
};

export const UNIVERSAL_ROUTER_ABI = [
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

/**
 * Build Universal Router execute() calldata for a swap payload.
 * Uses buildV4SingleHopSwapCalldata (v4 SDK when installed) when params include pool key.
 */
export function buildSwapCalldata(payload: ExecutionPayload): {
  data: `0x${string}`;
  to: string;
  value?: bigint;
} {
  const params = payload.params as {
    amount: string;
    deadline?: number;
    currency0?: string;
    currency1?: string;
    fee?: number;
    tickSpacing?: number;
    amountOutMinimum?: string;
    hooksAddress?: string;
    zeroForOne?: boolean;
  };
  const deadline = BigInt(params.deadline ?? Math.floor(Date.now() / 1000) + 1800);

  const hasV4PoolKey =
    params.currency0 &&
    params.currency1 &&
    typeof params.fee === 'number' &&
    typeof params.tickSpacing === 'number' &&
    params.amountOutMinimum != null;

  let commands: `0x${string}`;
  let inputs: `0x${string}`[];
  if (hasV4PoolKey) {
    const result = buildV4SingleHopSwapCalldata({
      poolKey: {
        currency0: params.currency0!,
        currency1: params.currency1!,
        fee: params.fee!,
        tickSpacing: params.tickSpacing!,
        hooks: params.hooksAddress,
      },
      zeroForOne: params.zeroForOne ?? true,
      amountIn: params.amount,
      amountOutMinimum: params.amountOutMinimum!,
    });
    commands = result.commands;
    inputs = result.inputs;
  } else {
    // V4_SWAP = 0x10 per technical reference
    commands = '0x10' as `0x${string}`;
    inputs = ['0x' as `0x${string}`];
  }

  const data = encodeFunctionData({
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [commands, inputs, deadline],
  });

  const to =
    UNIVERSAL_ROUTER_BY_CHAIN[payload.chainId] ?? '0x0000000000000000000000000000000000000001';
  const value =
    (params as { tokenIn?: string }).tokenIn?.toUpperCase() === 'ETH' && (params.zeroForOne ?? true)
      ? BigInt(params.amount)
      : undefined;
  return { data, to, value };
}

/**
 * Build Universal Router execute() calldata for add liquidity (V4_POSITION_MANAGER_CALL 0x14).
 */
export function buildAddLiquidityCalldata(payload: ExecutionPayload): {
  data: `0x${string}`;
  to: string;
  value?: bigint;
} {
  const params = payload.params as {
    currency0?: string;
    currency1?: string;
    fee?: number;
    tickSpacing?: number;
    amount0?: string;
    amount1?: string;
    tickLower?: number;
    tickUpper?: number;
    liquidity?: string;
    recipient?: string;
    hooksAddress?: string;
  };
  const deadline = BigInt(
    (payload.params as { deadline?: number }).deadline ?? Math.floor(Date.now() / 1000) + 1800
  );
  const poolKey = {
    currency0: params.currency0 ?? '0x0000000000000000000000000000000000000000',
    currency1: params.currency1 ?? '0x0000000000000000000000000000000000000000',
    fee: params.fee ?? 500,
    tickSpacing: params.tickSpacing ?? 10,
    hooks: params.hooksAddress ?? '0x0000000000000000000000000000000000000000',
  };
  const isNativeEth =
    poolKey.currency0.toLowerCase() === '0x0000000000000000000000000000000000000000';
  const liquidityValue = params.liquidity ?? '0';
  const useFromDeltas = liquidityValue === '0' || liquidityValue === '';

  const mintParams = {
    poolKey,
    tickLower: params.tickLower ?? -887220,
    tickUpper: params.tickUpper ?? 887220,
    amount0Max: params.amount0 ?? '0',
    amount1Max: params.amount1 ?? '0',
    recipient: params.recipient ?? '0x0000000000000000000000000000000000000001',
    hookData: (payload.hooks as { dynamicFee?: { hookData?: string } })?.dynamicFee?.hookData,
    useNativeEth: isNativeEth,
  };

  // Use MINT_POSITION_FROM_DELTAS (0x05) when no liquidity specified — auto-calculates from amounts.
  // Use MINT_POSITION (0x02) when explicit liquidity is provided.
  const { commands, inputs } = useFromDeltas
    ? buildAddLiquidityFromDeltasEncoded(mintParams, deadline)
    : buildAddLiquidityEncoded({ ...mintParams, liquidity: liquidityValue }, deadline);
  const data = encodeFunctionData({
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [commands, inputs, deadline],
  });
  const to =
    UNIVERSAL_ROUTER_BY_CHAIN[payload.chainId] ?? '0x0000000000000000000000000000000000000001';
  const value = isNativeEth ? BigInt(params.amount0 ?? '0') : undefined;
  return { data, to, value };
}

/** PositionManager ABI (modifyLiquidities only) */
export const POSITION_MANAGER_ABI = [
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

/** PositionManager address per chain */
export const POSITION_MANAGER_BY_CHAIN: Record<number, string> = {
  1301: '0xf969aee60879c54baaed9f3ed26147db216fd664',
  130: '0x4529a01c7a0410167c5740c487a8de60232617bf',
};

/**
 * Build PositionManager.modifyLiquidities() calldata for remove liquidity (decrease + take).
 *
 * DECREASE_LIQUIDITY cannot go through the Universal Router's V4_POSITION_MANAGER_CALL (0x14)
 * because the router's _checkV4PositionManagerCall() only allows MINT_POSITION actions.
 * We must call PositionManager.modifyLiquidities() directly.
 */
export function buildRemoveLiquidityCalldata(payload: ExecutionPayload): {
  data: `0x${string}`;
  to: string;
} {
  const params = payload.params as {
    tokenId?: string;
    liquidityAmount?: string;
    currency0?: string;
    currency1?: string;
    recipient?: string;
    amount0Min?: string;
    amount1Min?: string;
  };
  const deadline = BigInt(
    (payload.params as { deadline?: number }).deadline ?? Math.floor(Date.now() / 1000) + 1800
  );
  const unlockData = buildDecreaseLiquidityUnlockData({
    tokenId: params.tokenId ?? '0',
    liquidity: params.liquidityAmount ?? '0',
    amount0Min: params.amount0Min ?? '0',
    amount1Min: params.amount1Min ?? '0',
    currency0: params.currency0 ?? '0x0000000000000000000000000000000000000000',
    currency1: params.currency1 ?? '0x0000000000000000000000000000000000000000',
    recipient: params.recipient ?? '0x0000000000000000000000000000000000000001',
    hookData: '0x',
  });
  const data = encodeFunctionData({
    abi: POSITION_MANAGER_ABI,
    functionName: 'modifyLiquidities',
    args: [unlockData, deadline],
  });
  const to =
    POSITION_MANAGER_BY_CHAIN[payload.chainId] ?? '0x0000000000000000000000000000000000000001';
  return { data, to };
}

function encodeLimitOrderHookData(targetTick: number, zeroForOne: boolean): `0x${string}` {
  return encodeAbiParameters(
    [
      { name: 'targetTick', type: 'int24' },
      { name: 'zeroForOne', type: 'bool' },
    ],
    [targetTick, zeroForOne]
  ) as `0x${string}`;
}

/**
 * Build Universal Router execute() calldata for limit order (swap with hookData).
 */
export function buildLimitOrderCalldata(payload: ExecutionPayload): {
  data: `0x${string}`;
  to: string;
  value?: bigint;
} {
  const params = payload.params as {
    amount: string;
    deadline?: number;
    currency0?: string;
    currency1?: string;
    fee?: number;
    tickSpacing?: number;
    amountOutMinimum?: string;
    hooksAddress?: string;
    zeroForOne?: boolean;
    targetTick?: number;
  };
  const targetTick =
    params.targetTick ??
    (payload.hooks as { limitOrder?: { targetTick?: number } })?.limitOrder?.targetTick ??
    0;
  const zeroForOne =
    params.zeroForOne ??
    (payload.hooks as { limitOrder?: { zeroForOne?: boolean } })?.limitOrder?.zeroForOne ??
    true;
  const hookData = encodeLimitOrderHookData(targetTick, zeroForOne);

  const deadline = BigInt(params.deadline ?? Math.floor(Date.now() / 1000) + 1800);
  const hasV4PoolKey =
    params.currency0 &&
    params.currency1 &&
    typeof params.fee === 'number' &&
    typeof params.tickSpacing === 'number' &&
    params.amountOutMinimum != null;

  let commands: `0x${string}`;
  let inputs: `0x${string}`[];
  if (hasV4PoolKey) {
    const result = buildV4SingleHopSwapCalldata({
      poolKey: {
        currency0: params.currency0!,
        currency1: params.currency1!,
        fee: params.fee!,
        tickSpacing: params.tickSpacing!,
        hooks: params.hooksAddress,
      },
      zeroForOne,
      amountIn: params.amount,
      amountOutMinimum: params.amountOutMinimum!,
      hookData,
    });
    commands = result.commands;
    inputs = result.inputs;
  } else {
    commands = '0x10' as `0x${string}`;
    inputs = ['0x' as `0x${string}`];
  }

  const data = encodeFunctionData({
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [commands, inputs, deadline],
  });
  const to =
    UNIVERSAL_ROUTER_BY_CHAIN[payload.chainId] ?? '0x0000000000000000000000000000000000000001';
  const value =
    (payload.params as { tokenIn?: string }).tokenIn?.toUpperCase() === 'ETH' && zeroForOne
      ? BigInt(params.amount)
      : undefined;
  return { data, to, value };
}

/**
 * Build calldata for any supported action (swap, addLiquidity, removeLiquidity, limitOrder).
 */
export function buildCalldataForPayload(payload: ExecutionPayload): {
  data: `0x${string}`;
  to: string;
  action: string;
  value?: bigint;
} {
  switch (payload.action) {
    case 'swap': {
      const { data, to, value } = buildSwapCalldata(payload);
      return { data, to, value, action: 'swap' as const };
    }
    case 'addLiquidity': {
      const { data, to, value } = buildAddLiquidityCalldata(payload);
      return { data, to, value, action: 'addLiquidity' as const };
    }
    case 'removeLiquidity': {
      const { data, to } = buildRemoveLiquidityCalldata(payload);
      return { data, to, action: 'removeLiquidity' as const };
    }
    case 'limitOrder': {
      const { data, to, value } = buildLimitOrderCalldata(payload);
      return { data, to, value, action: 'limitOrder' as const };
    }
    default:
      throw new Error(`Unknown action: ${(payload as any).action}`);
  }
}

function main() {
  console.log('Sample ExecutionPayload (swap):');
  console.log(JSON.stringify(SAMPLE_SWAP_PAYLOAD, null, 2));
  console.log('');

  const { data, to, action } = buildCalldataForPayload(
    SAMPLE_SWAP_PAYLOAD as unknown as ExecutionPayload
  );
  console.log('Generated calldata for agent execution:');
  console.log('  action:', action);
  console.log('  to (contract):', to);
  console.log('  data (hex):', data);
  console.log('  data length (bytes):', (data.length - 2) / 2);
  console.log('');

  console.log('Sample ExecutionPayload (addLiquidity):');
  console.log(JSON.stringify(SAMPLE_ADD_LIQUIDITY_PAYLOAD, null, 2));
  const addLiq = buildCalldataForPayload(
    SAMPLE_ADD_LIQUIDITY_PAYLOAD as unknown as ExecutionPayload
  );
  console.log('  addLiquidity:', addLiq.to, 'data length', (addLiq.data.length - 2) / 2, 'bytes');
  console.log('');

  console.log('Sample ExecutionPayload (removeLiquidity):');
  console.log(JSON.stringify(SAMPLE_REMOVE_LIQUIDITY_PAYLOAD, null, 2));
  const removeLiq = buildCalldataForPayload(
    SAMPLE_REMOVE_LIQUIDITY_PAYLOAD as unknown as ExecutionPayload
  );
  console.log(
    '  removeLiquidity:',
    removeLiq.to,
    'data length',
    (removeLiq.data.length - 2) / 2,
    'bytes'
  );
  console.log('');

  console.log('Sample ExecutionPayload (limitOrder):');
  console.log(JSON.stringify(SAMPLE_LIMIT_ORDER_PAYLOAD, null, 2));
  const limitOrder = buildCalldataForPayload(
    SAMPLE_LIMIT_ORDER_PAYLOAD as unknown as ExecutionPayload
  );
  console.log(
    '  limitOrder:',
    limitOrder.to,
    'data length',
    (limitOrder.data.length - 2) / 2,
    'bytes'
  );
  console.log('');

  console.log('Next steps:');
  console.log(
    '1. Use real WETH/USDC addresses and amountOutMinimum (e.g. from quoter) in payload.params for chainId',
    SAMPLE_SWAP_PAYLOAD.chainId
  );
  console.log(
    '2. Run test:execution-all-actions to simulate all four actions (swap, addLiquidity, removeLiquidity, limitOrder)'
  );
  console.log(
    '3. Agent execution worker: fetch payload from API → buildCalldataForPayload → sendTransaction'
  );
}

// Only run when this file is the entry point (e.g. bun run scripts/build-execution-calldata.ts)
if ((import.meta as { main?: boolean }).main) {
  main();
}
