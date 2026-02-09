import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

/**
 * Wagmi configuration for the Agent Market application.
 *
 * This configuration uses RainbowKit's getDefaultConfig to automatically set up
 * popular wallet connectors including MetaMask, WalletConnect, Coinbase Wallet,
 * and Rainbow Wallet.
 *
 * @see https://rainbowkit.com/docs/installation
 */
/**
 * WalletConnect Project ID is required for WalletConnect v2 support.
 * If not provided, WalletConnect will not be available as a connection option.
 * Get your project ID from https://cloud.walletconnect.com
 */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not be available. ' +
      'Get your project ID from https://cloud.walletconnect.com',
  )
}

export const config = getDefaultConfig({
  appName: 'Agent Market',
  projectId: projectId || 'dummy-project-id', // Use dummy ID if not provided to prevent errors
  chains: [sepolia],
  ssr: true, // Enable Server-Side Rendering for Next.js compatibility
})

/**
 * RainbowKit theme configuration matching the Agent Market design system.
 *
 * The theme uses the brand's primary color (cyan/turquoise) as the accent color,
 * medium border radius for a modern look, and system font stack for native feel.
 *
 * Both light and dark themes are configured to match the application's theme system.
 */
export const rainbowKitTheme = {
  lightMode: lightTheme({
    accentColor: 'hsl(175, 80%, 50%)', // Brand primary color (cyan/turquoise)
    accentColorForeground: 'hsl(220, 20%, 6%)', // Dark background for contrast
    borderRadius: 'medium',
    fontStack: 'system',
  }),
  darkMode: darkTheme({
    accentColor: 'hsl(175, 80%, 50%)', // Brand primary color (cyan/turquoise)
    accentColorForeground: 'hsl(220, 20%, 6%)', // Dark background for contrast
    borderRadius: 'medium',
    fontStack: 'system',
  }),
}
