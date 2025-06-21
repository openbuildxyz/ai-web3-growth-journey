import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  Chain,
} from 'wagmi/chains';

// Define 0G Network Testnet
export const zeroGTestnet: Chain = {
  id: 16601,
  name: '0G网络测试网',
  nativeCurrency: {
    name: 'A0GI',
    symbol: 'A0GI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
    public: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://explorer-testnet.0g.ai',
    },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'MCP Arena',
  projectId: 'mcp-arena-project-id',
  chains: [
    zeroGTestnet, // Set 0G Network Testnet as the primary chain
    // Removed sepolia as we're using 0G Network Testnet exclusively
  ],
  ssr: true,
});
