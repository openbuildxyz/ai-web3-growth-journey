/**
 * Deliberation Scenario: Agents debate action type, fee tier, amount, and slippage.
 *
 * Simulates the full agentic finance flow across 3 proposals:
 *
 *   Proposal #1 (Alpha): swap 0.01 ETH → USDC, fee=100 (0.01%), slippage=0.5%
 *     → REJECTED — Beta & Gamma want a limit order on a deeper-liquidity pool
 *
 *   Proposal #2 (Beta): limitOrder 0.05 ETH → USDC, fee=3000 (0.3%), tick=-100
 *     → REJECTED — Alpha says 0.05 ETH is too much, Gamma agrees but wants fee=500
 *
 *   Proposal #3 (Gamma): limitOrder 0.01 ETH → USDC, fee=500 (0.05%), tick=-100
 *     → APPROVED (3/3) → Enrich → Calldata → Simulate → SUCCESS
 *
 * Demonstrates: action type change, fee tier selection, amount adjustment,
 * and that each proposal targets a real on-chain pool with liquidity.
 *
 * Usage:
 *   pnpm --filter @uniforum/contracts run test:deliberation
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
import { discoverAllPools, type DiscoveredPool } from '../src/uniswap/stateView';
import type { ExecutionPayload } from '@uniforum/shared';
import { buildCalldataForPayload, UNIVERSAL_ROUTER_ABI } from './build-execution-calldata';
import { enrichExecutionPayloadParams } from '../../../apps/api/src/lib/enrichExecutionPayload';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const RPC_URL = process.env.UNICHAIN_SEPOLIA_RPC_URL ?? 'https://sepolia.unichain.org';
const CHAIN_ID = 1301;

const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const USDC_ADDRESS = '0x31d0220469e10c4E71834a79b1f276d740d3768F' as Address;
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

const AGENTS = {
  alpha: { ens: 'alpha.uniforum.eth', strategy: 'aggressive' },
  beta: { ens: 'beta.uniforum.eth', strategy: 'conservative' },
  gamma: { ens: 'gamma.uniforum.eth', strategy: 'moderate' },
} as const;

function log(prefix: string, msg: string) {
  const colors: Record<string, string> = {
    FORUM: '\x1b[36m', ALPHA: '\x1b[33m', BETA: '\x1b[32m', GAMMA: '\x1b[35m',
    VOTE: '\x1b[34m', SYSTEM: '\x1b[90m', EXEC: '\x1b[31m', POOL: '\x1b[36m',
    '✅': '\x1b[32m', '❌': '\x1b[31m',
  };
  const color = colors[prefix] ?? '\x1b[0m';
  console.log(`${color}[${prefix}]\x1b[0m ${msg}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function feePct(fee: number): string {
  return `${(fee / 10000).toFixed(2)}%`;
}

/** Simulate enrichment → calldata → on-chain simulation. Returns true if SUCCESS. */
async function simulateProposal(
  action: string,
  params: Record<string, unknown>,
  account: ReturnType<typeof privateKeyToAccount>,
  publicClient: ReturnType<typeof createPublicClient>,
): Promise<boolean> {
  const enriched = await enrichExecutionPayloadParams(
    action, params, CHAIN_ID, undefined,
    { rpcUrl: RPC_URL, graphApiKey: process.env.GRAPH_API_KEY || undefined }
  );
  const deadline = Math.floor(Date.now() / 1000) + 1800;
  const payload: ExecutionPayload = {
    proposalId: 'deliberation-sim',
    forumId: 'deliberation-forum',
    executorEnsName: AGENTS.alpha.ens,
    action: action as any,
    params: { ...enriched, deadline } as any,
    chainId: CHAIN_ID,
    deadline,
  };
  const { data, to, value } = buildCalldataForPayload(payload);
  try {
    const decoded = decodeFunctionData({ abi: UNIVERSAL_ROUTER_ABI, data });
    const args = decoded.args as [`0x${string}`, `0x${string}`[], bigint];
    await publicClient.simulateContract({
      address: to as Address,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args,
      account,
      value: value ?? 0n,
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   UNIFORUM: Multi-Round Deliberation → Consensus → Execution       ║');
  console.log('║   Agents debate: action type · fee tier · amount · slippage         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log('');

  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: unichainSepolia, transport });
  const privateKey = process.env.TEST_EXECUTOR_PRIVATE_KEY as `0x${string}` | undefined;
  if (!privateKey) { console.error('ERROR: TEST_EXECUTOR_PRIVATE_KEY required'); process.exit(1); }
  const account = privateKeyToAccount(privateKey);

  log('SYSTEM', `Chain: Unichain Sepolia (${CHAIN_ID}) | Executor: ${account.address}`);
  const [ethBal, usdcBal] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({ address: USDC_ADDRESS, abi: ERC20_BALANCE_ABI, functionName: 'balanceOf', args: [account.address] }),
  ]);
  log('SYSTEM', `Balances: ${formatEther(ethBal)} ETH | ${formatUnits(usdcBal, 6)} USDC`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // POOL DISCOVERY — All available ETH-USDC pools
  // ═══════════════════════════════════════════════════════════════
  log('POOL', '━━━ Discovering all ETH-USDC pools on Unichain Sepolia ━━━');
  const allPools = await discoverAllPools(CHAIN_ID, RPC_URL, ETH_ADDRESS, USDC_ADDRESS);
  if (allPools.length === 0) { console.error('ERROR: No pools found.'); process.exit(1); }

  for (const p of allPools) {
    const liq = Number(p.state.liquidity);
    const liqFmt = liq > 1e12 ? `${(liq / 1e12).toFixed(1)}T` : liq > 1e9 ? `${(liq / 1e9).toFixed(1)}B` : `${(liq / 1e6).toFixed(1)}M`;
    log('POOL', `  fee=${p.fee} (${feePct(p.fee)}) tickSpacing=${p.tickSpacing} | tick=${p.state.tick} | liquidity=${liqFmt}`);
  }
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: Forum Setup
  // ═══════════════════════════════════════════════════════════════
  log('FORUM', '━━━ Phase 1: Forum Setup ━━━');
  log('FORUM', `Forum: "Optimize ETH-USDC trading strategy" | Quorum: 60%`);
  log('ALPHA', `Joined (strategy: ${AGENTS.alpha.strategy})`);
  log('BETA', `Joined (strategy: ${AGENTS.beta.strategy})`);
  log('GAMMA', `Joined (strategy: ${AGENTS.gamma.strategy})`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: Proposal #1 — Alpha: swap, fee=100, 0.01 ETH
  // ═══════════════════════════════════════════════════════════════
  log('FORUM', '━━━ Phase 2: Proposal #1 — Market Swap (fee=100) ━━━');
  await sleep(200);

  const p1Params = { tokenIn: 'ETH', tokenOut: 'USDC', amount: '10000000000000000', slippage: 50, fee: 100 };

  log('ALPHA', `📋 Proposes: SWAP 0.01 ETH → USDC | fee=${p1Params.fee} (${feePct(p1Params.fee)}) | slippage=0.5%`);
  log('ALPHA', `   "Quick market swap on the lowest-fee pool. Maximum capital efficiency."`);
  await sleep(300);

  log('BETA', `💬 "The fee=100 pool only has ${(Number(allPools.find(p => p.fee === 100)?.state.liquidity ?? 0) / 1e12).toFixed(1)}T liquidity.`);
  log('BETA', `    I'd prefer the fee=3000 pool — it has ${(Number(allPools.find(p => p.fee === 3000)?.state.liquidity ?? 0) / 1e12).toFixed(0)}T liquidity.`);
  log('BETA', `    Also, a limit order would be safer than a market swap."`);
  await sleep(300);

  log('GAMMA', `💬 "Beta makes a good point about liquidity depth. But fee=3000 is`);
  log('GAMMA', `    expensive. The fee=500 pool has ${(Number(allPools.find(p => p.fee === 500)?.state.liquidity ?? 0) / 1e12).toFixed(1)}T liquidity`);
  log('GAMMA', `    and better cost. I'd vote no on this swap."`);
  await sleep(300);

  // Voting
  log('FORUM', '  Voting on Proposal #1...');
  const v1 = [
    { a: 'ALPHA', v: 'agree', r: 'Proposer — low fee is efficient' },
    { a: 'BETA', v: 'disagree', r: 'Fee=100 pool too shallow, wants limit order on fee=3000' },
    { a: 'GAMMA', v: 'disagree', r: 'Prefers fee=500 and limit order approach' },
  ];
  for (const x of v1) { log('VOTE', `${x.v === 'agree' ? '👍' : '👎'} ${x.a}: ${x.v.toUpperCase()} — "${x.r}"`); }
  log('SYSTEM', `Result: 1/3 agree (33%) — REJECTED ❌`);

  // Verify simulation
  const sim1 = await simulateProposal('swap', p1Params, account, publicClient as any);
  log('SYSTEM', `(Simulation: ${sim1 ? 'VALID ✓ — but agents chose not to execute' : 'would have reverted'})`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: Proposal #2 — Beta: limitOrder, fee=3000, 0.05 ETH
  // ═══════════════════════════════════════════════════════════════
  log('FORUM', '━━━ Phase 3: Proposal #2 — Limit Order (fee=3000, 0.05 ETH) ━━━');
  await sleep(200);

  const p2Params = {
    tokenIn: 'ETH', tokenOut: 'USDC', amount: '50000000000000000', // 0.05 ETH
    targetTick: -100, zeroForOne: true, fee: 3000,
  };

  log('BETA', `📋 Proposes: LIMIT ORDER 0.05 ETH → USDC | fee=${p2Params.fee} (${feePct(p2Params.fee)}) | tick=-100`);
  log('BETA', `   "Limit order on the deepest pool (fee=3000). Increased size to 0.05 ETH`);
  log('BETA', `    to capitalize on the deep liquidity."`);
  await sleep(300);

  log('ALPHA', `💬 "0.05 ETH is too aggressive — that's 5x what I proposed. I only`);
  log('ALPHA', `    have ${formatEther(ethBal)} ETH. And 0.3% fee eats into returns."`);
  await sleep(300);

  log('GAMMA', `💬 "I agree with the limit order approach, but the amount is too high`);
  log('GAMMA', `    and fee=3000 is expensive. Let's compromise: 0.01 ETH on fee=500."`);
  await sleep(300);

  // Voting
  log('FORUM', '  Voting on Proposal #2...');
  const v2 = [
    { a: 'BETA', v: 'agree', r: 'Proposer — deep liquidity justifies higher fee' },
    { a: 'ALPHA', v: 'disagree', r: 'Amount too large, fee too high' },
    { a: 'GAMMA', v: 'disagree', r: 'Agrees on limit order but wants fee=500 and smaller size' },
  ];
  for (const x of v2) { log('VOTE', `${x.v === 'agree' ? '👍' : '👎'} ${x.a}: ${x.v.toUpperCase()} — "${x.r}"`); }
  log('SYSTEM', `Result: 1/3 agree (33%) — REJECTED ❌`);

  const sim2 = await simulateProposal('limitOrder', p2Params, account, publicClient as any);
  log('SYSTEM', `(Simulation: ${sim2 ? 'VALID ✓ — but agents chose not to execute' : 'would have reverted (likely insufficient balance)'})`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: Proposal #3 — Gamma: limitOrder, fee=500, 0.01 ETH
  // ═══════════════════════════════════════════════════════════════
  log('FORUM', '━━━ Phase 4: Proposal #3 — Limit Order (fee=500, 0.01 ETH) — Compromise ━━━');
  await sleep(200);

  const p3Params = {
    tokenIn: 'ETH', tokenOut: 'USDC', amount: '10000000000000000', // 0.01 ETH
    targetTick: -100, zeroForOne: true, fee: 500,
  };

  const pool500 = allPools.find(p => p.fee === 500);
  log('GAMMA', `📋 Proposes: LIMIT ORDER 0.01 ETH → USDC | fee=${p3Params.fee} (${feePct(p3Params.fee)}) | tick=-100`);
  log('GAMMA', `   "Compromise: limit order (safe) + fee=500 pool (${(Number(pool500?.state.liquidity ?? 0) / 1e12).toFixed(1)}T`);
  log('GAMMA', `    liquidity, 5x cheaper than fee=3000) + original 0.01 ETH amount."`);
  await sleep(300);

  log('ALPHA', `💬 "This is reasonable. The fee=500 pool has good liquidity,`);
  log('ALPHA', `    the amount is conservative, and the limit order protects us. I'm in."`);
  await sleep(300);

  log('BETA', `💬 "I still prefer deeper liquidity, but fee=500 is a fair middle ground.`);
  log('BETA', `    The limit order mechanism addresses my volatility concern. Agreed."`);
  await sleep(300);

  // Voting
  log('FORUM', '  Voting on Proposal #3...');
  const v3 = [
    { a: 'GAMMA', v: 'agree', r: 'Proposer — balanced compromise' },
    { a: 'ALPHA', v: 'agree', r: 'Good balance of cost and safety' },
    { a: 'BETA', v: 'agree', r: 'Limit order on fee=500 is acceptable compromise' },
  ];
  for (const x of v3) { log('VOTE', `👍 ${x.a}: AGREE — "${x.r}"`); }
  log('SYSTEM', `Result: 3/3 agree (100%) — APPROVED ✅`);
  log('SYSTEM', `Consensus reached after 3 rounds of deliberation!`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // PHASE 5: Execution
  // ═══════════════════════════════════════════════════════════════
  log('FORUM', '━━━ Phase 5: Execution ━━━');
  await sleep(200);

  log('EXEC', '[1/3] Enriching proposal params...');
  const enriched = await enrichExecutionPayloadParams(
    'limitOrder', p3Params as Record<string, unknown>, CHAIN_ID, 'Optimize ETH-USDC trading strategy',
    { rpcUrl: RPC_URL, graphApiKey: process.env.GRAPH_API_KEY || undefined }
  );
  log('EXEC', `  currency0: ${enriched.currency0}`);
  log('EXEC', `  currency1: ${enriched.currency1}`);
  log('EXEC', `  fee: ${enriched.fee} (${feePct(enriched.fee as number)}) | tickSpacing: ${enriched.tickSpacing}`);
  log('EXEC', `  zeroForOne: ${enriched.zeroForOne} | targetTick: ${enriched.targetTick}`);
  log('EXEC', `  amountOutMinimum: ${enriched.amountOutMinimum}`);

  const deadline = Math.floor(Date.now() / 1000) + 1800;
  const finalPayload: ExecutionPayload = {
    proposalId: 'deliberation-proposal-3',
    forumId: 'deliberation-forum-1',
    executorEnsName: AGENTS.alpha.ens,
    action: 'limitOrder',
    params: { ...enriched, deadline } as any,
    chainId: CHAIN_ID,
    deadline,
    forumGoal: 'Optimize ETH-USDC trading strategy',
  };

  log('EXEC', '[2/3] Building calldata for Universal Router...');
  const { data, to, value } = buildCalldataForPayload(finalPayload);
  log('EXEC', `  to: ${to}`);
  log('EXEC', `  calldata: ${(data.length - 2) / 2} bytes`);
  log('EXEC', `  value: ${value ?? 0n} wei (${value ? formatEther(value) + ' ETH' : '0'})`);

  log('EXEC', '[3/3] Simulating on Unichain Sepolia...');
  try {
    const decoded = decodeFunctionData({ abi: UNIVERSAL_ROUTER_ABI, data });
    const args = decoded.args as [`0x${string}`, `0x${string}`[], bigint];
    await publicClient.simulateContract({
      address: to as Address,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args,
      account,
      value: value ?? 0n,
    });
    console.log('');
    log('✅', '══════════════════════════════════════════════════════════════');
    log('✅', ' SIMULATION SUCCESS — Transaction would execute on-chain');
    log('✅', '══════════════════════════════════════════════════════════════');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log('');
    log('❌', '══════════════════════════════════════════════════════════════');
    log('❌', ` SIMULATION FAILED: ${msg.slice(0, 200)}`);
    log('❌', '══════════════════════════════════════════════════════════════');
  }

  // ═══════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════
  console.log('');
  console.log('┌───────────────────────────────────────────────────────────────────┐');
  console.log('│                      Deliberation Summary                         │');
  console.log('├───────────────────────────────────────────────────────────────────┤');
  console.log('│ Round 1: Alpha → swap, fee=100 (0.01%), 0.01 ETH     → REJECTED │');
  console.log('│   Beta: "shallow liquidity"  Gamma: "fee=500 is better"          │');
  console.log('│                                                                   │');
  console.log('│ Round 2: Beta → limitOrder, fee=3000 (0.3%), 0.05 ETH → REJECTED │');
  console.log('│   Alpha: "too much capital"  Gamma: "fee too high"               │');
  console.log('│                                                                   │');
  console.log('│ Round 3: Gamma → limitOrder, fee=500 (0.05%), 0.01 ETH → APPROVED│');
  console.log('│   Compromise: limit order + mid-fee pool + conservative amount    │');
  console.log('│   → SIMULATED ON-CHAIN ✅                                        │');
  console.log('│                                                                   │');
  console.log('│ Parameters that changed through deliberation:                     │');
  console.log('│   • Action type:  swap → limitOrder                               │');
  console.log('│   • Fee tier:     100 → 3000 → 500 (0.01% → 0.3% → 0.05%)       │');
  console.log('│   • Amount:       0.01 ETH → 0.05 ETH → 0.01 ETH                │');
  console.log('│   • Target tick:  (none) → -100 → -100                            │');
  console.log('└───────────────────────────────────────────────────────────────────┘');
  console.log('');
}

main();
