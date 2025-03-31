// AI模型配置
export type AIModelConfig = {
  id: string
  name: string
  description: string
  creditCost: number
  apiIdName: string
}

// AI模型列表
export const AI_MODELS: AIModelConfig[] = [
  {
    id: "deepseek-r1:7b",
    name: "Deepseek-R1-7B",
    description: "高性能的中文大语言模型，适合各种任务",
    creditCost: 1,
    apiIdName: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
  },
]

// 默认系统提示
export const DEFAULT_SYSTEM_PROMPT = `你是TaskAgent，一个专业的Web3任务创建助手。
你的目标是帮助用户创建高质量的任务描述。
分析用户的需求，提出问题以获取更多细节，并帮助用户完善任务描述。

请特别关注以下方面：
1. 任务标题应简洁明了
2. 任务描述应详细说明需求和背景
3. 交付目标应明确具体，便于验收
4. 时间和预算应合理

如果你能从对话中提取出任务相关信息，请以JSON格式返回，格式为：
###TaskInfo###
{
  "title": "任务标题",
  "description": "详细描述",
  "target": "交付目标",
  "limitTime": 天数,
  "bounty": 金额
}
###EndTaskInfo###

在回复中，先提供对用户有帮助的回应，然后再附上TaskInfo。`

// 用户初始积分
export const INITIAL_CREDITS = 10

// API配置
export type APIConfig = {
  endpoint: string
  apiKey: string
  type: "openai" | "custom"
}

// 默认API配置
export const DEFAULT_API_CONFIG: APIConfig = {
  endpoint: "https://api.siliconflow.cn/v1/chat/completions",
  apiKey: "sk-oyhdmpofvmzmrhcoznhewczfaduemvhrlafepdpzmeaxiwcs",
  type: "custom",
}

