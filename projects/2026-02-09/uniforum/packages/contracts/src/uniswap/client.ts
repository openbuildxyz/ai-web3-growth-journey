/**
 * Uniswap v4 Client
 *
 * Creates viem clients configured for Uniswap v4 interactions on Unichain.
 */

import { createPublicClient, createWalletClient, http, type Account, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { unichainSepolia, unichainMainnet } from '../chains';

/** Permit2 canonical address — same on all EVM chains */
export const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3' as `0x${string}`;

// Contract addresses from https://docs.uniswap.org/contracts/v4/deployments
export const UNISWAP_V4_ADDRESSES = {
  [unichainSepolia.id]: {
    poolManager: '0x00b036b58a818b1bc34d502d3fe730db729e62ac' as `0x${string}`,
    universalRouter: '0xf70536b3bcc1bd1a972dc186a2cf84cc6da6be5d' as `0x${string}`,
    positionManager: '0xf969aee60879c54baaed9f3ed26147db216fd664' as `0x${string}`,
    quoter: '0x56dcd40a3f2d466f48e7f48bdbe5cc9b92ae4472' as `0x${string}`,
    stateView: '0xc199f1072a74d4e905aba1a84d9a45e2546b6222' as `0x${string}`,
    permit2: PERMIT2_ADDRESS,
  },
  [unichainMainnet.id]: {
    poolManager: '0x1f98400000000000000000000000000000000004' as `0x${string}`,
    universalRouter: '0xef740bf23acae26f6492b10de645d6b98dc8eaf3' as `0x${string}`,
    positionManager: '0x4529a01c7a0410167c5740c487a8de60232617bf' as `0x${string}`,
    quoter: '0x333e3c607b141b18ff6de9f258db6e77fe7491e0' as `0x${string}`,
    stateView: '0x86e8631a016f9068c3f085faf484ee3f5fdee8f2' as `0x${string}`,
    permit2: PERMIT2_ADDRESS,
  },
} as const;

/**
 * Create a public client for reading from Uniswap
 */
export function createUniswapPublicClient(chain: Chain = unichainSepolia) {
  return createPublicClient({
    chain,
    transport: http(),
  });
}

/**
 * Create a wallet client for writing to Uniswap
 */
export function createUniswapWalletClient(
  privateKey: `0x${string}`,
  chain: Chain = unichainSepolia
) {
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain,
    transport: http(),
  });
}

/**
 * Create both public and wallet clients
 */
export function createUniswapClients(privateKey: `0x${string}`, chain: Chain = unichainSepolia) {
  const publicClient = createUniswapPublicClient(chain);
  const walletClient = createUniswapWalletClient(privateKey, chain);

  return {
    publicClient,
    walletClient,
    account: walletClient.account,
    chain,
    addresses: UNISWAP_V4_ADDRESSES[chain.id as keyof typeof UNISWAP_V4_ADDRESSES],
  };
}

/**
 * Get contract addresses for a specific chain
 */
export function getUniswapAddresses(chainId: number) {
  const addresses = UNISWAP_V4_ADDRESSES[chainId as keyof typeof UNISWAP_V4_ADDRESSES];
  if (!addresses) {
    throw new Error(`Uniswap v4 not deployed on chain ${chainId}`);
  }
  return addresses;
}
