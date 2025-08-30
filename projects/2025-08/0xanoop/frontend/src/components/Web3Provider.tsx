import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  console.warn("VITE_ALCHEMY_API_KEY is not set. Falling back to public RPC. For better performance and reliability, please add your Alchemy API key to your .env file.");
}

const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(alchemyApiKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
    [sepolia.id]: http(alchemyApiKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
    [polygon.id]: http(alchemyApiKey ? `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
  },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}