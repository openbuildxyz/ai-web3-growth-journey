/**
 * Permit2 approval helpers for Uniswap v4 PositionManager.
 *
 * Before minting a position (addLiquidity), ERC-20 tokens must be approved to Permit2.
 * Native ETH does not need Permit2 approval.
 *
 * Flow: token.approve(PERMIT2, MAX) → PositionManager pulls via Permit2 internally.
 */

import type { Address, Hash, PublicClient, WalletClient } from 'viem';
import { PERMIT2_ADDRESS } from './client';

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
] as const;

const MAX_UINT256 = 2n ** 256n - 1n;

/**
 * Check if a token has sufficient Permit2 allowance. Returns true if allowance >= amount.
 * Native ETH (address(0)) always returns true.
 */
export async function hasPermit2Allowance(
  publicClient: PublicClient,
  token: Address,
  owner: Address,
  amount: bigint = MAX_UINT256
): Promise<boolean> {
  if (token === '0x0000000000000000000000000000000000000000') return true;
  const allowance = await publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner, PERMIT2_ADDRESS],
  });
  return allowance >= amount;
}

/**
 * Approve Permit2 to spend a token (max uint256). Skips native ETH.
 * Returns the tx hash or null if no approval was needed.
 */
export async function approvePermit2(
  publicClient: PublicClient,
  walletClient: WalletClient,
  token: Address,
  account: Address
): Promise<Hash | null> {
  if (token === '0x0000000000000000000000000000000000000000') return null;

  const allowance = await publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account, PERMIT2_ADDRESS],
  });

  if (allowance >= MAX_UINT256 / 2n) return null; // already approved

  const { request } = await publicClient.simulateContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [PERMIT2_ADDRESS, MAX_UINT256],
    account,
  });
  return walletClient.writeContract(request);
}

/**
 * Ensure Permit2 approvals for a pair of currencies before addLiquidity.
 * Skips native ETH (address(0)). Returns tx hashes for any approvals sent.
 */
export async function ensurePermit2Approvals(
  publicClient: PublicClient,
  walletClient: WalletClient,
  currency0: Address,
  currency1: Address,
  account: Address
): Promise<Hash[]> {
  const hashes: Hash[] = [];
  const h0 = await approvePermit2(publicClient, walletClient, currency0, account);
  if (h0) hashes.push(h0);
  const h1 = await approvePermit2(publicClient, walletClient, currency1, account);
  if (h1) hashes.push(h1);
  return hashes;
}
