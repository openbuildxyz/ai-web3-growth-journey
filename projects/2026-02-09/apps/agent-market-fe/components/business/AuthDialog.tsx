'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAccount, useSignMessage } from 'wagmi'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'

/**
 * Props for the AuthDialog component.
 */
interface AuthDialogProps {
  /** Whether the dialog is currently open */
  isOpen: boolean
  /** Callback function to close the dialog */
  onClose: () => void
}

/**
 * Authentication dialog component that handles wallet signature-based authentication.
 *
 * This component prompts the user to sign a message with their wallet to authenticate
 * with the backend. The authentication flow:
 * 1. Fetches a challenge message from the backend
 * 2. Requests the user to sign the message with their wallet
 * 3. Submits the signature to the backend for verification
 * 4. Stores the authentication token on success
 *
 * Requirements: 3.3, 3.4, 3.5
 *
 * @param {AuthDialogProps} props - Component props
 * @returns Authentication dialog component
 */
export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async () => {
    if (!isConnected || !address) {
      toast.error('请先连接钱包')
      return
    }
    if (!signMessageAsync) {
      toast.error('钱包初始化中，请稍后重试')
      return
    }

    setIsAuthenticating(true)
    try {
      const BACKEND_DOMAIN =
        process.env.NEXT_PUBLIC_BACKEND_DOMAIN ?? 'http://localhost:8000'

      // 1. Get challenge
      const challengeRes = await fetch(`${BACKEND_DOMAIN}/auth/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const { message, nonce } = await challengeRes.json()

      // 2. Sign message using wagmi
      const signature = await signMessageAsync({ message })

      // 3. Login
      const loginRes = await fetch(`${BACKEND_DOMAIN}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature,
          nonce,
        }),
      })

      const loginData = await loginRes.json()
      const token = loginData.accessToken || loginData.token || loginData.jwt

      if (!token) {
        throw new Error('登录失败：未获取到 Token')
      }

      setAuth(token, address)
      toast.success('登录成功')
      onClose()
    } catch (error: any) {
      console.error('Authentication failed:', error)
      toast.error(error.message || '身份认证失败')
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>连接钱包并登录</DialogTitle>
          <DialogDescription>
            请签署消息以验证钱包所有权并完成身份认证。
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center text-sm text-muted-foreground">
          签署消息不会产生任何费用，仅用于验证您的钱包地址。
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isAuthenticating}
          >
            取消
          </Button>
          <Button
            onClick={handleLogin}
            disabled={
              isAuthenticating || !isConnected || !address || !signMessageAsync
            }
            className="min-w-[100px]"
          >
            {isAuthenticating ? '登录中...' : '签署并登录'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
