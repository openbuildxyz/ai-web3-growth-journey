// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import {
  ContractContext,
  pixelContractConfig
} from '@/lib/context/ContractContext'

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  monadTestnet
} from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

import App from './App.tsx'

const config = getDefaultConfig({
  appName: 'PixelGame',
  projectId: 'm89f61yfqM-Yk2WMpMwq3liE8Hn2RdUr',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia, monadTestnet]
  // ssr: true, // If your dApp uses server side rendering (SSR)
})
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <ContractContext.Provider value={pixelContractConfig}>
          <App />
        </ContractContext.Provider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
  // </StrictMode>
)
