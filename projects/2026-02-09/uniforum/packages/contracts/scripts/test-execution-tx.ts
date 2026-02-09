/**
 * Test that execution calldata can be generated, simulated, and optionally sent.
 *
 * 1. Builds calldata from a sample swap payload
 * 2. Simulates the tx on Unichain Sepolia (validates encoding and contract acceptance)
 * 3. If TEST_EXECUTOR_PRIVATE_KEY is set, sends the tx and waits for receipt
 *
 * Usage:
 *   pnpm --filter @uniforum/contracts run test:execution-tx
 *   TEST_EXECUTOR_PRIVATE_KEY=0x... pnpm --filter @uniforum/contracts run test:execution-tx
 *
 * Requires: RPC for chain (default https://sepolia.unichain.org). Override with UNICHAIN_SEPOLIA_RPC_URL.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  http,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { unichainSepolia } from '../src/chains';
import {
  buildCalldataForPayload,
  UNIVERSAL_ROUTER_ABI,
  type ExecutionPayload,
} from './build-execution-calldata';

// Load root .env.local so TEST_EXECUTOR_PRIVATE_KEY etc. are available when run via pnpm from repo root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const SAMPLE_SWAP_PAYLOAD: ExecutionPayload = {
  proposalId: '00000000-0000-0000-0000-000000000001',
  forumId: '00000000-0000-0000-0000-000000000002',
  executorEnsName: 'creator.uniforum.eth',
  action: 'swap',
  params: {
    tokenIn: 'ETH',
    tokenOut: 'USDC',
    amount: '100000000000000000',
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
  forumGoal: 'Swap 0.1 ETH for USDC',
};

const RPC_URL = process.env.UNICHAIN_SEPOLIA_RPC_URL ?? 'https://sepolia.unichain.org';

async function main() {
  console.log('=== Test: Generate, simulate, and optionally send execution tx ===\n');

  const { data, to, action, value } = buildCalldataForPayload(SAMPLE_SWAP_PAYLOAD);
  console.log('1. Calldata generated');
  console.log('   action:', action);
  console.log('   to:', to);
  console.log('   data length:', (data.length - 2) / 2, 'bytes');
  if (value != null) console.log('   value (wei):', value.toString());
  console.log('');

  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: unichainSepolia, transport });

  const privateKey = process.env.TEST_EXECUTOR_PRIVATE_KEY as `0x${string}` | undefined;
  const account = privateKey
    ? privateKeyToAccount(privateKey)
    : // Dummy account for simulation-only (no send)
      privateKeyToAccount(
        '0x0000000000000000000000000000000000000000000000000000000000000001' as `0x${string}`
      );

  const decoded = decodeFunctionData({ abi: UNIVERSAL_ROUTER_ABI, data });
  if (decoded.functionName !== 'execute') {
    console.error('Unexpected decoded function:', decoded.functionName);
    process.exit(1);
  }
  const args = decoded.args as [`0x${string}`, `0x${string}`[], bigint];

  console.log('2. Simulating tx on', unichainSepolia.name, '...');
  try {
    const { request } = await publicClient.simulateContract({
      address: to as Address,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args,
      account,
      value: value ?? 0n,
    });
    console.log('   Simulation: OK (no revert)\n');
  } catch (err) {
    console.error('   Simulation failed:', err instanceof Error ? err.message : err);
    console.log('\n   Note: With placeholder pool (currency0/1 = 0x0), the contract may revert.');
    console.log('   Use real WETH/USDC addresses and amountOutMinimum for a valid swap.\n');
    if (!privateKey) process.exit(1);
  }

  if (!privateKey) {
    console.log('3. Send skipped (set TEST_EXECUTOR_PRIVATE_KEY to broadcast)');
    return;
  }

  console.log('3. Sending tx...');
  const walletClient = createWalletClient({ account, chain: unichainSepolia, transport });
  try {
    const hash = await walletClient.writeContract({
      address: to as Address,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args,
      value: value ?? 0n,
    });
    console.log('   Tx hash:', hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('   Status:', receipt.status);
    console.log('   Block:', receipt.blockNumber);
    if (unichainSepolia.blockExplorers?.default?.url) {
      console.log('   Explorer:', `${unichainSepolia.blockExplorers.default.url}/tx/${hash}`);
    }
  } catch (err) {
    console.error('   Send failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
