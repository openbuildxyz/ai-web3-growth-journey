/**
 * Simulate swap and limitOrder actions (ETH↔USDC) on Unichain Sepolia.
 *
 * Dynamically discovers pool parameters from on-chain StateView,
 * checks Permit2 approvals, and tests both directions on a hookless pool.
 *
 * Usage:
 *   pnpm --filter @uniforum/contracts run test:execution-all-actions
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  createPublicClient,
  decodeFunctionData,
  http,
  formatEther,
  formatUnits,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { unichainSepolia } from '../src/chains';
import { discoverPoolFeeTier } from '../src/uniswap/stateView';
import { hasPermit2Allowance } from '../src/uniswap/permit2';
import type { ExecutionPayload } from '@uniforum/shared';
import { buildCalldataForPayload, UNIVERSAL_ROUTER_ABI } from './build-execution-calldata';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const RPC_URL = process.env.UNICHAIN_SEPOLIA_RPC_URL ?? 'https://sepolia.unichain.org';
const CHAIN_ID = 1301;

/** Unichain Sepolia token addresses */
const UNICHAIN_SEPOLIA_ETH = '0x0000000000000000000000000000000000000000';
const UNICHAIN_SEPOLIA_USDC = '0x31d0220469e10c4E71834a79b1f276d740d3768F';

const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/** Known revert selectors for clearer error messages */
const KNOWN_ERROR_SELECTORS: Record<string, string> = {
  '0x2c4029e9':
    'ExecutionFailed(uint256,bytes) — inner command failed. Check Permit2 approval or pool state.',
  '0x486aa307': 'PoolNotInitialized() — pool does not exist for this pool key.',
  '0x3351b260':
    'DeltaNotNegative(address) — token settlement failed. Executor likely does not hold the input token.',
};

async function main() {
  console.log('=== Simulate swap & limitOrder on Unichain Sepolia ===\n');

  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: unichainSepolia, transport });
  const privateKey = process.env.TEST_EXECUTOR_PRIVATE_KEY as `0x${string}` | undefined;
  const account = privateKey
    ? privateKeyToAccount(privateKey)
    : privateKeyToAccount(
        '0x0000000000000000000000000000000000000000000000000000000000000001' as `0x${string}`
      );
  const isDummyAccount = !privateKey;

  console.log(`RPC: ${RPC_URL}`);
  console.log(`Chain: Unichain Sepolia (${CHAIN_ID})\n`);

  if (isDummyAccount) {
    console.log('Using dummy account (no TEST_EXECUTOR_PRIVATE_KEY). Results will be limited.\n');
  } else {
    console.log(`Executor: ${account.address}`);
  }

  // ── Check balances ──
  if (!isDummyAccount) {
    const [ethBal, usdcBal] = await Promise.all([
      publicClient.getBalance({ address: account.address }),
      publicClient.readContract({
        address: UNICHAIN_SEPOLIA_USDC as Address,
        abi: ERC20_BALANCE_ABI,
        functionName: 'balanceOf',
        args: [account.address],
      }),
    ]);
    console.log(`ETH balance:  ${formatEther(ethBal)} ETH`);
    console.log(`USDC balance: ${formatUnits(usdcBal, 6)} USDC\n`);
  }

  // ── Discover pool on-chain ──
  console.log('Discovering ETH-USDC pool from StateView...');
  const discovered = await discoverPoolFeeTier(
    CHAIN_ID,
    RPC_URL,
    UNICHAIN_SEPOLIA_ETH,
    UNICHAIN_SEPOLIA_USDC
  );
  if (!discovered) {
    console.log('  ERROR: No initialized ETH-USDC pool found. Cannot proceed.');
    return;
  }
  const { fee, tickSpacing, state } = discovered;
  console.log(
    `  Pool: fee=${fee}, tickSpacing=${tickSpacing}, currentTick=${state.tick}, liquidity=${state.liquidity}\n`
  );

  // ── Check Permit2 ──
  if (!isDummyAccount) {
    const hasApproval = await hasPermit2Allowance(
      publicClient as any,
      UNICHAIN_SEPOLIA_USDC as Address,
      account.address
    );
    console.log(
      `Permit2 USDC approval: ${hasApproval ? 'OK' : 'MISSING — run approve-permit2.ts first'}\n`
    );
  }

  // ── Build payloads: swap & limitOrder in both directions ──
  const PAYLOADS: Record<string, ExecutionPayload> = {
    'swap (ETH → USDC)': {
      proposalId: '00000000-0000-0000-0000-000000000001',
      forumId: '00000000-0000-0000-0000-000000000002',
      executorEnsName: 'creator.uniforum.eth',
      action: 'swap',
      params: {
        tokenIn: 'ETH',
        tokenOut: 'USDC',
        amount: '10000000000000000', // 0.01 ETH
        slippage: 50,
        deadline: Math.floor(Date.now() / 1000) + 1800,
        currency0: UNICHAIN_SEPOLIA_ETH,
        currency1: UNICHAIN_SEPOLIA_USDC,
        fee,
        tickSpacing,
        amountOutMinimum: '0',
        zeroForOne: true,
      },
      chainId: CHAIN_ID,
      forumGoal: 'Swap 0.01 ETH for USDC',
    } as ExecutionPayload,

    'swap (USDC → ETH)': {
      proposalId: '00000000-0000-0000-0000-000000000003',
      forumId: '00000000-0000-0000-0000-000000000004',
      executorEnsName: 'creator.uniforum.eth',
      action: 'swap',
      params: {
        tokenIn: 'USDC',
        tokenOut: 'ETH',
        amount: '5000000', // 5 USDC (6 decimals)
        slippage: 50,
        deadline: Math.floor(Date.now() / 1000) + 1800,
        currency0: UNICHAIN_SEPOLIA_ETH,
        currency1: UNICHAIN_SEPOLIA_USDC,
        fee,
        tickSpacing,
        amountOutMinimum: '0',
        zeroForOne: false,
      },
      chainId: CHAIN_ID,
      forumGoal: 'Swap 5 USDC for ETH',
    } as ExecutionPayload,

    'limitOrder (ETH → USDC, targetTick=-100)': {
      proposalId: '00000000-0000-0000-0000-000000000007',
      forumId: '00000000-0000-0000-0000-000000000008',
      executorEnsName: 'creator.uniforum.eth',
      action: 'limitOrder',
      params: {
        tokenIn: 'ETH',
        tokenOut: 'USDC',
        amount: '10000000000000000', // 0.01 ETH
        targetTick: -100,
        zeroForOne: true,
        currency0: UNICHAIN_SEPOLIA_ETH,
        currency1: UNICHAIN_SEPOLIA_USDC,
        fee,
        tickSpacing,
        amountOutMinimum: '0',
        deadline: Math.floor(Date.now() / 1000) + 1800,
      },
      chainId: CHAIN_ID,
      forumGoal: 'Limit order: sell 0.01 ETH for USDC at tick -100',
    } as ExecutionPayload,

    'limitOrder (USDC → ETH, targetTick=100)': {
      proposalId: '00000000-0000-0000-0000-000000000009',
      forumId: '00000000-0000-0000-0000-00000000000a',
      executorEnsName: 'creator.uniforum.eth',
      action: 'limitOrder',
      params: {
        tokenIn: 'USDC',
        tokenOut: 'ETH',
        amount: '5000000', // 5 USDC
        targetTick: 100,
        zeroForOne: false,
        currency0: UNICHAIN_SEPOLIA_ETH,
        currency1: UNICHAIN_SEPOLIA_USDC,
        fee,
        tickSpacing,
        amountOutMinimum: '0',
        deadline: Math.floor(Date.now() / 1000) + 1800,
      },
      chainId: CHAIN_ID,
      forumGoal: 'Limit order: sell 5 USDC for ETH at tick 100',
    } as ExecutionPayload,
  };

  // ── Simulate ──
  const totalTests = Object.keys(PAYLOADS).length;
  let succeeded = 0;
  let reverted = 0;

  for (const [name, payload] of Object.entries(PAYLOADS)) {
    console.log(`--- ${name} ---`);
    const { data, to, action, value } = buildCalldataForPayload(payload);
    const p = payload.params as Record<string, unknown>;

    const summary =
      action === 'swap'
        ? `${p.tokenIn} → ${p.tokenOut}, amount=${p.amount}, fee=${fee}`
        : `${p.tokenIn} → ${p.tokenOut}, amount=${p.amount}, targetTick=${p.targetTick}`;

    const hooksInfo = payload.hooks ? ` hooks: ${JSON.stringify(payload.hooks)}` : '';

    console.log(`  ${summary}${hooksInfo}`);
    console.log(`  to: ${to}  data: ${(data.length - 2) / 2} bytes  value: ${value ?? 0} wei`);

    const simValue = isDummyAccount ? 0n : (value ?? 0n);
    try {
      const decoded = decodeFunctionData({ abi: UNIVERSAL_ROUTER_ABI, data });
      if (decoded.functionName !== 'execute') {
        console.log('  SKIP: not execute()');
        continue;
      }
      const args = decoded.args as [`0x${string}`, `0x${string}`[], bigint];
      await publicClient.simulateContract({
        address: to as Address,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: 'execute',
        args,
        account,
        value: simValue,
      });
      console.log('  Result: SUCCESS\n');
      succeeded++;
    } catch (err) {
      reverted++;
      const msg = err instanceof Error ? err.message : String(err);
      const selectorMatch = msg.match(/0x[a-fA-F0-9]{8}/);
      const selector = selectorMatch?.[0]?.toLowerCase() ?? '';
      const knownName = KNOWN_ERROR_SELECTORS[selector] ?? '';
      console.log('  Result: REVERT');
      console.log('  Error:', msg.slice(0, 160) + (msg.length > 160 ? '...' : ''));
      if (knownName) console.log(`  Decoded: ${knownName}`);
      console.log('');
    }
  }

  console.log('=== Summary ===');
  console.log(`  Passed: ${succeeded}/${totalTests}`);
  console.log(`  Failed: ${reverted}/${totalTests}`);
}

main();
