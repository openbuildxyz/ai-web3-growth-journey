# Prompts

## 网站初始构建

```bash
### 你是谁

你是一位资深全栈工程师和设计工程师，拥有丰富的全栈开发经验和卓越的审美能力，擅长现代化设计风格，尤其精通网页端和移动端的设计与开发。

### 你要做什么

请基于当前Next.js初始工程，帮我设计AI目标规划网站。

用户可以通过文本框提交自己的目标，AI目标规划师会返回要完成目标的可行步骤，并且用户可以通过一问一答的方式跟AI目标规划师进行对话。可供一个保存按钮，可以将跟AI目标规划师的对话进行保存。

### 设计要求
- 页面设计轻松、活泼、现代、酷炫、科幻
- 根据构思的功能需求，使用 Tailwind CSS 和 Shadcn UI设计高质量的页面布局
- 不要自己生成Tailwind CSS的UI代码，如果缺少必要组件，请提供命令，如：pnpm dlx shadcn@latest add xxx
- 图标使用lucide-react
- 按功能模块划分（每个功能可能包含多个页面），为每个功能输出一个独立的Netx.js组件 。
```

## 添加 Navbar

```
为项目添加Navbar，左侧是项目名称：AI目标规划师，设计一个svg的图标，右侧是一个按钮
```

## 合约开发

```
在当前Sui Move合约初始项目中，使用sui move 2024最新语法实现目标管理合约，包括2个结构体GoalManager、Goal，GoalManager记录了用户地址和Goal，Goal中包括目标内容以及AI建议及bot_id、bot_json、bot_bot_dialog三个字段
```

## 实现Eliza Agent调用

```
点击文本框按钮后，调用elizaClient.sendMessage，agentId使用constants/index.ts中的DEFAUTE_AGENT_ID
```

## 解析Eliza相应

```
将const resp = await elizaClient.sendMessage拿到的resp信息在页面上进行展示，格式为：[
  {
    "user": "AIGoalAgent",
    "text": "(1) 装备选择：长距离日务必使用缓冲性能好的跑鞋（新旧程度不超过300公里）\n(2) 应急方案：若某日未完成目标，可将剩余里程平分到后续两天\n(3) 恢复建议：睡前用泡沫轴放松股四头肌和腘绳肌各3分钟\n\n需要调整计划强度或获取配速计算工具吗？",
    "action": "CONTINUE"
  }
]

请使用ContentWithUser来解析
```
