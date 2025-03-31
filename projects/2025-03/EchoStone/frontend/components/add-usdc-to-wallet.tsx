"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { USDC_ADDRESS } from "@/lib/constants"

export function AddUSDCToWallet() {
  const { toast } = useToast()

  const handleAddUSDCToWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask or use a compatible wallet.",
        variant: "destructive",
      })
      return
    }

    try {
      // 请求添加代币到MetaMask
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: USDC_ADDRESS,
            symbol: "USDC",
            decimals: 18,
            image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
          },
        },
      })

      toast({
        title: "Success",
        description: "USDC token has been added to your wallet",
      })
    } catch (error: any) {
      console.error("Error adding USDC to wallet:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add USDC to wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      onClick={handleAddUSDCToWallet}
      variant="outline"
      size="sm"
      className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      Add to Wallet
    </Button>
  )
}

