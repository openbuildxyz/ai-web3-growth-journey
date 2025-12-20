# AI求职平台

基于AI技术的智能求职平台，为求职者和招聘者提供精准匹配服务。

## 功能特色

### 🎯 智能匹配
- 基于AI算法精准匹配求职者与职位
- 多维度筛选和推荐
- 实时匹配度计算

### 📤 信息上传
- 安全上传简历和公司信息
- 区块链技术确保信息可追溯
- 支持多种文件格式

### 🤖 AI助手
- 智能Agent协助沟通和筛选
- 个性化设置和偏好
- 自动化回复和推荐

### 💬 即时对话
- 实时与对方AI助手进行对话
- 智能消息处理和回复
- 在线状态显示

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **UI组件**: 自定义组件

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 项目结构

```
ai求职/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 仪表板页面
│   │   └── [role]/       # 动态路由 - 角色页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── public/               # 静态资源
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目说明
```

## 功能模块

### 1. 角色选择
- 求职者：寻找理想工作机会
- 招聘者：寻找优秀人才

### 2. 信息上传
- 基本信息填写
- 文件上传（简历/公司介绍）
- 区块链信息存储

### 3. Agent设置
- 沟通风格配置
- 匹配策略设置
- AI助手偏好

### 4. 需求筛选
- 智能搜索功能
- 多条件筛选
- 匹配结果展示

### 5. 对话功能
- 联系人列表
- 实时对话窗口
- AI助手协助

## 开发说明

### 样式规范
- 使用 Tailwind CSS 进行样式开发
- 自定义组件类在 `globals.css` 中定义
- 响应式设计支持移动端和桌面端

### 组件结构
- 使用函数式组件和 Hooks
- TypeScript 类型定义
- 动画效果使用 Framer Motion

### 状态管理
- 使用 React useState 进行本地状态管理
- 组件间通信通过 props 传递

## 部署

### Vercel 部署
推荐使用 Vercel 进行部署：

1. 连接 GitHub 仓库
2. 自动构建和部署
3. 支持预览环境

### 其他平台
也可以部署到其他支持 Node.js 的平台：
- Netlify
- Railway
- Heroku

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License 