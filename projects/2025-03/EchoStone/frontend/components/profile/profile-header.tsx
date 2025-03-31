"use client"

import { useContracts } from "@/components/contracts-provider"
import { GetUSDCButton } from "@/components/get-usdc-button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"
import { Award, Check, Clock, Copy, DollarSign, Edit2, ExternalLink, Wallet, X } from "lucide-react"
import { useEffect, useState } from "react"

export function ProfileHeader() {
  const { address, balance } = useWallet()
  const { usdc, fetchUSDCBalance } = useContracts()
  const { toast } = useToast()
  const [isEditingName, setIsEditingName] = useState(false)
  const [username, setUsername] = useState("Anonymous User")
  const [editedUsername, setEditedUsername] = useState(username)
  const [usdcBalance, setUsdcBalance] = useState("0")
  const [taskStats, setTaskStats] = useState({
    created: 1,
    completed: 0,
    totalEarned: 0,
    reputation: 0,
  })

  useEffect(() => {
    const loadUSDCBalance = async () => {
      if (address) {
        const balance = await fetchUSDCBalance(address)
        setUsdcBalance(balance)
      }
    }

    loadUSDCBalance()

    // 每10秒刷新一次余额
    const interval = setInterval(loadUSDCBalance, 10000)

    return () => clearInterval(interval)
  }, [address, fetchUSDCBalance])

  // Format address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const openExplorer = () => {
    if (address) {
      // For demo purposes, we'll use Ethereum mainnet explorer
      const explorerUrl = `https://etherscan.io/address/${address}`
      window.open(explorerUrl, "_blank")
    }
  }

  const handleEditName = () => {
    setEditedUsername(username)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    setUsername(editedUsername)
    setIsEditingName(false)
    toast({
      title: "Profile Updated",
      description: "Your username has been updated successfully",
    })
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
  }

  // Get initials for avatar
  const getInitials = () => {
    if (username === "Anonymous User") return "AU"
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-20 w-20 text-lg">
              <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveName}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{username}</h2>
                    <Button size="icon" variant="ghost" onClick={handleEditName}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{address ? formatAddress(address) : "Not connected"}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyAddressToClipboard}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={openExplorer}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ETH Balance</p>
              <p className="text-2xl font-bold">{balance ? Number.parseFloat(balance).toFixed(4) : "0"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">USDC Balance</p>
                <p className="text-2xl font-bold">{Number.parseFloat(usdcBalance).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <GetUSDCButton />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reputation</p>
              <p className="text-2xl font-bold">{taskStats.reputation}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold">{taskStats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

