'use client'

import { useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { parseUnits } from 'ethers'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTask } from '@/app/tasks/service'
import useWallet from '@/lib/hooks/useWallet'
import { useAuthStore } from '@/stores/auth'
import {
  createTaskMetaPayload,
  persistTaskMetadata,
} from '@/lib/tasks/offchain'
import { hashPayload } from '@/lib/tasks/payload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AuthDialog from '@/components/business/AuthDialog'
import { useTokenDecimals, useTokenSymbol } from '@/lib/hooks/usePlatformToken'
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses'
import { writeApprove, writeCreateTask } from '@/lib/contracts/utils'

const TaskPublishFormSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  description: z.string().min(1, '请输入描述'),
  budget_usd: z.coerce.number().positive('请输入有效预算'),
  agent_id: z.string().optional(),
  review_deadline: z.string().optional(),
})

type TaskPublishFormValues = z.infer<typeof TaskPublishFormSchema>

type TaskPublishFormProps = {
  defaultAgentId?: string
  onCreated: (payload: { txHash: string }) => void
  onCancel?: () => void
  showCancel?: boolean
}

function normalizeDate(input?: string) {
  if (!input) return undefined
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? input : date.toISOString()
}

export function TaskPublishForm({
  defaultAgentId,
  onCreated,
  onCancel,
  showCancel = false,
}: TaskPublishFormProps) {
  const { mutateAsync, isPending, error } = useCreateTask()
  const { isConnected, account, chainId, signer } = useWallet()
  const checkAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showWalletPrompt, setShowWalletPrompt] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const isRetryingMetadataRef = useRef(false)
  const { data: decimals } = useTokenDecimals()
  const { data: symbol } = useTokenSymbol()

  const isSubmitting = isPending || isApproving || isTransferring

  const defaultValues = useMemo<TaskPublishFormValues>(
    () => ({
      title: '',
      description: '',
      budget_usd: 0,
      agent_id: defaultAgentId ?? '',
      review_deadline: '',
    }),
    [defaultAgentId],
  )

  const form = useForm<TaskPublishFormValues>({
    resolver: zodResolver(
      TaskPublishFormSchema,
    ) as Resolver<TaskPublishFormValues>,
    defaultValues,
  })

  return (
    <Form {...form}>
      <form
        className="grid gap-5"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            if (!isConnected) {
              setShowWalletPrompt(true)
              return
            }
            if (!checkAuthenticated()) {
              setShowAuthDialog(true)
              return
            }
            if (!signer || !account) {
              toast.error('请先连接钱包')
              return
            }
            if (decimals == null) {
              toast.error('无法读取代币精度')
              return
            }

            const tokenSymbol = symbol || 'Q'
            const metaPayload = createTaskMetaPayload({
              title: values.title,
              description: values.description,
              agentId: values.agent_id?.trim() || undefined,
              createdAt: new Date().toISOString(),
              tokenSymbol,
            })
            const metaHash = hashPayload(metaPayload)
            const amount = parseUnits(values.budget_usd.toString(), decimals)

            // Step 1: Approve
            setIsApproving(true)
            try {
              await writeApprove(signer, CONTRACT_ADDRESSES.EscrowVault, amount)
              toast.success('授权成功')
            } catch (error) {
              toast.error('授权失败，请重试')
              throw error
            } finally {
              setIsApproving(false)
            }

            // Step 2: Create task on-chain
            setIsTransferring(true)
            let txHash: string
            try {
              const result = await writeCreateTask(signer, amount, metaHash)
              txHash = result.txHash
              toast.success('链上任务创建成功')
            } catch (error) {
              toast.error('创建链上任务失败，请重试')
              throw error
            } finally {
              setIsTransferring(false)
            }

            // Step 3: Create task in backend
            const createdTask = await mutateAsync({
              tx_hash: txHash,
              title: values.title,
              description: values.description,
              budget_usd: values.budget_usd,
              agent_id: values.agent_id?.trim() || undefined,
              review_deadline: normalizeDate(values.review_deadline),
              chain_id: chainId ?? undefined,
              token_symbol: tokenSymbol,
            })

            try {
              await persistTaskMetadata(createdTask.id, metaPayload)
            } catch (persistError) {
              console.error('Persisting task metadata failed:', persistError)
              toast.error('任务已创建，但元数据写入失败', {
                action: {
                  label: '重试',
                  onClick: async () => {
                    if (isRetryingMetadataRef.current) return
                    isRetryingMetadataRef.current = true
                    try {
                      await persistTaskMetadata(createdTask.id, metaPayload)
                      toast.success('元数据已写入')
                    } catch (retryError) {
                      console.error(
                        'Retrying task metadata persistence failed:',
                        retryError,
                      )
                      toast.error('元数据写入仍失败，请稍后重试')
                    } finally {
                      isRetryingMetadataRef.current = false
                    }
                  },
                },
              })
            }

            form.reset()
            onCreated({ txHash })
          } catch (error) {
            console.error('Task creation failed:', error)
            toast.error(
              error instanceof Error ? error.message : '创建任务失败，请重试',
            )
          }
        })}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-destructive">*</span>
                任务标题
              </FormLabel>
              <FormControl>
                <Input placeholder="例如：设计品牌 Logo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-destructive">*</span>
                任务描述
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="描述任务目标、交付要求和验收标准"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="budget_usd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-destructive">*</span>
                  预算 (Q)
                </FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent ID</FormLabel>
                <FormControl>
                  <Input placeholder="指定 Agent ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="review_deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>验收截止时间</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive">创建失败：{error.message}</p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {showCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isApproving
              ? '授权中...'
              : isTransferring
                ? '创建中...'
                : isPending
                  ? '提交中...'
                  : '提交任务'}
          </Button>
        </div>
      </form>
      <Dialog
        open={showWalletPrompt}
        onOpenChange={(open) => !open && setShowWalletPrompt(false)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>连接钱包以提交任务</DialogTitle>
            <DialogDescription>
              提交任务需要先连接钱包并完成身份验证。请点击右上角的"连接钱包"按钮。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setShowWalletPrompt(false)
              }}
            >
              知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </Form>
  )
}
