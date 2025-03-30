"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard } from "lucide-react"
import { useWallet } from "../wallet-provider"

interface AgentPaymentModalProps {
  open: boolean
  onClose: () => void
  onPayment: (amount: number) => Promise<boolean>
  currentCredits: number
}

export function AgentPaymentModal({ open, onClose, onPayment, currentCredits }: AgentPaymentModalProps) {
  const [amount, setAmount] = useState(10) // 默认10积分
  const [isProcessing, setIsProcessing] = useState(false)
  const { isConnected } = useWallet()

  const handlePayment = async () => {
    if (!isConnected) {
      return
    }

    setIsProcessing(true)
    const success = await onPayment(amount)
    setIsProcessing(false)

    if (success) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>购买AI助手积分</DialogTitle>
          <DialogDescription>您当前有 {currentCredits} 积分。每个积分可以使用一次AI助手。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              积分数量
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">费用</Label>
            <div className="col-span-3">
              <p className="text-sm">{amount} USDC (1 USDC = 1 积分)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing || !isConnected}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                支付 {amount} USDC
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

