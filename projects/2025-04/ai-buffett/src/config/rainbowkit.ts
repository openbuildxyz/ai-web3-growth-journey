import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

// Configure RainbowKit
export const rainbowKitConfig = getDefaultConfig({
  appName: 'AI Buffett',
  projectId: '1dc651922c28e5832c26db5e30bba09c', // Get your project ID from WalletConnect Cloud: https://cloud.walletconnect.com/
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false, // Set to true if using server-side rendering
});
