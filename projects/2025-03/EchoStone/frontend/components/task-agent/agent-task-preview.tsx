"use client"

import { useState } from "react"
import { useAgent } from "./agent-provider"
import { useTaskModal } from "@/components/task-modal-provider"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Edit, Check } from "lucide-react"

export function AgentTaskPreview() {
  const { taskPreview, updateTaskPreview } = useAgent()
  const { openCreateModal, closeCreateModal } = useTaskModal()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // 处理创建任务
  const handleCreateTask = () => {
    // 检查任务信息是否完整
    if (!taskPreview.title || !taskPreview.description || !taskPreview.target) {
      toast({
        title: "信息不完整",
        description: "请确保任务标题、描述和目标已填写",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    // 将任务信息存储到 localStorage
    localStorage.setItem("taskPreview", JSON.stringify(taskPreview))

    // 模拟创建任务的过程
    setTimeout(() => {
      // 导航到首页并打开创建模态框
      window.location.href = "/"
      setIsCreating(false)

      toast({
        title: "任务已准备",
        description: "AI生成的任务已加载到创建表单中",
      })
    }, 1000)
  }

  // 切换编辑模式
  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">任务预览</CardTitle>
        <Button variant="ghost" size="icon" onClick={toggleEditMode}>
          {editMode ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {editMode ? (
          // 编辑模式
          <>
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={taskPreview.title}
                onChange={(e) => updateTaskPreview({ title: e.target.value })}
                placeholder="任务标题"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={taskPreview.description}
                onChange={(e) => updateTaskPreview({ description: e.target.value })}
                placeholder="任务描述"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">目标</Label>
              <Textarea
                id="target"
                value={taskPreview.target}
                onChange={(e) => updateTaskPreview({ target: e.target.value })}
                placeholder="交付目标"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limitTime">时间限制 (天)</Label>
                <Input
                  id="limitTime"
                  type="number"
                  value={taskPreview.limitTime}
                  onChange={(e) => updateTaskPreview({ limitTime: Number.parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bounty">赏金 (USDC)</Label>
                <Input
                  id="bounty"
                  type="number"
                  value={taskPreview.bounty}
                  onChange={(e) => updateTaskPreview({ bounty: Number.parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
            </div>
          </>
        ) : (
          // 预览模式
          <>
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground">标题</h3>
              <p className="font-medium">{taskPreview.title || "尚未生成标题"}</p>
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground">描述</h3>
              <p className="text-sm whitespace-pre-wrap">{taskPreview.description || "尚未生成描述"}</p>
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground">目标</h3>
              <p className="text-sm whitespace-pre-wrap">{taskPreview.target || "尚未生成目标"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground">时间限制</h3>
                <p>{taskPreview.limitTime} 天</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground">赏金</h3>
                <p>{taskPreview.bounty} USDC</p>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={handleCreateTask} disabled={isCreating || !taskPreview.title}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              准备中...
            </>
          ) : (
            "创建此任务"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

