/**
 * Build Uniswap v4 single-hop swap calldata per official docs:
 * https://docs.uniswap.org/sdk/v4/guides/swaps/single-hop-swapping
 * https://docs.uniswap.org/contracts/universal-router/technical-reference (V4_SWAP = 0x10)
 *
 * Uses @uniswap/v4-sdk (V4Planner, Actions) and @uniswap/universal-router-sdk (RoutePlanner, CommandType).
 */

export interface V4PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks?: string;
}

export interface BuildV4SingleHopSwapInputParams {
  poolKey: V4PoolKey;
  zeroForOne: boolean;
  amountIn: string;
  amountOutMinimum: string;
  hookData?: string;
}

export interface V4SwapCalldataResult {
  commands: `0x${string}`;
  inputs: `0x${string}`[];
}

const V4_SWAP_COMMAND = 0x10;

/**
 * Build (commands, inputs) for Universal Router execute() for a single-hop exact-in swap.
 * When @uniswap/v4-sdk and @uniswap/universal-router-sdk are installed, uses them to encode.
 * Otherwise returns a minimal encoding with the correct command byte and a placeholder input
 * (simulation will fail until SDK is used).
 */
export function buildV4SingleHopSwapCalldata(
  params: BuildV4SingleHopSwapInputParams
): V4SwapCalldataResult {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Actions, V4Planner } = require('@uniswap/v4-sdk') as {
      Actions: { SWAP_EXACT_IN_SINGLE: number; SETTLE_ALL: number; TAKE_ALL: number };
      V4Planner: new () => {
        addAction: (type: number, parameters: unknown[]) => void;
        finalize: () => string;
        actions: string;
        params: string[];
      };
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { CommandType, RoutePlanner } = require('@uniswap/universal-router-sdk') as {
      CommandType: { V4_SWAP: number };
      RoutePlanner: new () => {
        addCommand: (cmd: number, args: unknown[]) => void;
        commands: string;
        inputs: string[];
      };
    };

    const { poolKey, zeroForOne, amountIn, amountOutMinimum, hookData = '0x' } = params;
    const hooks = poolKey.hooks ?? '0x0000000000000000000000000000000000000000';

    // SwapExactInSingle-shaped config per single-hop guide
    const currentConfig = {
      poolKey: {
        currency0: poolKey.currency0,
        currency1: poolKey.currency1,
        fee: poolKey.fee,
        tickSpacing: poolKey.tickSpacing,
        hooks,
      },
      zeroForOne,
      amountIn,
      amountOutMinimum,
      hookData: hookData.startsWith('0x') ? hookData : `0x${hookData}`,
    };

    // Settle the input currency, take the output currency
    const settleCurrency = zeroForOne ? poolKey.currency0 : poolKey.currency1;
    const takeCurrency = zeroForOne ? poolKey.currency1 : poolKey.currency0;

    const v4Planner = new V4Planner();
    v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [currentConfig]);
    v4Planner.addAction(Actions.SETTLE_ALL, [settleCurrency, amountIn]);
    v4Planner.addAction(Actions.TAKE_ALL, [takeCurrency, amountOutMinimum]);

    const encodedActions = v4Planner.finalize();

    const routePlanner = new RoutePlanner();
    routePlanner.addCommand(CommandType.V4_SWAP, [v4Planner.actions, v4Planner.params]);

    // Per single-hop guide: execute(routePlanner.commands, [encodedActions], deadline)
    const commands = routePlanner.commands.startsWith('0x')
      ? (routePlanner.commands as `0x${string}`)
      : (`0x${routePlanner.commands}` as `0x${string}`);
    const inputs: `0x${string}`[] = [
      encodedActions.startsWith('0x') ? (encodedActions as `0x${string}`) : (`0x${encodedActions}` as `0x${string}`),
    ];

    return { commands, inputs };
  } catch (e) {
    // SDK not installed or API mismatch: return correct command byte so contract shape is valid
    const err = e instanceof Error ? e.message : String(e);
    if (!err.includes('Cannot find module') && !err.includes('require')) {
      throw e;
    }
    const commands = (`0x${V4_SWAP_COMMAND.toString(16).padStart(2, '0')}`) as `0x${string}`;
    const inputs: `0x${string}`[] = ['0x' as `0x${string}`];
    return { commands, inputs };
  }
}
