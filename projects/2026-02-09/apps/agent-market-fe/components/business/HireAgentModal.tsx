'use client'

import { z } from 'zod'
import { useRef } from 'react'
import { toast } from 'sonner'
import { parseUnits } from 'ethers'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'

import { apiFetch } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { AgentItem } from '@/lib/types/agents'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CreateTaskRequest } from '@/lib/types/tasks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// 新增导入
import useWallet from '@/lib/hooks/useWallet'
import { hashPayload } from '@/lib/tasks/payload'
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses'
import { writeApprove, writeCreateTask } from '@/lib/contracts/utils'
import { useTokenDecimals, useTokenSymbol } from '@/lib/hooks/usePlatformToken'
import {
  createTaskMetaPayload,
  persistTaskMetadata,
} from '@/lib/tasks/offchain'

type HireFormValues = z.infer<typeof CreateTaskRequest>

interface HireAgentModalProps {
  agent: z.infer<typeof AgentItem> | null
  isOpen: boolean
  onClose: () => void
}

export default function HireAgentModal({
  agent,
  isOpen,
  onClose,
}: HireAgentModalProps) {
  // 新增
  const { signer, account, chainId } = useWallet()
  const { data: decimals } = useTokenDecimals()
  const { data: symbol } = useTokenSymbol()

  const router = useRouter()
  const retryMetadataRef = useRef(false)
  const form = useForm<HireFormValues>({
    resolver: zodResolver(CreateTaskRequest) as Resolver<HireFormValues>,
    defaultValues: {
      title: '',
      description: '',
      token_symbol: 'Q',
      agent_id: agent?.id || '',
      budget_usd: agent?.price || 0,
    },
  })

  // Update form when agent changes
  if (agent && form.getValues('agent_id') !== agent.id) {
    form.setValue('agent_id', agent.id)
    form.setValue('budget_usd', agent.price || 0)
  }

  async function onSubmit(values: HireFormValues) {
    try {
      if (!signer || !account) {
        toast.error('Please connect your wallet')
        return
      }
      if (decimals == null) {
        toast.error('Unable to read token decimals')
        return
      }

      const tokenSymbol = symbol || values.token_symbol || 'USDT'
      const metaPayload = createTaskMetaPayload({
        title: values.title,
        description: values.description,
        agentId: values.agent_id,
        createdAt: new Date().toISOString(),
        tokenSymbol,
      })
      const metaHash = hashPayload(metaPayload)
      const amount = parseUnits(values.budget_usd.toString(), decimals)

      await writeApprove(signer, CONTRACT_ADDRESSES.EscrowVault, amount)
      const { txHash, taskId } = await writeCreateTask(signer, amount, metaHash)

      const createdTask = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          tx_hash: txHash,
          buyer_wallet_address: account,
          chain_id: chainId ?? undefined,
          chain_task_id: taskId ? Number(taskId) : undefined,
          token_symbol: tokenSymbol,
        }),
      })

      try {
        await persistTaskMetadata(createdTask.id, metaPayload)
      } catch (persistError) {
        console.error('Persisting task metadata failed:', persistError)
        toast.error('Task created, but metadata write failed', {
          action: {
            label: 'Retry',
            onClick: async () => {
              if (retryMetadataRef.current) return
              retryMetadataRef.current = true
              try {
                await persistTaskMetadata(createdTask.id, metaPayload)
                toast.success('Metadata saved')
              } catch (retryError) {
                console.error(
                  'Retrying task metadata persistence failed:',
                  retryError,
                )
                toast.error('Metadata still failed to save, try again later')
              } finally {
                retryMetadataRef.current = false
              }
            },
          },
        })
      }

      toast.success('Task created on-chain')
      onClose()
      router.push(`/tasks/${createdTask.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Hire failed')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>雇佣 {agent?.name}</DialogTitle>
          <DialogDescription>
            描述您的任务需求并设置预算。资金将由平台安全托管。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>任务标题</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如: 帮我分析这段智能合约代码"
                      {...field}
                    />
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
                  <FormLabel>任务详述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="详细说明您的要求、预期产出和截止日期..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget_usd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预算 ({form.getValues('token_symbol')})</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1.5 w-4 h-4 text-muted-foreground select-none">
                        Q
                      </span>
                      <Input
                        type="number"
                        className="pl-9"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Agent 费率</span>
                <span>{agent?.price} Q</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">平台服务费 (5%)</span>
                <span>{(form.watch('budget_usd') * 0.05).toFixed(2)} Q</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-primary/10">
                <span>总计需锁定</span>
                <span className="text-primary">
                  {(form.watch('budget_usd') * 1.05).toFixed(2)} Q
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              确认雇佣并锁定资金
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
