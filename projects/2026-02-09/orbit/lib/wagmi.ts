import { createConfig, http, injected } from 'wagmi';
import { sepolia } from 'wagmi/chains';

/**
 * Wagmi config: injected wallet only (MetaMask, etc.).
 * No WalletConnect / Web3Modal — no project ID or 403s.
 */
export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});
