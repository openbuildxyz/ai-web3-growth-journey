"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Check, AlertTriangle } from "lucide-react"
import { useAgent } from "./agent-provider"
import { AI_MODELS } from "@/lib/agent-config"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export function AgentSettings() {
  const { apiConfig, updateApiConfig, selectedModel, setSelectedModel, credits } = useAgent()
  const [open, setOpen] = useState(false)
  const [endpoint, setEndpoint] = useState(apiConfig.endpoint)
  const [apiKey, setApiKey] = useState(apiConfig.apiKey)
  const [apiType, setApiType] = useState(apiConfig.type || "custom")
  const [selectedModelId, setSelectedModelId] = useState(selectedModel.id)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  // 当对话框打开时，更新表单状态
  useEffect(() => {
    if (open) {
      setEndpoint(apiConfig.endpoint)
      setApiKey(apiConfig.apiKey)
      setApiType(apiConfig.type)
      setSelectedModelId(selectedModel.id)
    }
  }, [open, apiConfig, selectedModel])

  const handleSave = () => {
    try {
      // 验证端点URL格式
      if (apiType === "custom" && endpoint) {
        try {
          new URL(endpoint)
        } catch (e) {
          toast({
            title: "设置错误",
            description: "API端点URL格式无效",
            variant: "destructive",
          })
          return
        }
      }

      // 验证API密钥不为空
      if (apiType === "custom" && !apiKey) {
        toast({
          title: "设置错误",
          description: "API密钥不能为空",
          variant: "destructive",
        })
        return
      }

      // 更新API设置
      updateApiConfig({
        endpoint,
        apiKey,
        type: apiType,
      })

      // 更新选择的模型
      const newModel = AI_MODELS.find((model) => model.id === selectedModelId)
      if (newModel) {
        setSelectedModel(newModel)
      }

      toast({
        title: "设置已保存",
        description: "AI助手设置已成功更新",
      })

      setOpen(false)
    } catch (error) {
      console.error("保存设置时出错:", error)
      toast({
        title: "保存失败",
        description: `保存设置时出错: ${error.message || "未知错误"}`,
        variant: "destructive",
      })
    }
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const testEndpoint = apiType === "custom" ? endpoint : "https://api.openai.com/v1"
      const testApiKey = apiType === "custom" ? apiKey : "需要提供OpenAI API密钥"

      if (apiType === "openai" && (!testApiKey || testApiKey === "需要提供OpenAI API密钥")) {
        throw new Error("请先设置有效的OpenAI API密钥")
      }

      // 简单发送请求测试连接
      const response = await fetch(testEndpoint + "/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`连接测试失败: ${response.status} ${errorData.error?.message || response.statusText}`)
      }

      toast({
        title: "连接成功",
        description: "成功连接到API服务",
      })
    } catch (error) {
      console.error("API连接测试失败:", error)
      toast({
        title: "连接失败",
        description: `API连接测试失败: ${error.message || "未知错误"}`,
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI助手设置</DialogTitle>
          <DialogDescription>配置AI模型和API设置</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>选择API类型</Label>
            <RadioGroup
              value={apiType}
              onValueChange={(value) => setApiType(value as "openai" | "custom")}
              className="grid grid-cols-2 gap-4"
            >
              <Card className={`cursor-pointer border-2 ${apiType === "custom" ? "border-primary" : "border-border"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">自定义API</CardTitle>
                    <RadioGroupItem value="custom" id="custom" className="sr-only" />
                    {apiType === "custom" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <CardDescription>使用默认提供的API</CardDescription>
                </CardHeader>
              </Card>

              <Card className={`cursor-pointer border-2 ${apiType === "openai" ? "border-primary" : "border-border"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">OpenAI API</CardTitle>
                    <RadioGroupItem value="openai" id="openai" className="sr-only" />
                    {apiType === "openai" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <CardDescription>使用官方OpenAI API</CardDescription>
                </CardHeader>
              </Card>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>选择AI模型</Label>
            <RadioGroup value={selectedModelId} onValueChange={setSelectedModelId} className="grid grid-cols-1 gap-4">
              {AI_MODELS.map((model) => (
                <Card
                  key={model.id}
                  className={`cursor-pointer border-2 ${selectedModelId === model.id ? "border-primary" : "border-border"}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{model.name}</CardTitle>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">{model.creditCost} 积分/次</span>
                        <RadioGroupItem value={model.id} id={model.id} className="sr-only" />
                        {selectedModelId === model.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                    <CardDescription>{model.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">当前积分: {credits} 积分</p>
          </div>

          {apiType === "custom" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="endpoint">API端点</Label>
                <Input
                  id="endpoint"
                  placeholder="https://api.suanli.cn/v1/chat/completions"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">设置自定义API的完整端点URL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API密钥</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">提供访问API所需的密钥</p>
              </div>
            </>
          )}

          {apiType === "openai" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="openaiKey">OpenAI API密钥</Label>
                <Input
                  id="openaiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey !== "sk-1mAdUtdOE7IvprhH54zZrILuizaLjr4mrWVsO7M6UALOcsW8" ? apiKey : ""}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <div className="flex items-center mt-1 text-xs text-amber-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <p>需要提供有效的OpenAI API密钥才能使用</p>
                </div>
              </div>
            </>
          )}

          <Button variant="outline" onClick={testConnection} disabled={isTestingConnection}>
            {isTestingConnection ? "测试中..." : "测试连接"}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存设置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

