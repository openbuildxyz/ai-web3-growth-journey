"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, CheckCircle, AlertCircle } from "lucide-react"

interface WalletConnectProps {
  onConnect: (connected: boolean, account: string) => void
  isConnected: boolean
  account: string
}

export default function WalletConnect({ onConnect, isConnected, account }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("请安装MetaMask钱包")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        // 切换到以太坊主网或测试网
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x1" }], // 以太坊主网
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // 如果网络不存在，添加网络
            console.log("需要添加网络")
          }
        }

        onConnect(true, accounts[0])
      }
    } catch (error: any) {
      setError(error.message || "连接钱包失败")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    onConnect(false, "")
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <CardTitle className="text-lg">钱包已连接</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-2">
              {formatAddress(account)}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" onClick={disconnectWallet}>
            断开连接
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-purple-600" />
        <CardTitle>连接MetaMask钱包</CardTitle>
        <CardDescription>使用去中心化身份认证，确保数据安全和隐私保护</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        <Button onClick={connectWallet} disabled={isConnecting} className="w-full">
          {isConnecting ? "连接中..." : "连接MetaMask"}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <p>确保您已安装MetaMask浏览器扩展</p>
        </div>
      </CardContent>
    </Card>
  )
}
