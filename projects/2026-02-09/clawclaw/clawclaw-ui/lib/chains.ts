import { sepolia } from "wagmi/chains";
import { http } from "wagmi";
import { createConfig } from "wagmi";

/**
 * Wagmi chain configuration for AgentBridge
 * Uses Ethereum Sepolia as primary network
 */
export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

/** CCTP domain IDs for cross-chain transfers */
export const CCTP_DOMAINS = {
  ETHEREUM_SEPOLIA: 0,
  SOLANA_DEVNET: 5, // Solana domain ID in CCTP
} as const;

/** CCTP API endpoints */
export const CCTP_API = {
  TESTNET: "https://iris-api-sandbox.circle.com",
  MAINNET: "https://iris-api.circle.com",
} as const;
