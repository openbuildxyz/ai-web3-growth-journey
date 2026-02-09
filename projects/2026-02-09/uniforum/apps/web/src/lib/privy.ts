/**
 * Privy Configuration
 *
 * Privy handles authentication and wallet management.
 * Users can sign in with email, social, or existing wallet.
 *
 * Environment Setup:
 * - NEXT_PUBLIC_PRIVY_APP_ID: Your Privy App ID (same across all environments)
 * - NEXT_PUBLIC_PRIVY_APP_CLIENT_ID: Client ID for this specific environment
 *   Create separate clients for dev/staging/prod in Privy Dashboard:
 *   Dashboard > Configuration > App settings > Clients
 *
 * Each client can have different:
 * - Allowed origins (localhost:3000 for dev, uniforum.up.railway.app for prod)
 * - Session durations
 * - Cookie settings
 */

import type { PrivyClientConfig } from '@privy-io/react-auth';
import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// Define Unichain Sepolia
export const unichainSepolia = {
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.unichain.org'] },
  },
  blockExplorers: {
    default: { name: 'Uniscan', url: 'https://sepolia.uniscan.xyz' },
  },
  testnet: true,
} as const;

// Define Unichain Mainnet
export const unichainMainnet = {
  id: 130,
  name: 'Unichain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.unichain.org'] },
  },
  blockExplorers: {
    default: { name: 'Uniscan', url: 'https://uniscan.xyz' },
  },
  testnet: false,
} as const;

/**
 * Privy configuration
 */
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://e3ca-2001-f40-9a4-9909-c174-3ed7-2e4a-bb9e.ngrok-free.app';

export const privyConfig: PrivyClientConfig = {
  // Appearance
  appearance: {
    theme: 'dark',
    accentColor: '#FF007A', // Uniswap pink
    logo: `${APP_URL.replace(/\/$/, '')}/logo.png`,
    showWalletLoginFirst: false, // Show email/social first for better onboarding
  },

  // Login methods - prioritize email for better onboarding
  loginMethods: ['email', 'wallet'],

  // Embedded wallets - create for users without wallets
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
  },

  // Default chain
  defaultChain: unichainSepolia,

  // Supported chains
  supportedChains: [unichainSepolia, unichainMainnet, mainnet],

  // Funding - show how to get testnet ETH
  fundingMethodConfig: {
    moonpay: {
      useSandbox: true, // Use sandbox for testing
    },
  },
};

/**
 * Wagmi configuration (used alongside Privy)
 */
export const wagmiConfig = createConfig({
  chains: [unichainSepolia, unichainMainnet, mainnet],
  transports: {
    [unichainSepolia.id]: http(),
    [unichainMainnet.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
