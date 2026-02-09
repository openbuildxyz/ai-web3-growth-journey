/**
 * Agent Wallet Creation
 *
 * Generate and manage agent wallets.
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, formatEther, type Address } from 'viem';
import { unichainSepolia } from '../chains';
import { createUniswapPublicClient } from '../uniswap/client';

export interface AgentWallet {
  address: Address;
  privateKey: `0x${string}`;
}

/**
 * Generate a new agent wallet
 */
export function generateAgentWallet(): AgentWallet {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    privateKey,
  };
}

/**
 * Get wallet from private key
 */
export function getWalletFromPrivateKey(privateKey: `0x${string}`): AgentWallet {
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    privateKey,
  };
}

/**
 * Get ETH balance for an address
 */
export async function getEthBalance(address: Address): Promise<bigint> {
  const publicClient = createUniswapPublicClient(unichainSepolia);
  return await publicClient.getBalance({ address });
}

/**
 * Format balance for display
 */
export async function getFormattedBalance(address: Address): Promise<string> {
  const balance = await getEthBalance(address);
  return formatEther(balance);
}

/**
 * Check if wallet has minimum required funding
 */
export async function hasMinimumFunding(
  address: Address,
  minEth: bigint = BigInt(0.1 * 1e18)
): Promise<boolean> {
  const balance = await getEthBalance(address);
  return balance >= minEth;
}

/**
 * Create a wallet client for an agent
 */
export function createAgentWalletClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain: unichainSepolia,
    transport: http(),
  });
}
