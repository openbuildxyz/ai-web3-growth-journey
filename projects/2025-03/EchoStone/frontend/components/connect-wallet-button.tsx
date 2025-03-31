"use client"

import { useState } from "react"
import { Wallet, Loader2, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "./wallet-provider"
import { useToast } from "@/components/ui/use-toast"

export function ConnectWalletButton() {
  const { address, balance, chainId, isConnecting, isConnected, connectWallet, disconnectWallet } = useWallet()
  const { toast } = useToast()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Format address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Get network name based on chainId
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 5:
        return "Goerli"
      case 11155111:
        return "Sepolia"
      case 137:
        return "Polygon"
      case 80001:
        return "Mumbai"
      case 42161:
        return "Arbitrum"
      case 10:
        return "Optimism"
      case 31337:
        return "Hardhat"
      default:
        return `Chain ID: ${chainId}`
    }
  }

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
      setIsDropdownOpen(false)
    }
  }

  const openExplorer = () => {
    if (address) {
      let explorerUrl = ""

      // Select explorer based on chainId
      switch (chainId) {
        case 1:
          explorerUrl = `https://etherscan.io/address/${address}`
          break
        case 5:
          explorerUrl = `https://goerli.etherscan.io/address/${address}`
          break
        case 11155111:
          explorerUrl = `https://sepolia.etherscan.io/address/${address}`
          break
        case 137:
          explorerUrl = `https://polygonscan.com/address/${address}`
          break
        case 80001:
          explorerUrl = `https://mumbai.polygonscan.com/address/${address}`
          break
        case 42161:
          explorerUrl = `https://arbiscan.io/address/${address}`
          break
        case 10:
          explorerUrl = `https://optimistic.etherscan.io/address/${address}`
          break
        case 31337:
          toast({
            title: "Local Network",
            description: "Explorer not available for local development network",
          })
          return
        default:
          toast({
            title: "Explorer not available",
            description: "Block explorer not available for this network",
            variant: "destructive",
          })
          return
      }

      window.open(explorerUrl, "_blank")
      setIsDropdownOpen(false)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setIsDropdownOpen(false)
  }

  if (!isConnected) {
    return (
      <Button
        onClick={() => {
          console.log("Connect wallet button clicked")
          connectWallet().catch((err) => {
            console.error("Error in connect wallet button click:", err)
          })
        }}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    )
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {address ? formatAddress(address) : "Connected"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{address ? formatAddress(address) : "Connected"}</p>
          <p className="text-xs text-muted-foreground">{chainId ? getNetworkName(chainId) : "Unknown Network"}</p>
          {balance && <p className="text-xs font-medium">{Number.parseFloat(balance).toFixed(4)} ETH</p>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddressToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Address</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>View on Explorer</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

