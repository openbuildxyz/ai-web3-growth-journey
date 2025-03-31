"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./wallet-provider"
import { useContracts } from "./contracts-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign } from "lucide-react"
import { ethers } from "ethers"
import { USDC_DECIMALS } from "@/lib/constants"

export function GetUSDCButton() {
  const { isConnected, address, connectWallet } = useWallet()
  const { usdc, fetchUSDCBalance } = useContracts()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState("0")
  const [hasEnoughUSDC, setHasEnoughUSDC] = useState(false)

  // 获取USDC余额并检查是否已经有足够的USDC
  useEffect(() => {
    const checkBalance = async () => {
      if (address && usdc) {
        try {
          const balance = await fetchUSDCBalance(address)
          setUsdcBalance(balance)

          // 检查余额是否大于等于5000
          setHasEnoughUSDC(Number.parseFloat(balance) >= 5000)
        } catch (error) {
          console.error("Error checking USDC balance:", error)
        }
      }
    }

    checkBalance()

    // 每10秒检查一次余额
    const interval = setInterval(checkBalance, 10000)

    return () => clearInterval(interval)
  }, [address, usdc, fetchUSDCBalance])

  const handleGetUSDC = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      })
      await connectWallet()
      return
    }

    if (!usdc || !address) {
      toast({
        title: "Error",
        description: "USDC contract not initialized or wallet not connected",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // 调用USDC合约的mint方法，获取10,000 USDC
      const amount = ethers.parseUnits("10000", USDC_DECIMALS) // 使用USDC_DECIMALS

      console.log("Minting 10,000 USDC to", address)
      const tx = await usdc.mint(address, amount)

      toast({
        title: "Transaction Submitted",
        description: "Please wait for the transaction to be confirmed",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "You have received 10,000 USDC!",
      })

      // 更新余额
      const newBalance = await fetchUSDCBalance(address)
      setUsdcBalance(newBalance)
      setHasEnoughUSDC(Number.parseFloat(newBalance) >= 5000)
    } catch (error: any) {
      console.error("Error getting USDC:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to get USDC. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGetUSDC}
      disabled={isLoading || hasEnoughUSDC}
      variant="outline"
      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Getting USDC...
        </>
      ) : hasEnoughUSDC ? (
        <>
          <DollarSign className="mr-2 h-4 w-4" />
          Enough USDC
        </>
      ) : (
        <>
          <DollarSign className="mr-2 h-4 w-4" />
          Get 10,000 USDC
        </>
      )}
    </Button>
  )
}

