'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { ThemeProvider, useTheme } from 'next-themes'
import { config, rainbowKitTheme } from '@/lib/wagmi'
import { useEffect, useState } from 'react'

/**
 * Create a single QueryClient instance for the entire application.
 * This client manages the cache for wagmi's state management.
 */
const queryClient = new QueryClient()

/**
 * RainbowKit wrapper that applies the correct theme based on next-themes.
 * This component must be inside ThemeProvider to access the theme context.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns RainbowKit provider with theme applied
 */
function RainbowKitWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use dark theme as default during SSR and until mounted
  const currentTheme =
    mounted && resolvedTheme === 'light'
      ? rainbowKitTheme.lightMode
      : rainbowKitTheme.darkMode

  return (
    <RainbowKitProvider theme={currentTheme} initialChain={undefined}>
      {children}
    </RainbowKitProvider>
  )
}

/**
 * Providers component that wraps the application with necessary providers
 * for RainbowKit wallet integration.
 *
 * Provider hierarchy (from outer to inner):
 * 1. ThemeProvider - Manages theme state (light/dark mode)
 * 2. QueryClientProvider - Manages React Query cache for wagmi
 * 3. WagmiProvider - Provides wagmi configuration and wallet state
 * 4. RainbowKitWrapper - Dynamically applies RainbowKit theme based on current theme
 *
 * Requirements: 1.3, 1.5, 5.2, 5.3
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The application components to wrap with providers
 * @returns Provider hierarchy wrapping the application
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config} reconnectOnMount={true}>
          <RainbowKitWrapper>{children}</RainbowKitWrapper>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
