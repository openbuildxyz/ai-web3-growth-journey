import {
  useAccount,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'
import type { WalletClient } from 'viem'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth'

/**
 * Return type for the useWallet hook
 */
export interface UseWalletReturn {
  /** The connected wallet address, or undefined if not connected */
  account: `0x${string}` | undefined
  /** The current chain ID, or null if not connected */
  chainId: number | null
  /** Whether a wallet is currently connected */
  isConnected: boolean
  /** Function to disconnect the wallet and clear authentication */
  disconnect: () => void
  /** Function to switch to a different network/chain */
  switchNetwork: (targetChainId: number) => Promise<boolean>
  /** The ethers JsonRpcSigner instance (for write operations) */
  signer: JsonRpcSigner | undefined
  /** The ethers BrowserProvider instance (for read operations) */
  provider: BrowserProvider | undefined
}

/**
 * Custom hook that provides wallet connection functionality using wagmi.
 * This hook wraps wagmi hooks to provide ethers.js compatible provider and signer
 * by converting viem's WalletClient to ethers BrowserProvider.
 *
 * @returns {UseWalletReturn} Wallet state and methods for interacting with the connected wallet
 *
 * @example
 * ```tsx
 * const { account, isConnected, disconnect, switchNetwork, provider, signer } = useWallet()
 *
 * if (isConnected && provider) {
 *   const balance = await provider.getBalance(account)
 * }
 * ```
 */
export default function useWallet(): UseWalletReturn {
  const { address, isConnected, chain } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()
  const { clearAuth } = useAuthStore()

  // Convert viem WalletClient to ethers BrowserProvider
  const provider = useMemo(() => {
    if (!walletClient) return undefined
    return new BrowserProvider(walletClient)
  }, [walletClient])

  // Create a proxy signer that lazily gets the actual signer when needed
  const signer = useMemo(() => {
    if (!provider || !address) return undefined
    // Return the provider itself - write functions will call getSigner() internally
    return provider as any as JsonRpcSigner
  }, [provider, address])

  /**
   * Disconnects the wallet and clears authentication state.
   * This will trigger the wallet to disconnect and remove the authentication token.
   */
  const disconnect = (): void => {
    wagmiDisconnect()
    clearAuth()
  }

  /**
   * Switches to a different network/chain.
   * Requests the wallet to switch to the specified chain ID.
   *
   * @param {number} targetChainId - The chain ID to switch to
   * @returns {Promise<boolean>} Promise that resolves to true if successful, false otherwise
   */
  const switchNetwork = async (targetChainId: number): Promise<boolean> => {
    try {
      await switchChain({ chainId: targetChainId })
      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      return false
    }
  }

  return {
    account: address,
    chainId: chain?.id ?? null,
    isConnected,
    disconnect,
    switchNetwork,
    signer,
    provider,
  }
}
