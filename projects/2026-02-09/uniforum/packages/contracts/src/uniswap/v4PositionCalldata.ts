/**
 * Uniswap v4 Position Manager calldata (add/remove liquidity) per official docs:
 * https://docs.uniswap.org/contracts/v4/quickstart/manage-liquidity/mint-position
 * https://docs.uniswap.org/contracts/v4/quickstart/manage-liquidity/decrease-liquidity
 * https://docs.uniswap.org/contracts/universal-router/technical-reference (V4_POSITION_MANAGER_CALL = 0x14)
 *
 * Actions: MINT_POSITION=0x02, SETTLE_PAIR=0x0d, TAKE_PAIR=0x11, SWEEP=0x14, DECREASE_LIQUIDITY=0x01
 */

import { encodeAbiParameters, encodeFunctionData, bytesToHex } from 'viem';

const MINT_POSITION = 0x02;
const MINT_POSITION_FROM_DELTAS = 0x05;
const SETTLE_PAIR = 0x0d;
const TAKE_PAIR = 0x11;
const SWEEP = 0x14;
const DECREASE_LIQUIDITY = 0x01;

export interface V4PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks?: string;
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

export interface BuildMintPositionParams {
  poolKey: V4PoolKey;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  amount0Max: string;
  amount1Max: string;
  recipient: string;
  hookData?: string;
  useNativeEth?: boolean;
}

export interface BuildDecreaseLiquidityParams {
  tokenId: string;
  liquidity: string;
  amount0Min: string;
  amount1Min: string;
  currency0: string;
  currency1: string;
  recipient: string;
  hookData?: string;
}

/**
 * Build unlockData for Position Manager modifyLiquidities (mint new position).
 * actions = MINT_POSITION, SETTLE_PAIR [, SWEEP if useNativeEth]
 */
export function buildMintPositionUnlockData(params: BuildMintPositionParams): `0x${string}` {
  const hooks = params.poolKey.hooks ?? '0x0000000000000000000000000000000000000000';
  const mintParams = encodeAbiParameters(
    [
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
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint256' },
      { name: 'amount0Max', type: 'uint128' },
      { name: 'amount1Max', type: 'uint128' },
      { name: 'recipient', type: 'address' },
      { name: 'hookData', type: 'bytes' },
    ],
    [
      {
        currency0: params.poolKey.currency0 as `0x${string}`,
        currency1: params.poolKey.currency1 as `0x${string}`,
        fee: params.poolKey.fee,
        tickSpacing: params.poolKey.tickSpacing,
        hooks: hooks as `0x${string}`,
      },
      params.tickLower,
      params.tickUpper,
      BigInt(params.liquidity),
      BigInt(params.amount0Max),
      BigInt(params.amount1Max),
      params.recipient as `0x${string}`,
      (params.hookData?.startsWith('0x') ? params.hookData : `0x${params.hookData ?? ''}`) as `0x${string}`,
    ]
  );
  const settleParams = encodeAbiParameters(
    [{ name: 'currency0', type: 'address' }, { name: 'currency1', type: 'address' }],
    [params.poolKey.currency0 as `0x${string}`, params.poolKey.currency1 as `0x${string}`]
  );

  const actions = params.useNativeEth
    ? new Uint8Array([MINT_POSITION, SETTLE_PAIR, SWEEP])
    : new Uint8Array([MINT_POSITION, SETTLE_PAIR]);
  const actionsHex = bytesToHex(actions) as `0x${string}`;
  const paramsArray = params.useNativeEth
    ? [mintParams, settleParams, encodeAbiParameters(
        [{ name: 'currency', type: 'address' }, { name: 'recipient', type: 'address' }],
        ['0x0000000000000000000000000000000000000000' as `0x${string}`, params.recipient as `0x${string}`]
      )]
    : [mintParams, settleParams];

  const unlockData = encodeAbiParameters(
    [{ name: 'actions', type: 'bytes' }, { name: 'params', type: 'bytes[]' }],
    [actionsHex, paramsArray]
  );
  return unlockData as `0x${string}`;
}

/**
 * Build unlockData for Position Manager modifyLiquidities (mint from deltas — auto-calculates liquidity).
 * Uses MINT_POSITION_FROM_DELTAS (0x05) which derives liquidity from deposited token amounts.
 * actions = MINT_POSITION_FROM_DELTAS, SETTLE_PAIR [, SWEEP if useNativeEth]
 */
export function buildMintFromDeltasUnlockData(params: Omit<BuildMintPositionParams, 'liquidity'>): `0x${string}` {
  const hooks = params.poolKey.hooks ?? '0x0000000000000000000000000000000000000000';
  const mintParams = encodeAbiParameters(
    [
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
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'amount0Max', type: 'uint128' },
      { name: 'amount1Max', type: 'uint128' },
      { name: 'recipient', type: 'address' },
      { name: 'hookData', type: 'bytes' },
    ],
    [
      {
        currency0: params.poolKey.currency0 as `0x${string}`,
        currency1: params.poolKey.currency1 as `0x${string}`,
        fee: params.poolKey.fee,
        tickSpacing: params.poolKey.tickSpacing,
        hooks: hooks as `0x${string}`,
      },
      params.tickLower,
      params.tickUpper,
      BigInt(params.amount0Max),
      BigInt(params.amount1Max),
      params.recipient as `0x${string}`,
      (params.hookData?.startsWith('0x') ? params.hookData : `0x${params.hookData ?? ''}`) as `0x${string}`,
    ]
  );
  const settleParams = encodeAbiParameters(
    [{ name: 'currency0', type: 'address' }, { name: 'currency1', type: 'address' }],
    [params.poolKey.currency0 as `0x${string}`, params.poolKey.currency1 as `0x${string}`]
  );

  const actions = params.useNativeEth
    ? new Uint8Array([MINT_POSITION_FROM_DELTAS, SETTLE_PAIR, SWEEP])
    : new Uint8Array([MINT_POSITION_FROM_DELTAS, SETTLE_PAIR]);
  const actionsHex = bytesToHex(actions) as `0x${string}`;
  const paramsArray = params.useNativeEth
    ? [mintParams, settleParams, encodeAbiParameters(
        [{ name: 'currency', type: 'address' }, { name: 'recipient', type: 'address' }],
        ['0x0000000000000000000000000000000000000000' as `0x${string}`, params.recipient as `0x${string}`]
      )]
    : [mintParams, settleParams];

  const unlockData = encodeAbiParameters(
    [{ name: 'actions', type: 'bytes' }, { name: 'params', type: 'bytes[]' }],
    [actionsHex, paramsArray]
  );
  return unlockData as `0x${string}`;
}

/**
 * Build full (commands, inputs) for Universal Router for add liquidity using MINT_POSITION_FROM_DELTAS.
 */
export function buildAddLiquidityFromDeltasCalldata(
  params: Omit<BuildMintPositionParams, 'liquidity'>,
  deadline: bigint
): { commands: `0x${string}`; inputs: `0x${string}`[] } {
  const unlockData = buildMintFromDeltasUnlockData(params);
  const callData = buildV4PositionManagerCallInput(unlockData, deadline);
  const commands = (`0x${V4_POSITION_MANAGER_CALL.toString(16).padStart(2, '0')}`) as `0x${string}`;
  return { commands, inputs: [callData] };
}

/**
 * Build unlockData for Position Manager modifyLiquidities (decrease liquidity + take pair).
 */
export function buildDecreaseLiquidityUnlockData(params: BuildDecreaseLiquidityParams): `0x${string}` {
  const decreaseParams = encodeAbiParameters(
    [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint256' },
      { name: 'amount0Min', type: 'uint128' },
      { name: 'amount1Min', type: 'uint128' },
      { name: 'hookData', type: 'bytes' },
    ],
    [
      BigInt(params.tokenId),
      BigInt(params.liquidity),
      BigInt(params.amount0Min),
      BigInt(params.amount1Min),
      (params.hookData?.startsWith('0x') ? params.hookData : `0x${params.hookData ?? ''}`) as `0x${string}`,
    ]
  );
  const takeParams = encodeAbiParameters(
    [
      { name: 'currency0', type: 'address' },
      { name: 'currency1', type: 'address' },
      { name: 'recipient', type: 'address' },
    ],
    [params.currency0 as `0x${string}`, params.currency1 as `0x${string}`, params.recipient as `0x${string}`]
  );
  const actions = new Uint8Array([DECREASE_LIQUIDITY, TAKE_PAIR]);
  const actionsHex = bytesToHex(actions) as `0x${string}`;
  const unlockData = encodeAbiParameters(
    [{ name: 'actions', type: 'bytes' }, { name: 'params', type: 'bytes[]' }],
    [actionsHex, [decreaseParams, takeParams]]
  );
  return unlockData as `0x${string}`;
}

const V4_POSITION_MANAGER_CALL = 0x14;

/**
 * Build (commands, inputs) for Universal Router execute() for a single V4_POSITION_MANAGER_CALL.
 * Input is the ABI-encoded call to PositionManager.modifyLiquidities(unlockData, deadline).
 */
export function buildV4PositionManagerCallInput(unlockData: `0x${string}`, deadline: bigint): `0x${string}` {
  return encodeFunctionData({
    abi: POSITION_MANAGER_ABI,
    functionName: 'modifyLiquidities',
    args: [unlockData, deadline],
  });
}

/**
 * Build full (commands, inputs) for Universal Router for add liquidity (mint position).
 */
export function buildAddLiquidityCalldata(
  params: BuildMintPositionParams,
  deadline: bigint
): { commands: `0x${string}`; inputs: `0x${string}`[] } {
  const unlockData = buildMintPositionUnlockData(params);
  const callData = buildV4PositionManagerCallInput(unlockData, deadline);
  const commands = (`0x${V4_POSITION_MANAGER_CALL.toString(16).padStart(2, '0')}`) as `0x${string}`;
  return { commands, inputs: [callData] };
}

/**
 * Build full (commands, inputs) for Universal Router for remove liquidity (decrease + take).
 */
export function buildRemoveLiquidityCalldata(
  params: BuildDecreaseLiquidityParams,
  deadline: bigint
): { commands: `0x${string}`; inputs: `0x${string}`[] } {
  const unlockData = buildDecreaseLiquidityUnlockData(params);
  const callData = buildV4PositionManagerCallInput(unlockData, deadline);
  const commands = (`0x${V4_POSITION_MANAGER_CALL.toString(16).padStart(2, '0')}`) as `0x${string}`;
  return { commands, inputs: [callData] };
}
