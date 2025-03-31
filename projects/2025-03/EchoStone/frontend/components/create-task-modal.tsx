"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ethers } from "ethers"
import { useWallet } from "./wallet-provider"
import { useContracts } from "./contracts-provider"
import { useTaskModal } from "./task-modal-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { USDC_DECIMALS } from "@/lib/constants"
import { Bot } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  target: z.string().min(5, "Target must be at least 5 characters"),
  limitTime: z.coerce.number().min(1, "Time limit must be at least 1 day"),
  bounty: z.coerce.number().min(1, "Bounty must be at least 1 USDC"),
})

type FormValues = z.infer<typeof formSchema>

export function CreateTaskModal() {
  const { isCreateModalOpen, closeCreateModal } = useTaskModal()
  const { address } = useWallet()
  const { taskManager, usdc } = useContracts()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  console.log("CreateTaskModal rendered, isCreateModalOpen:", isCreateModalOpen)

  // 尝试从 localStorage 获取任务信息
  let savedTaskPreview = {
    title: "",
    description: "",
    target: "",
    limitTime: 7,
    bounty: 100,
  }

  try {
    const savedTask = localStorage.getItem("taskPreview")
    if (savedTask) {
      savedTaskPreview = JSON.parse(savedTask)
      // 使用后清除，避免影响下次创建
      localStorage.removeItem("taskPreview")
    }
  } catch (error) {
    console.error("Error parsing saved task:", error)
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: savedTaskPreview.title || "",
      description: savedTaskPreview.description || "",
      target: savedTaskPreview.target || "",
      limitTime: savedTaskPreview.limitTime || 7,
      bounty: savedTaskPreview.bounty || 100,
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (!address || !taskManager || !usdc) {
      toast({
        title: "Error",
        description: "Wallet not connected or contracts not initialized",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Convert bounty to USDC units (18 decimals)
      const bountyAmount = ethers.parseUnits(values.bounty.toString(), USDC_DECIMALS)

      // First approve the TaskManager contract to spend USDC
      const approveTx = await usdc.approve(taskManager.target, bountyAmount)
      await approveTx.wait()

      toast({
        title: "Approval Successful",
        description: "USDC approved for task creation",
      })

      // Then create the task
      const tx = await taskManager.publishTask(
        values.description,
        values.title,
        values.target,
        values.limitTime,
        bountyAmount,
      )

      await tx.wait()

      toast({
        title: "Task Created",
        description: "Your task has been successfully created",
      })

      form.reset()
      closeCreateModal()
    } catch (error: any) {
      console.error("Error creating task:", error)
      toast({
        title: "Error Creating Task",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Create a new task with a bounty for others to complete</DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          onClick={() => {
            // 这里应该导航到TaskAgent页面
            window.location.href = "/agent"
          }}
          className="mb-4"
        >
          <Bot className="mr-2 h-4 w-4" />
          使用AI助手创建任务
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed description of the task" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target</FormLabel>
                  <FormControl>
                    <Input placeholder="What needs to be delivered" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="limitTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (days)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bounty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bounty (USDC)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>Amount in USDC</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

