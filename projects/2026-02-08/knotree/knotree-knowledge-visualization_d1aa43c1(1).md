---
name: knotree-knowledge-visualization
overview: 创建 KnoTree 交互式知识树探索平台，实现 AI 驱动的主题拆解、资料搜索、可视化树状展示、节点成长/修剪和知识导出功能
design:
  architecture:
    framework: react
    component: mui
  styleKeywords:
    - 现代科技感
    - 自然生长主题
    - 渐变背景
    - 微动效
    - 层次感
    - 深色模式
    - 玻璃态卡片
  fontSystem:
    fontFamily: Roboto
    heading:
      size: 28px
      weight: 600
    subheading:
      size: 18px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#6366F1"
      - "#8B5CF6"
      - "#EC4899"
    background:
      - "#0F172A"
      - "#1E293B"
      - "#F8FAFC"
      - "#FFFFFF"
    text:
      - "#F8FAFC"
      - "#0F172A"
      - "#64748B"
    functional:
      - "#10B981"
      - "#EF4444"
      - "#F59E0B"
      - "#3B82F6"
todos:
  - id: init-project
    content: 初始化项目结构，配置 pnpm workspace、前端 Vite + React + TypeScript、后端 Express.js，安装所有依赖
    status: completed
  - id: setup-types
    content: 创建 TypeScript 类型定义文件，定义 TreeNode、SourceItem、API 请求响应类型
    status: completed
    dependencies:
      - init-project
  - id: setup-store
    content: 实现 Zustand 状态管理，创建 treeStore 和 layoutStore，实现节点增删改查、剪枝、持久化逻辑
    status: completed
    dependencies:
      - setup-types
  - id: backend-server
    content: 搭建 Express.js 后端服务器，实现 Claude 和 Tavily API 代理路由，配置 CORS、速率限制、错误处理中间件
    status: completed
    dependencies:
      - init-project
  - id: frontend-services
    content: 实现前端服务层，封装 Claude 和 Tavily API 调用、导出服务、布局算法工具
    status: completed
    dependencies:
      - setup-types
      - backend-server
  - id: ui-components
    content: 开发 UI 组件，实现 TopicInput、CustomNode、TreeCanvas、NodePanel、SourceList、ExportButton
    status: completed
    dependencies:
      - setup-store
      - frontend-services
  - id: integrate-reactflow
    content: 集成 React Flow，配置自定义节点、连接线样式、自动布局算法，实现交互事件处理
    status: completed
    dependencies:
      - ui-components
  - id: styling-animations
    content: 应用 MUI 主题和自定义样式，实现节点生长、剪枝、选中等动画效果，确保响应式布局
    status: completed
    dependencies:
      - ui-components
  - id: testing-deployment
    content: 编写 README 文档，创建 .env.example，测试完整工作流程，准备部署配置
    status: completed
    dependencies:
      - integrate-reactflow
      - styling-animations
---

## 产品概述

KnoTree 是一个创新的交互式知识探索工具，将抽象的学习过程可视化为一棵可生长、可修剪的知识树。用户通过"种植"主题种子，让 AI 帮助其"生长"出完整的知识结构，并通过"修剪"聚焦学习路径，最终"收获"结构化的学习笔记。

## 核心功能

### 种子种植（Topic Input）

用户输入大主题（如"机器学习"），系统调用 Claude API 自动生成 3-5 个子话题作为第一层枝干，形成知识树的根基。

### 生长探索（Grow & Explore）

用户选中任意节点后，可选择两种生长模式：

- **AI 拆解模式**：使用 Claude API 将话题进一步拆解为更细分的子主题，生成新枝干
- **资料搜索模式**：使用 Tavily API 搜索具体学习资料，结果以叶子节点展示，支持筛选保留

### 修剪聚焦（Prune）

一键剪枝不感兴趣的分支，被剪枝节点视觉淡化，帮助用户聚焦学习路径。

### 收获导出（Export）

将未剪枝的知识路径导出为 Markdown 格式的结构化笔记，包含完整知识层级和资料链接。

## 视觉效果

- 交互式树形画布，支持拖拽、缩放、平移操作
- 节点通过颜色和样式区分状态（空闲/生长中/已剪枝）
- 枝干节点和叶子节点视觉差异化
- 平滑的动画效果展示节点生长过程
- 清晰的层级结构展示知识前置关系

## 技术栈选型

### 前端技术栈

- **框架**：React 18 + TypeScript
- **构建工具**：Vite 5.x（快速开发和 HMR）
- **可视化库**：React Flow 11.x（交互式树形画布）
- **状态管理**：Zustand 4.x（轻量级状态管理）
- **UI 组件库**：Material-UI (MUI) 5.x（现代化界面）
- **样式方案**：MUI 的 emotion + sx prop

### 后端技术栈

- **服务器**：Express.js（API 代理服务器）
- **运行时**：Node.js 18+
- **环境变量**：dotenv（保护 API Key）

### 外部 API

- **Claude API**：用于主题拆解和知识结构生成
- **Tavily API**：用于资料搜索

### 开发工具

- **包管理器**：pnpm
- **代码规范**：ESLint + Prettier
- **类型检查**：TypeScript strict mode

## 实现方案

### 技术架构

采用前后端分离架构：

- **前端**：React SPA 负责 UI 交互和可视化渲染
- **后端代理**：Express.js 中间层保护 API Key，转发请求到 Claude 和 Tavily
- **状态管理**：Zustand 管理全局树状态，避免 prop drilling
- **可视化层**：React Flow 处理节点布局、连接线渲染和交互

### 核心数据结构

```typescript
// 树节点数据结构
interface TreeNode {
  id: string;                    // 唯一标识
  label: string;                 // 节点显示文本
  type: 'branch' | 'leaf';       // 枝干节点或叶子节点
  status: 'idle' | 'growing' | 'pruned';  // 节点状态
  depth: number;                 // 树的深度层级
  parentId: string | null;       // 父节点 ID
  children: string[];            // 子节点 ID 列表
  sources?: SourceItem[];        // 叶子节点的资料来源
}

// 资料来源数据结构
interface SourceItem {
  title: string;
  url: string;
  snippet: string;
}

// Zustand Store 结构
interface TreeStore {
  nodes: Map<string, TreeNode>;
  rootId: string | null;
  selectedNodeId: string | null;
  addNode: (node: TreeNode) => void;
  updateNode: (id: string, updates: Partial<TreeNode>) => void;
  pruneNode: (id: string) => void;
  selectNode: (id: string) => void;
}
```

### 实现细节

#### 1. 种子种植流程

- 用户在输入框输入主题 → 前端调用后端 `/api/claude/generate-topics` 接口
- 后端转发请求到 Claude API，携带 prompt："将主题 X 拆解为 3-5 个核心子主题"
- 解析 Claude 响应，创建根节点和第一层子节点
- 使用 React Flow 的自动布局算法（dagre）渲染树形结构

#### 2. AI 拆解模式

- 用户选中枝干节点，点击"AI 拆解"按钮
- 节点状态更新为 `growing`，显示加载动画
- 调用 `/api/claude/expand-topic`，传递当前节点标签和父节点路径（提供上下文）
- Claude 返回 3-5 个子主题，创建新枝干节点并连接到当前节点
- 更新 React Flow 布局，平滑过渡动画

#### 3. 资料搜索模式

- 用户选中节点，点击"搜索资料"按钮
- 调用 `/api/tavily/search`，传递节点标签作为搜索关键词
- Tavily 返回搜索结果列表（标题、URL、摘要）
- 在侧边面板展示结果供用户筛选，勾选的资料创建为叶子节点

#### 4. 修剪功能

- 用户点击节点的"剪枝"按钮
- 递归将该节点及所有子孙节点状态设为 `pruned`
- React Flow 自定义节点组件根据状态应用半透明样式
- 被剪枝节点不参与导出

#### 5. 导出功能

- 遍历树结构，过滤 `pruned` 状态节点
- 按深度递归生成 Markdown 文本（使用缩进表示层级）
- 叶子节点的资料链接格式化为超链接
- 触发浏览器下载 `.md` 文件

### 性能优化

#### React Flow 渲染优化

- 使用 React.memo 包裹自定义节点组件，避免不必要的重渲染
- 大规模节点时（>100 个）启用虚拟化渲染
- 节点位置计算使用 Web Worker 处理（避免阻塞主线程）

#### API 调用优化

- 实现请求防抖（debounce 500ms）避免重复调用
- Claude API 调用添加超时控制（30s）和错误重试（最多 3 次）
- Tavily 搜索结果本地缓存（5 分钟过期），相同关键词直接返回缓存

#### 状态管理优化

- Zustand 使用 immer 中间件简化不可变更新
- 节点数据使用 Map 而非数组，O(1) 查找性能
- 选择性订阅（selector）避免组件订阅整个 store

### 实现注意事项

#### API 安全

- **绝不在前端暴露 API Key**：所有密钥存储在后端 `.env` 文件
- 后端添加 CORS 配置，仅允许前端域名访问
- 实现速率限制（rate limiting）防止滥用：每 IP 每分钟最多 20 次请求

#### 错误处理

- API 调用失败时显示友好错误提示（使用 MUI Snackbar）
- Claude API 返回格式异常时提供降级方案（固定模板子主题）
- 网络超时时允许用户重试，保存当前树状态避免丢失

#### 用户体验

- 节点生长过程显示加载骨架屏，避免空白等待
- 使用 MUI 的 Backdrop 组件在全局操作时遮罩页面
- 实现撤销/重做功能（保存操作历史栈）
- 定期自动保存树状态到 localStorage，刷新页面不丢失

#### 日志记录

- 后端记录所有 API 调用日志（时间戳、请求参数、响应状态）
- 前端错误使用 Sentry 等工具收集，便于问题排查
- 避免记录用户输入的敏感内容

## 架构设计

### 系统架构图



### 模块划分

#### 前端模块

**UI 组件模块** (`src/components/`)

- `TopicInput.tsx`：主题输入框组件，支持回车提交
- `TreeCanvas.tsx`：React Flow 画布容器，处理布局和交互
- `CustomNode.tsx`：自定义节点渲染，根据类型和状态显示不同样式
- `NodePanel.tsx`：节点操作面板，显示 AI 拆解、搜索资料、剪枝按钮
- `SourceList.tsx`：搜索结果列表，支持复选框筛选
- `ExportButton.tsx`：导出按钮，触发 Markdown 生成和下载

**状态管理模块** (`src/store/`)

- `treeStore.ts`：Zustand store，管理树节点、选中状态、操作方法
- `layoutStore.ts`：管理画布视口状态（缩放、平移）

**服务模块** (`src/services/`)

- `claudeService.ts`：封装 Claude API 调用逻辑
- `tavilyService.ts`：封装 Tavily API 调用逻辑
- `exportService.ts`：树结构导出为 Markdown 的转换逻辑

**工具模块** (`src/utils/`)

- `layoutUtils.ts`：树形布局算法（基于 dagre）
- `idGenerator.ts`：唯一 ID 生成器
- `storageUtils.ts`：localStorage 持久化工具

#### 后端模块

**路由模块** (`server/routes/`)

- `claude.routes.js`：Claude API 代理路由
- `tavily.routes.js`：Tavily API 代理路由

**中间件模块** (`server/middleware/`)

- `rateLimit.js`：速率限制中间件
- `errorHandler.js`：统一错误处理
- `cors.js`：跨域配置

**服务模块** (`server/services/`)

- `claudeClient.js`：Claude API 客户端封装
- `tavilyClient.js`：Tavily API 客户端封装

### 数据流



## 目录结构

### 项目整体结构概览

从零创建 KnoTree 项目，采用前后端分离架构。前端使用 React + TypeScript + Vite 构建 SPA，后端使用 Express.js 作为 API 代理层保护密钥。项目包含完整的开发配置、类型定义、组件模块、状态管理、服务层和部署配置。

```
knotree/
├── client/                          # 前端应用目录
│   ├── public/
│   │   └── favicon.ico              # [NEW] 网站图标
│   ├── src/
│   │   ├── components/              # UI 组件目录
│   │   │   ├── TopicInput.tsx       # [NEW] 主题输入框组件。实现带验证的输入框，支持回车提交，调用 store 的 createRoot 方法，显示加载状态和错误提示。
│   │   │   ├── TreeCanvas.tsx       # [NEW] React Flow 画布组件。配置 React Flow 实例，集成自定义节点类型，实现自动布局（dagre 算法），处理节点点击、拖拽、缩放等交互事件。
│   │   │   ├── CustomNode.tsx       # [NEW] 自定义节点组件。根据节点类型（branch/leaf）和状态（idle/growing/pruned）渲染不同样式，枝干节点显示标签和操作按钮，叶子节点显示资料标题和链接，使用 MUI Card 和 IconButton。
│   │   │   ├── NodePanel.tsx        # [NEW] 节点操作面板组件。当节点被选中时显示在侧边栏，包含"AI 拆解"、"搜索资料"、"剪枝"三个操作按钮，根据节点类型和状态动态启用/禁用按钮。
│   │   │   ├── SourceList.tsx       # [NEW] 资料列表组件。展示 Tavily 搜索结果，每项包含复选框、标题、URL、摘要，支持批量选择，点击"添加到树"按钮创建叶子节点。
│   │   │   └── ExportButton.tsx     # [NEW] 导出按钮组件。调用 exportService 生成 Markdown 文本，触发浏览器下载 .md 文件，显示导出成功提示。
│   │   ├── store/                   # 状态管理目录
│   │   │   ├── treeStore.ts         # [NEW] Zustand 树状态管理。定义 TreeStore 接口，使用 Map 存储节点，实现 addNode、updateNode、pruneNode、selectNode 等方法，集成 immer 中间件，提供持久化 hook。
│   │   │   └── layoutStore.ts       # [NEW] Zustand 画布状态管理。管理 React Flow 视口状态（zoom、position），提供 setViewport、fitView 等方法。
│   │   ├── services/                # 服务层目录
│   │   │   ├── claudeService.ts     # [NEW] Claude API 服务。封装 generateTopics（生成子主题）和 expandTopic（拆解主题）两个方法，使用 axios 调用后端代理接口，实现请求防抖和错误处理。
│   │   │   ├── tavilyService.ts     # [NEW] Tavily API 服务。封装 searchResources 方法，调用后端代理接口搜索资料，实现结果缓存（5 分钟）和错误重试机制。
│   │   │   └── exportService.ts     # [NEW] 导出服务。实现 exportToMarkdown 方法，递归遍历树结构，过滤已剪枝节点，生成缩进格式的 Markdown 文本，叶子节点格式化为超链接。
│   │   ├── utils/                   # 工具函数目录
│   │   │   ├── layoutUtils.ts       # [NEW] 布局工具函数。使用 dagre 算法计算树形布局，将节点坐标转换为 React Flow 格式，实现层级对齐和间距控制。
│   │   │   ├── idGenerator.ts       # [NEW] ID 生成器。生成唯一节点 ID（使用 nanoid 或 uuid），确保节点标识唯一性。
│   │   │   └── storageUtils.ts      # [NEW] 本地存储工具。封装 localStorage 操作，实现树状态的保存和恢复，处理 JSON 序列化和反序列化。
│   │   ├── types/                   # TypeScript 类型定义目录
│   │   │   ├── tree.types.ts        # [NEW] 树节点类型定义。定义 TreeNode、SourceItem、NodeType、NodeStatus 等核心类型接口。
│   │   │   └── api.types.ts         # [NEW] API 请求/响应类型定义。定义 Claude 和 Tavily API 的请求参数和响应数据类型。
│   │   ├── App.tsx                  # [NEW] 根组件。组合 TopicInput、TreeCanvas、NodePanel 三个主要组件，使用 MUI ThemeProvider 提供主题，实现整体布局（左侧画布、右侧面板）。
│   │   ├── main.tsx                 # [NEW] 应用入口文件。渲染 React 根组件，挂载到 DOM，导入全局样式。
│   │   └── vite-env.d.ts            # [NEW] Vite 环境类型声明文件。
│   ├── index.html                   # [NEW] HTML 入口文件。引用 main.tsx，配置页面标题和 meta 标签。
│   ├── vite.config.ts               # [NEW] Vite 配置文件。配置开发服务器端口（5173）、代理后端请求到 3001 端口、构建输出目录、React 插件。
│   ├── tsconfig.json                # [NEW] TypeScript 配置。启用 strict 模式，配置路径别名 @/ 指向 src/，设置 JSX 为 react-jsx。
│   ├── tsconfig.node.json           # [NEW] Node 环境的 TypeScript 配置。
│   ├── package.json                 # [NEW] 前端依赖配置。包含 react、react-dom、react-flow-renderer、zustand、@mui/material、axios、dagre、nanoid 等依赖，定义 dev、build、preview 脚本。
│   └── .eslintrc.cjs                # [NEW] ESLint 配置文件。配置 React 和 TypeScript 规则。
├── server/                          # 后端应用目录
│   ├── routes/                      # 路由目录
│   │   ├── claude.routes.js         # [NEW] Claude API 路由。定义 POST /api/claude/generate-topics 和 POST /api/claude/expand-topic 两个端点，调用 claudeClient 处理请求。
│   │   └── tavily.routes.js         # [NEW] Tavily API 路由。定义 POST /api/tavily/search 端点，调用 tavilyClient 搜索资料。
│   ├── middleware/                  # 中间件目录
│   │   ├── rateLimit.js             # [NEW] 速率限制中间件。使用 express-rate-limit 限制每 IP 每分钟最多 20 次请求，超出返回 429 错误。
│   │   ├── errorHandler.js          # [NEW] 错误处理中间件。捕获所有路由错误，返回统一格式的 JSON 错误响应，记录错误日志。
│   │   └── cors.js                  # [NEW] CORS 中间件。配置允许的前端域名（localhost:5173），支持预检请求。
│   ├── services/                    # 服务目录
│   │   ├── claudeClient.js          # [NEW] Claude API 客户端。使用 anthropic SDK 初始化客户端，实现 generateTopics 和 expandTopic 方法，处理 API 响应解析和错误处理，设置 30 秒超时。
│   │   └── tavilyClient.js          # [NEW] Tavily API 客户端。使用 tavily SDK 初始化客户端，实现 search 方法，返回标题、URL、摘要字段，处理搜索失败情况。
│   ├── config/                      # 配置目录
│   │   └── env.js                   # [NEW] 环境变量配置。从 .env 文件加载 CLAUDE_API_KEY、TAVILY_API_KEY、PORT 等变量，提供验证和默认值。
│   ├── server.js                    # [NEW] Express 服务器主文件。初始化 Express 应用，注册中间件（cors、json parser、rateLimit），挂载路由，启动服务器监听 3001 端口，注册错误处理中间件。
│   └── package.json                 # [NEW] 后端依赖配置。包含 express、@anthropic-ai/sdk、tavily、dotenv、express-rate-limit、cors 等依赖，定义 start 和 dev 脚本（使用 nodemon）。
├── .env.example                     # [NEW] 环境变量示例文件。列出 CLAUDE_API_KEY、TAVILY_API_KEY、PORT 等变量，提供配置说明。
├── .gitignore                       # [NEW] Git 忽略文件。忽略 node_modules、dist、.env、.DS_Store 等文件。
├── README.md                        # [NEW] 项目说明文档。包含项目简介、功能特性、技术栈、安装步骤、使用说明、API 密钥获取方式、部署指南。
└── package.json                     # [NEW] 根目录包管理配置。定义 workspaces（client、server），提供统一的 install、dev、build 脚本。
```

## 关键代码结构

### 核心类型定义

```typescript
// src/types/tree.types.ts

export type NodeType = 'branch' | 'leaf';

export type NodeStatus = 'idle' | 'growing' | 'pruned';

export interface SourceItem {
  title: string;
  url: string;
  snippet: string;
}

export interface TreeNode {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  depth: number;
  parentId: string | null;
  children: string[];
  sources?: SourceItem[];  // 仅叶子节点有此字段
}

export interface TreeStore {
  nodes: Map<string, TreeNode>;
  rootId: string | null;
  selectedNodeId: string | null;
  
  // 操作方法
  createRoot: (label: string, children: TreeNode[]) => Promise<void>;
  addNode: (node: TreeNode) => void;
  updateNode: (id: string, updates: Partial<TreeNode>) => void;
  pruneNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  expandNode: (id: string, mode: 'ai' | 'search') => Promise<void>;
  
  // 辅助方法
  getNode: (id: string) => TreeNode | undefined;
  getChildren: (id: string) => TreeNode[];
  getUnprunedTree: () => TreeNode[];
}
```

### API 请求/响应类型

```typescript
// src/types/api.types.ts

export interface GenerateTopicsRequest {
  topic: string;
}

export interface GenerateTopicsResponse {
  topics: string[];
}

export interface ExpandTopicRequest {
  topic: string;
  context: string[];  // 父节点路径
}

export interface ExpandTopicResponse {
  subtopics: string[];
}

export interface SearchResourcesRequest {
  query: string;
}

export interface SearchResourcesResponse {
  results: SourceItem[];
}
```

### Zustand Store 接口

```typescript
// src/store/treeStore.ts (仅接口签名)

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useTreeStore = create<TreeStore>()(
  immer((set, get) => ({
    nodes: new Map(),
    rootId: null,
    selectedNodeId: null,
    
    createRoot: async (label: string, children: TreeNode[]) => {
      // 实现：调用 Claude API 生成子主题，创建根节点和第一层子节点
    },
    
    addNode: (node: TreeNode) => {
      // 实现：添加节点到 Map，更新父节点的 children 数组
    },
    
    updateNode: (id: string, updates: Partial<TreeNode>) => {
      // 实现：合并更新节点属性
    },
    
    pruneNode: (id: string) => {
      // 实现：递归设置节点及子孙节点状态为 pruned
    },
    
    selectNode: (id: string | null) => {
      // 实现：设置 selectedNodeId
    },
    
    expandNode: async (id: string, mode: 'ai' | 'search') => {
      // 实现：根据模式调用 Claude 或 Tavily API，创建子节点
    },
    
    getNode: (id: string) => get().nodes.get(id),
    
    getChildren: (id: string) => {
      const node = get().nodes.get(id);
      return node ? node.children.map(cid => get().nodes.get(cid)!).filter(Boolean) : [];
    },
    
    getUnprunedTree: () => {
      // 实现：过滤未剪枝节点，返回树结构数组
    }
  }))
);
```

### React Flow 自定义节点组件接口

```typescript
// src/components/CustomNode.tsx (仅组件签名)

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, IconButton } from '@mui/material';

interface CustomNodeData {
  label: string;
  type: NodeType;
  status: NodeStatus;
  sources?: SourceItem[];
  onExpand?: (mode: 'ai' | 'search') => void;
  onPrune?: () => void;
}

export const CustomNode = memo<NodeProps<CustomNodeData>>(({ data }) => {
  // 实现：根据 type 和 status 渲染不同样式，
  // 枝干节点显示操作按钮，叶子节点显示资料链接
});
```

## 设计风格

采用**现代科技感的自然生长主题**设计，将抽象的知识探索过程具象化为一棵生机勃勃的知识之树。设计融合了扁平化设计、微动效和层次感，营造出既专业又富有活力的视觉体验。

### 整体布局

- **左侧主画布（70%）**：深色背景的 React Flow 画布，支持拖拽、缩放、平移，节点自动以树形布局排列
- **右侧操作面板（30%）**：浅色卡片式面板，根据选中节点动态显示操作按钮和搜索结果
- **顶部工具栏**：包含主题输入框、导出按钮、帮助图标，使用 MUI AppBar 组件

### 节点设计

#### 枝干节点（Branch Node）

- **样式**：圆角矩形卡片，使用渐变背景（从主色到次主色）
- **内容**：节点标签 + 深度层级标识 + 操作图标
- **状态区分**：
- `idle`：正常渐变色，边框高亮
- `growing`：脉动动画 + 骨架屏效果
- `pruned`：降低不透明度至 0.3，去饱和度

#### 叶子节点（Leaf Node）

- **样式**：较小的圆角卡片，单色背景
- **内容**：资料标题（可点击） + 外链图标
- **悬停效果**：卡片轻微上浮 + 阴影加深

### 连接线设计

- 使用 React Flow 的 Bezier 曲线连接线
- 根据子节点状态调整连接线颜色（pruned 时半透明灰色）
- 添加箭头标记表示知识流向

### 交互动画

- **节点生长**：新节点从父节点位置淡入 + 缩放动画（0.5s ease-out）
- **节点选中**：边框高亮 + 轻微放大（scale 1.05）
- **剪枝效果**：淡出动画 + 递归传播到子节点（延迟 100ms）
- **悬停反馈**：按钮和卡片的 elevation 提升，配合 MUI 的 hover 状态

### 响应式设计

- **桌面端（>1200px）**：左右分栏布局，画布 70% 面板 30%
- **平板端（768px-1200px）**：面板变为可折叠抽屉，画布占满屏幕
- **移动端（<768px）**：全屏画布，面板改为底部模态框，操作按钮改为浮动按钮

### 关键页面设计

#### 主界面

- **顶部区域**：Logo + 主题输入框 + 导出按钮
- **画布区域**：深色网格背景，中心显示知识树
- **侧边面板**：节点详情卡片 + 操作按钮组 + 搜索结果列表
- **空状态**：画布中心显示引导文案"种下你的第一颗知识种子"+ 示例主题按钮

#### 资料筛选界面

- 当用户点击"搜索资料"后，侧边面板切换为搜索结果列表
- 每个结果项包含：复选框 + 标题 + URL + 摘要（最多 2 行）
- 底部固定操作栏：全选按钮 + 取消按钮 + 添加按钮（显示已选数量）