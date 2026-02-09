'use client'

import { useAccount, useConnection } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

import AuthDialog from '../../AuthDialog'
import { useAuthStore } from '@/stores/auth'

/**
 * Wallet component that integrates RainbowKit's ConnectButton with authentication.
 *
 * Automatically triggers AuthDialog when wallet connects without authentication.
 * Clears authentication when wallet disconnects.
 *
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.2, 9.1, 9.4
 */
export default function Wallet() {
  const { isConnected, chain } = useConnection()
  const { address } = useAccount()
  const storedAddress = useAuthStore((state) => state.address)
  const isAuthenticatedFor = useAuthStore((state) => state.isAuthenticatedFor)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const isUnsupportedNetwork = isConnected && chain && chain.id !== sepolia.id

  // Track when wagmi has finished initial connection check
  useEffect(() => {
    if (isConnected || hasInitialized) {
      setHasInitialized(true)
    }
  }, [isConnected, hasInitialized])

  // Trigger auth dialog when connected but not authenticated for current address
  useEffect(() => {
    if (isConnected && !isAuthenticatedFor(address) && !isUnsupportedNetwork) {
      setShowAuthDialog(true)
    }
  }, [address, isConnected, isAuthenticatedFor, isUnsupportedNetwork])

  // Clear auth on disconnect - but only after wagmi has initialized
  // This prevents clearing auth during the initial reconnection phase
  useEffect(() => {
    if (hasInitialized && !isConnected && isAuthenticatedFor(storedAddress)) {
      clearAuth()
    }
  }, [
    clearAuth,
    hasInitialized,
    isConnected,
    isAuthenticatedFor,
    storedAddress,
  ])

  // Clear auth when connected address changes
  useEffect(() => {
    if (
      hasInitialized &&
      isConnected &&
      address &&
      storedAddress &&
      address.toLowerCase() !== storedAddress.toLowerCase()
    ) {
      clearAuth()
    }
  }, [address, clearAuth, hasInitialized, isConnected, storedAddress])

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />

        {isUnsupportedNetwork && (
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
            <span className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>
                Unsupported network. Please switch to Sepolia testnet.
              </span>
            </span>
          </div>
        )}
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </>
  )
}
