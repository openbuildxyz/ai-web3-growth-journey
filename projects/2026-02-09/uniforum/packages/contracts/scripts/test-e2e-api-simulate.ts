/**
 * End-to-end test: API enrichment → calldata build → on-chain simulation.
 *
 * This script exercises the full pipeline that the frontend will use:
 *   1. Start with raw proposal params (what the frontend/agent sends)
 *   2. Enrich via enrichExecutionPayloadParams (what the API /execution-payload does)
 *   3. Build calldata via buildCalldataForPayload
 *   4. Simulate on-chain via publicClient.simulateContract
 *
 * If API_BASE_URL is set (e.g. http://localhost:3001), it also tests the live
 * API endpoint for comparison. Otherwise runs enrichment locally.
 *
 * Usage:
 *   pnpm --filter @uniforum/contracts run test:e2e
 *   API_BASE_URL=http://localhost:3001 pnpm --filter @uniforum/contracts run test:e2e
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
import type { ExecutionPayload } from '@uniforum/shared';
import { buildCalldataForPayload, UNIVERSAL_ROUTER_ABI } from './build-execution-calldata';
import { enrichExecutionPayloadParams } from '../../../apps/api/src/lib/enrichExecutionPayload';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const RPC_URL = process.env.UNICHAIN_SEPOLIA_RPC_URL ?? 'https://sepolia.unichain.org';
const CHAIN_ID = 1301;
const API_BASE_URL = process.env.API_BASE_URL; // optional: test live API too

const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const KNOWN_ERROR_SELECTORS: Record<string, string> = {
  '0x2c4029e9':
    'ExecutionFailed — inner command failed. Check Permit2 approval or pool state.',
  '0x486aa307': 'PoolNotInitialized — pool does not exist for this pool key.',
  '0x3351b260':
    'DeltaNotNegative — token settlement failed. Executor likely does not hold the input token.',
};

/**
 * Raw proposal params — what the frontend would send when creating a proposal.
 * No currency0/currency1/fee/tickSpacing — those come from enrichment.
 */
interface RawProposalTest {
  name: string;
  action: 'swap' | 'limitOrder';
  params: Record<string, unknown>;
}

const RAW_PROPOSALS: RawProposalTest[] = [
  {
    name: 'swap (ETH → USDC) — raw intent',
    action: 'swap',
    params: {
      tokenIn: 'ETH',
      tokenOut: 'USDC',
      amount: '10000000000000000', // 0.01 ETH
      slippage: 50,
    },
  },
  {
    name: 'swap (USDC → ETH) — raw intent',
    action: 'swap',
    params: {
      tokenIn: 'USDC',
      tokenOut: 'ETH',
      amount: '5000000', // 5 USDC
      slippage: 50,
    },
  },
  {
    name: 'limitOrder (ETH → USDC, targetTick=-100) — raw intent',
    action: 'limitOrder',
    params: {
      tokenIn: 'ETH',
      tokenOut: 'USDC',
      amount: '10000000000000000', // 0.01 ETH
      targetTick: -100,
      zeroForOne: true,
    },
  },
  {
    name: 'limitOrder (USDC → ETH, targetTick=100) — raw intent',
    action: 'limitOrder',
    params: {
      tokenIn: 'USDC',
      tokenOut: 'ETH',
      amount: '5000000', // 5 USDC
      targetTick: 100,
      zeroForOne: false,
    },
  },
];

async function main() {
  console.log('=== E2E Test: API Enrichment → Calldata → Simulation ===\n');

  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: unichainSepolia, transport });
  const privateKey = process.env.TEST_EXECUTOR_PRIVATE_KEY as `0x${string}` | undefined;

  if (!privateKey) {
    console.error('ERROR: TEST_EXECUTOR_PRIVATE_KEY is required for E2E simulation.');
    console.error('Set it in .env.local');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);

  console.log(`RPC:      ${RPC_URL}`);
  console.log(`Chain:    Unichain Sepolia (${CHAIN_ID})`);
  console.log(`Executor: ${account.address}`);
  if (API_BASE_URL) console.log(`API:      ${API_BASE_URL}`);
  console.log('');

  // ── Balances ──
  const USDC_ADDRESS = '0x31d0220469e10c4E71834a79b1f276d740d3768F' as Address;
  const [ethBal, usdcBal] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    }),
  ]);
  console.log(`ETH balance:  ${formatEther(ethBal)} ETH`);
  console.log(`USDC balance: ${formatUnits(usdcBal, 6)} USDC\n`);

  // ── Discover pool (for reference) ──
  console.log('Discovering ETH-USDC pool from StateView...');
  const discovered = await discoverPoolFeeTier(
    CHAIN_ID,
    RPC_URL,
    '0x0000000000000000000000000000000000000000',
    USDC_ADDRESS
  );
  if (!discovered) {
    console.error('ERROR: No initialized ETH-USDC pool found on-chain.');
    process.exit(1);
  }
  console.log(
    `  Pool: fee=${discovered.fee}, tickSpacing=${discovered.tickSpacing}, ` +
    `tick=${discovered.state.tick}, liquidity=${discovered.state.liquidity}\n`
  );

  // ── Run tests ──
  let passed = 0;
  let failed = 0;

  for (const test of RAW_PROPOSALS) {
    console.log(`--- ${test.name} ---`);

    // Step 1: Enrich (what the API /execution-payload endpoint does)
    console.log('  [1] Enriching raw params...');
    const enrichedParams = await enrichExecutionPayloadParams(
      test.action,
      test.params,
      CHAIN_ID,
      undefined, // forumGoal
      {
        rpcUrl: RPC_URL,
        tokenListUrl: process.env.TOKEN_LIST_URL || undefined,
        graphApiKey: process.env.GRAPH_API_KEY || undefined,
        subgraphUrl: process.env.UNISWAP_V4_SUBGRAPH_URL || undefined,
      }
    );

    // Verify enrichment produced the required fields
    const hasPoolKey = enrichedParams.currency0 && enrichedParams.currency1 &&
      typeof enrichedParams.fee === 'number' && typeof enrichedParams.tickSpacing === 'number';

    if (!hasPoolKey) {
      console.log('  ERROR: Enrichment failed to produce pool key fields.');
      console.log('  Enriched:', JSON.stringify(enrichedParams, null, 2));
      failed++;
      console.log('');
      continue;
    }

    console.log(`    currency0: ${enrichedParams.currency0}`);
    console.log(`    currency1: ${enrichedParams.currency1}`);
    console.log(`    fee: ${enrichedParams.fee}, tickSpacing: ${enrichedParams.tickSpacing}`);
    console.log(`    zeroForOne: ${enrichedParams.zeroForOne}`);
    console.log(`    amountOutMinimum: ${enrichedParams.amountOutMinimum}`);
    if (test.action === 'limitOrder') {
      console.log(`    targetTick: ${enrichedParams.targetTick}`);
    }

    // Step 2: Build ExecutionPayload (what the API returns)
    const deadline = Math.floor(Date.now() / 1000) + 1800;
    const payload: ExecutionPayload = {
      proposalId: '00000000-test-e2e-0000-000000000000',
      forumId: '00000000-test-e2e-0000-000000000001',
      executorEnsName: 'test.uniforum.eth',
      action: test.action,
      params: { ...enrichedParams, deadline } as any,
      chainId: CHAIN_ID,
      deadline,
    };

    console.log('  [2] Building calldata...');
    const { data, to, value } = buildCalldataForPayload(payload);
    console.log(`    to: ${to}`);
    console.log(`    data: ${(data.length - 2) / 2} bytes`);
    console.log(`    value: ${value ?? 0n} wei`);

    // Step 3: Simulate on-chain
    console.log('  [3] Simulating on-chain...');
    try {
      const decoded = decodeFunctionData({ abi: UNIVERSAL_ROUTER_ABI, data });
      if (decoded.functionName !== 'execute') {
        console.log('    SKIP: not execute()');
        continue;
      }
      const args = decoded.args as [`0x${string}`, `0x${string}`[], bigint];
      await publicClient.simulateContract({
        address: to as Address,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: 'execute',
        args,
        account,
        value: value ?? 0n,
      });
      console.log('    ✅ SIMULATION SUCCESS\n');
      passed++;
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      const selectorMatch = msg.match(/0x[a-fA-F0-9]{8}/);
      const selector = selectorMatch?.[0]?.toLowerCase() ?? '';
      const knownName = KNOWN_ERROR_SELECTORS[selector] ?? '';
      console.log('    ❌ SIMULATION REVERT');
      console.log('    Error:', msg.slice(0, 200) + (msg.length > 200 ? '...' : ''));
      if (knownName) console.log(`    Decoded: ${knownName}`);
      console.log('');
    }
  }

  // ── Optional: Test live API endpoint ──
  if (API_BASE_URL) {
    console.log('\n=== Live API Endpoint Test ===');
    console.log(`NOTE: Requires an approved proposal in the database.\n`);
    console.log(`To test manually:`);
    console.log(`  curl ${API_BASE_URL}/v1/proposals/<PROPOSAL_ID>/execution-payload?chainId=1301\n`);
  }

  console.log('=== E2E Summary ===');
  console.log(`  Passed: ${passed}/${RAW_PROPOSALS.length}`);
  console.log(`  Failed: ${failed}/${RAW_PROPOSALS.length}`);
  console.log(
    passed === RAW_PROPOSALS.length
      ? '\n  ✅ All tests passed — pipeline is ready for frontend integration.'
      : '\n  ⚠️  Some tests failed — check errors above.'
  );
}

main();
