"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"

type WalletContextType = {
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  isConnected: boolean
  signer: ethers.JsonRpcSigner | null
  provider: ethers.BrowserProvider | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  error: string | null
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  signer: null,
  provider: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  error: null,
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const { toast } = useToast()

  // 使用useCallback包装connectWallet和disconnectWallet函数
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another compatible wallet.",
        variant: "destructive",
      })
      setError("No Ethereum wallet found. Please install MetaMask or another compatible wallet.")
      return
    }

    console.log("Connecting wallet...")
    setIsConnecting(true)
    setError(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = signer.address
      const balance = ethers.formatEther(await provider.getBalance(address))
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      console.log("Wallet connected:", { address, chainId })

      setProvider(provider)
      setSigner(signer)
      setAddress(address)
      setBalance(balance)
      setChainId(chainId)
      setIsConnected(true)

      // 保存连接状态到localStorage
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", address)

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }, [toast])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setBalance(null)
    setChainId(null)
    setIsConnected(false)
    setProvider(null)
    setSigner(null)

    // 清除localStorage
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }, [toast])

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log("Checking wallet connection...")
      const savedConnected = localStorage.getItem("walletConnected") === "true"

      if (window.ethereum && savedConnected) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()

          if (accounts.length > 0) {
            const signer = await provider.getSigner()
            const address = accounts[0].address
            const balance = ethers.formatEther(await provider.getBalance(address))
            const network = await provider.getNetwork()
            const chainId = Number(network.chainId)

            console.log("Wallet reconnected:", { address, chainId })

            setProvider(provider)
            setSigner(signer)
            setAddress(address)
            setBalance(balance)
            setChainId(chainId)
            setIsConnected(true)
          } else {
            // 清除localStorage
            localStorage.removeItem("walletConnected")
            localStorage.removeItem("walletAddress")
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error)
          // 清除localStorage
          localStorage.removeItem("walletConnected")
          localStorage.removeItem("walletAddress")
        }
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Accounts changed:", accounts)
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet()
        } else if (accounts[0] !== address) {
          // User switched accounts - reconnect with new account
          connectWallet()
        }
      }

      const handleChainChanged = () => {
        console.log("Chain changed, reloading...")
        // Refresh when chain changes
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [address, connectWallet, disconnectWallet])

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        chainId,
        isConnecting,
        isConnected,
        signer,
        provider,
        connectWallet,
        disconnectWallet,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

