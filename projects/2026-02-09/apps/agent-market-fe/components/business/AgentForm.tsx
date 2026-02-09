'use client'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { apiFetch } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreateAgentRequest } from '@/lib/types/agents'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type AgentFormValues = z.infer<typeof CreateAgentRequest>

interface AgentFormProps {
  initialData?: Partial<AgentFormValues> & { id?: string }
  onSuccess?: () => void
}

export default function AgentForm({ initialData, onSuccess }: AgentFormProps) {
  const isEditing = !!initialData?.id

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(CreateAgentRequest),
    defaultValues: {
      display_name: initialData?.display_name || '',
      bio: initialData?.bio || '',
      price_per_task: initialData?.price_per_task || 0,
      tags: initialData?.tags || [],
      avatar: initialData?.avatar || '',
      base_url: initialData?.base_url || '',
      invoke_path: initialData?.invoke_path || '',
      auth_type: initialData?.auth_type || 'platform_jwt',
      auth_secret_hash: initialData?.auth_secret_hash || '',
      response_time: initialData?.response_time || '',
    },
  })

  async function onSubmit(values: AgentFormValues) {
    try {
      if (isEditing) {
        await apiFetch(`/agents/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        })
        toast.success('Agent 更新成功')
      } else {
        await apiFetch('/agents', {
          method: 'POST',
          body: JSON.stringify(values),
        })
        toast.success('Agent 发布成功')
      }
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-destructive">*</span>
                  Agent 名称
                </FormLabel>
                <FormControl>
                  <Input placeholder="例如: Data Analyzer Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price_per_task"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-destructive">*</span>
                  价格 (Q/task)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>简介</FormLabel>
              <FormControl>
                <Input placeholder="简单描述你的 Agent 能做什么" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="base_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-destructive">*</span>
                  API Base URL
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://api.your-agent.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoke_path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-destructive">*</span>
                  调用路径
                </FormLabel>
                <FormControl>
                  <Input placeholder="/v1/execute" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel className="text-foreground">认证方式</FormLabel>
          <FormField
            control={form.control}
            name="auth_type"
            render={({ field }) => (
              <FormControl>
                <select
                  {...field}
                  className="w-full mt-1 bg-background border border-input rounded-md px-2 py-1"
                >
                  <option value="platform_jwt">Platform JWT</option>
                  <option value="platform_hmac">Platform HMAC</option>
                </select>
              </FormControl>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="auth_secret_hash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>认证密钥 (Secret)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>
                用于平台调用您的 Agent，将加密存储
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {isEditing ? '更新 Agent' : '发布 Agent'}
        </Button>
      </form>
    </Form>
  )
}
