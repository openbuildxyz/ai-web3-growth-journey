/**
 * Approve Permit2 to spend USDC (and optionally WETH) for the test executor wallet.
 * Also approves Universal Router on Permit2 for the allowance transfer.
 *
 * This is required before:
 *  - USDC → ETH swap (Universal Router pulls USDC via Permit2)
 *  - addLiquidity with USDC side (PositionManager pulls USDC via Permit2)
 *
 * Usage:
 *   bun run scripts/approve-permit2.ts
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createPublicClient, createWalletClient, http, formatUnits, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { unichainSepolia } from '../src/chains';
import { PERMIT2_ADDRESS, getUniswapAddresses } from '../src/uniswap/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const RPC_URL = process.env.UNICHAIN_SEPOLIA_RPC_URL ?? 'https://sepolia.unichain.org';
const CHAIN_ID = 1301;

const USDC = '0x31d0220469e10c4E71834a79b1f276d740d3768F' as Address;
const WETH = '0x4200000000000000000000000000000000000006' as Address;

const MAX_UINT256 = 2n ** 256n - 1n;
const MAX_UINT160 = 2n ** 160n - 1n;
const MAX_UINT48 = 2n ** 48n - 1n;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const PERMIT2_ABI = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint160' },
      { name: 'expiration', type: 'uint48' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'address' },
      { name: '', type: 'address' },
    ],
    name: 'allowance',
    outputs: [
      { name: 'amount', type: 'uint160' },
      { name: 'expiration', type: 'uint48' },
      { name: 'nonce', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

async function main() {
  const privateKey = process.env.TEST_EXECUTOR_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.error('ERROR: TEST_EXECUTOR_PRIVATE_KEY not set in .env.local');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: unichainSepolia, transport });
  const walletClient = createWalletClient({ chain: unichainSepolia, transport, account });
  const addresses = getUniswapAddresses(CHAIN_ID);

  console.log(`=== Permit2 Approval Setup ===`);
  console.log(`Executor: ${account.address}`);
  console.log(`Chain: Unichain Sepolia (${CHAIN_ID})`);
  console.log(`Permit2: ${PERMIT2_ADDRESS}`);
  console.log(`Universal Router: ${addresses.universalRouter}`);
  console.log(`Position Manager: ${addresses.positionManager}\n`);

  // Check balances
  const [ethBalance, usdcBalance] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({ address: USDC, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address] }),
  ]);
  console.log(`ETH balance:  ${formatUnits(ethBalance, 18)} ETH`);
  console.log(`USDC balance: ${formatUnits(usdcBalance, 6)} USDC\n`);

  // Step 1: Approve Permit2 to spend USDC (ERC-20 level)
  console.log('--- Step 1: USDC.approve(Permit2, MAX) ---');
  const usdcAllowance = await publicClient.readContract({
    address: USDC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account.address, PERMIT2_ADDRESS],
  });
  if (usdcAllowance >= MAX_UINT256 / 2n) {
    console.log('  Already approved. Skipping.\n');
  } else {
    console.log(`  Current allowance: ${usdcAllowance}`);
    console.log('  Sending USDC.approve(Permit2, MAX_UINT256)...');
    const hash = await walletClient.writeContract({
      address: USDC,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PERMIT2_ADDRESS, MAX_UINT256],
    });
    console.log(`  Tx: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  Status: ${receipt.status === 'success' ? 'SUCCESS' : 'FAILED'}\n`);
  }

  // Step 2: Approve Universal Router on Permit2 (Permit2 allowance level for swaps)
  console.log('--- Step 2: Permit2.approve(USDC, UniversalRouter) ---');
  const [urAmount, urExpiry] = await publicClient.readContract({
    address: PERMIT2_ADDRESS,
    abi: PERMIT2_ABI,
    functionName: 'allowance',
    args: [account.address, USDC, addresses.universalRouter as Address],
  });
  if (urAmount > 0n && urExpiry > BigInt(Math.floor(Date.now() / 1000))) {
    console.log(`  Already approved (amount=${urAmount}, expires=${urExpiry}). Skipping.\n`);
  } else {
    console.log('  Sending Permit2.approve(USDC, UniversalRouter, MAX, MAX)...');
    const hash = await walletClient.writeContract({
      address: PERMIT2_ADDRESS,
      abi: PERMIT2_ABI,
      functionName: 'approve',
      args: [USDC, addresses.universalRouter as Address, MAX_UINT160, MAX_UINT48],
    });
    console.log(`  Tx: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  Status: ${receipt.status === 'success' ? 'SUCCESS' : 'FAILED'}\n`);
  }

  // Step 3: Approve PositionManager on Permit2 (for addLiquidity)
  console.log('--- Step 3: Permit2.approve(USDC, PositionManager) ---');
  const [pmAmount, pmExpiry] = await publicClient.readContract({
    address: PERMIT2_ADDRESS,
    abi: PERMIT2_ABI,
    functionName: 'allowance',
    args: [account.address, USDC, addresses.positionManager as Address],
  });
  if (pmAmount > 0n && pmExpiry > BigInt(Math.floor(Date.now() / 1000))) {
    console.log(`  Already approved (amount=${pmAmount}, expires=${pmExpiry}). Skipping.\n`);
  } else {
    console.log('  Sending Permit2.approve(USDC, PositionManager, MAX, MAX)...');
    const hash = await walletClient.writeContract({
      address: PERMIT2_ADDRESS,
      abi: PERMIT2_ABI,
      functionName: 'approve',
      args: [USDC, addresses.positionManager as Address, MAX_UINT160, MAX_UINT48],
    });
    console.log(`  Tx: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  Status: ${receipt.status === 'success' ? 'SUCCESS' : 'FAILED'}\n`);
  }

  console.log('=== Done! You can now re-run the simulation: ===');
  console.log('  pnpm --filter @uniforum/contracts run test:execution-all-actions');
}

main().catch(console.error);
