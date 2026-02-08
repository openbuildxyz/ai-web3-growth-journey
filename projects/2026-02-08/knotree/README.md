# 🌳 KnoTree

**让知识像树一样生长 | Let Knowledge Grow Like a Tree**

---

## 项目介绍 | About

KnoTree 是一个交互式知识探索工具，将学习和查资料的过程可视化为一棵可生长、可修剪的知识树。用户输入一个主题，AI 自动拆解出子话题作为枝干；点击任意节点可以继续深入探索，搜索到的资料以叶子和花苞的形式挂在树上；不感兴趣的方向随时剪枝，最终收获一棵属于自己的、精心修剪过的知识树。

KnoTree is an interactive knowledge exploration tool that visualizes the learning and research process as a growable, prunable knowledge tree. Enter a topic, and AI breaks it down into subtopics as branches. Click any node to explore deeper — search results appear as leaves and buds. Prune branches you don't need, and harvest a personalized, curated knowledge tree.

## 核心功能 | Features

### 🌱 种下种子 | Plant a Seed
输入一个大主题（如"机器学习""气候变化"），AI 自动生成第一层子话题枝干。

Enter a broad topic (e.g. "Machine Learning", "Climate Change"), and AI generates the first layer of subtopic branches.

### 🌿 生长探索 | Grow & Explore
选中任意节点，点击"成长"，可以：
 - **AI 拆解**：由 LLM 将该话题进一步细分为子主题（枝干生长）
- **资料搜索**：通过 Tavily 搜索具体资料，结果以叶子形式展示，用户自主筛选保留

Select any node and click "Grow" to:
 - **AI Breakdown**: LLM splits the topic into finer subtopics (branches grow)
- **Resource Search**: Tavily fetches specific resources displayed as leaves for manual curation

### ✂️ 修剪聚焦 | Prune & Focus
对不感兴趣的分支一键剪枝，丢弃无关的知识线索，让树保持清晰聚焦。

One-click pruning to discard irrelevant branches and keep your tree clean and focused.

### 🍎 收获导出 | Harvest & Export
将未剪枝的知识路径导出为结构化笔记，收获你的学习成果。

Export your curated knowledge paths as structured notes — harvest your learning.

## 技术架构 | Tech Stack

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  React + Vite + React Flow + Zustand        │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ 输入层    │  │ 画布层    │  │ 交互面板   │ │
│  │ Topic     │  │ Tree     │  │ Grow /    │ │
│  │ Input     │  │ Canvas   │  │ Prune     │ │
│  └──────────┘  └──────────┘  └───────────┘ │
└──────────────┬──────────────┬───────────────┘
               │              │
       ┌───────▼──────┐ ┌────▼────────────┐
       │   LLM API    │ │  Tavily API     │
       │  (via Proxy) │ │  (via Proxy)    │
       │              │ │                 │
       │ · 主题拆解    │ │ · 资料搜索      │
       │ · 子话题生成  │ │ · 结果结构化    │
       │ · Web Search │ │ · 相关度评分    │
       └──────────────┘ └─────────────────┘
```

| 层级 Layer | 技术 Technology | 用途 Purpose |
|---|---|---|
| 前端框架 Frontend | React + Vite | 界面渲染 UI Rendering |
| 树可视化 Visualization | React Flow | 交互式树形画布 Interactive tree canvas |
| 状态管理 State | Zustand | 树结构 & 选中节点 Tree structure & selection |
| AI 拆解 AI Breakdown | LLM API (w/ Web Search) | 主题拆解与子话题生成 Topic decomposition |
| 资料搜索 Search | Tavily API | 具体资料检索与筛选 Resource retrieval |
| API 代理 Proxy | Express.js | 保护 API Key Secure API keys |

## 数据结构 | Data Model

```typescript
type TreeNode = {
  id: string;          // 唯一标识 Unique ID
  label: string;       // 节点标题 Display label
  status: "idle" | "growing" | "pruned";  // 节点状态 Node status
  children: string[];  // 子节点 ID 列表 Child node IDs
  sources: {           // 关联资料 Associated resources
    title: string;
    url: string;
  }[];
  depth: number;       // 树深度 Tree depth
  parentId: string | null;  // 父节点 Parent node
};
```

## 快速开始 | Quick Start

```bash
# 克隆项目 Clone
git clone https://github.com/KnoTree/knotree.git
cd knotree

# 安装依赖 Install
npm install

# 配置环境变量 Set up env
cp .env.example .env
# 填入你的 API Key / Add your API keys:
#   MODELSCOPE_API_KEY=ms-...
#   TAVILY_API_KEY=tvly-...

# 启动开发服务器 Start dev server
npm run dev
```

## 项目结构 | Project Structure

```
knotree/
├── src/
│   ├── components/
│   │   ├── TopicInput.jsx      # 主题输入框 Topic input
│   │   ├── TreeCanvas.jsx      # 知识树画布 Tree canvas
│   │   ├── NodePanel.jsx       # 节点交互面板 Node actions
│   │   └── CustomNode.jsx      # 自定义节点样式 Custom node
│   ├── store/
│   │   └── treeStore.js        # Zustand 状态管理 State store
│   ├── services/
│   │   ├── llm.js              # LLM API 调用 API client
│   │   └── tavily.js           # Tavily API 调用 API client
│   ├── App.jsx
│   └── main.jsx
├── server.js                   # API 代理服务器 Proxy server
├── .env.example
└── package.json
```

## 工作流程 | How It Works

```
用户输入主题 User enters topic
        │
        ▼
  LLM 拆解为 3-5 个子话题
  LLM breaks down into 3-5 subtopics
        │
        ▼
  渲染为树的第一层枝干
  Rendered as first-level branches
        │
        ▼
  用户选中节点 User selects a node
        │
   ┌────┴────┐
   ▼         ▼
 成长       剪枝
 Grow      Prune
   │         │
   ▼         ▼
 ┌──┴──┐   标记为已剪枝，视觉淡化
 │     │   Marked pruned, visually faded
 ▼     ▼
AI拆解  资料搜索
LLM     Tavily
 │       │
 ▼       ▼
新枝干   叶子节点（用户筛选保留/丢弃）
New      Leaf nodes (user curates)
branches
```

## 团队 | Team

**Team KnoTree** 🌳

## 许可证 | License

MIT
