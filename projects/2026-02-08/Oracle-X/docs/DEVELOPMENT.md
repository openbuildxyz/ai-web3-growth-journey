# 开发指南

本文档提供 Oracle-X 项目的本地开发指南，帮助开发者快速上手。

---

## 环境准备

### 必要工具

- **Node.js**: 20.x 或更高版本
- **npm**: 10.x 或更高版本（或使用 pnpm）
- **Git**: 用于版本控制
- **代码编辑器**: 推荐 VS Code

### VS Code 推荐扩展

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/oracle-x.git
cd oracle-x
```

### 2. 安装依赖

```bash
npm install
```

或使用 pnpm（更快）：

```bash
pnpm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入真实的 API Keys：

```bash
# 必需配置
STEP_API_KEY=你的_阶跃星辰_API_KEY

# 可选配置（用于 Twitter 情绪分析）
RAPIDAPI_KEY=你的_RAPIDAPI_KEY
```

**获取 API Keys：**

- **Step API Key**: [阶跃星辰平台](https://platform.stepfun.com/)
- **RapidAPI Key**: [RapidAPI Hub](https://rapidapi.com/)

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 即可查看应用。

---

## 项目结构

```
oracle-x/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes (后端)
│   │   ├── analyze/      # 交易分析 API
│   │   └── ...
│   ├── components/       # React 组件
│   │   ├── Header/
│   │   ├── MarketCard/
│   │   └── ...
│   ├── hooks/            # 自定义 Hooks
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 主页面
├── extension/            # Chrome 扩展
│   ├── manifest.json
│   ├── background.js
│   └── sidepanel/
├── lib/                  # 工具库
│   ├── ai-client.ts      # AI API 封装
│   ├── indicators.ts     # 技术指标计算
│   ├── validators.ts     # 数据校验
│   └── ...
├── types/                # TypeScript 类型定义
│   └── analyze.ts
├── docs/                 # 项目文档
├── public/               # 静态文件
├── .env.example          # 环境变量示例
├── .eslintrc.json        # ESLint 配置
├── .prettierrc           # Prettier 配置
├── tsconfig.json         # TypeScript 配置
├── next.config.js        # Next.js 配置
└── package.json
```

---

## 开发工作流

### 代码风格检查

运行 ESLint 检查代码质量：

```bash
npm run lint
```

自动修复可修复的问题：

```bash
npm run lint:fix
```

### 代码格式化

使用 Prettier 格式化代码：

```bash
npm run format
```

检查格式而不修改文件：

```bash
npm run format:check
```

### TypeScript 类型检查

```bash
npm run type-check
```

### 推荐开发流程

1. **编写代码**
2. **保存文件** → VS Code 会自动运行 Prettier（如已配置）
3. **提交前检查**:
   ```bash
   npm run lint:fix
   npm run format
   npm run type-check
   ```
4. **提交代码**（使用语义化提交信息）

---

## 调试技巧

### 前端调试

1. **使用浏览器开发者工具**
   - Chrome DevTools
   - React Developer Tools 扩展

2. **日志输出**

   ```typescript
   console.log('Debug info:', data);
   console.warn('Warning:', issue);
   console.error('Error:', error);
   ```

3. **断点调试**
   - 在 VS Code 中设置断点
   - 使用 "JavaScript Debug Terminal"

### 后端调试

1. **查看服务器日志**

   ```bash
   # 开发服务器会在终端输出日志
   npm run dev
   ```

2. **API 端点测试**

   ```bash
   # 使用 curl 测试
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"symbol":"ETHUSDT","direction":"LONG",...}'
   ```

3. **使用 Postman 或 Insomnia**
   - 导入 API 端点进行交互式测试

### Chrome 扩展调试

1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 加载 `extension/` 文件夹
4. 点击"检查视图"查看控制台日志

---

## 常见问题

### Q: 依赖安装失败

**A**: 尝试清除缓存并重新安装：

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Q: TypeScript 报错找不到模块

**A**: 确保 `tsconfig.json` 中的路径别名配置正确，然后重启 TypeScript 服务器（VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"）。

### Q: API 请求失败 (CORS 错误)

**A**:

1. 检查 `.env.local` 中的 API Keys 是否正确
2. 确保 Binance API 可访问（检查网络代理）
3. 查看浏览器控制台的详细错误信息

### Q: 热重载不工作

**A**:

1. 确保文件在 Next.js 监听的目录内
2. 重启开发服务器 `npm run dev`
3. 检查是否有文件系统权限问题

### Q: Chrome 扩展无法加载

**A**:

1. 确保 `manifest.json` 格式正确
2. 检查"开发者模式"是否启用
3. 查看扩展详情页面的错误提示

---

## 性能优化建议

### 前端

1. **使用 React.memo 避免不必要的重渲染**

   ```typescript
   export const MemoizedComponent = React.memo(Component);
   ```

2. **懒加载非关键组件**

   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'));
   ```

3. **优化图表渲染**
   - 限制图表数据点数量
   - 使用 `requestAnimationFrame` 优化动画

### 后端

1. **避免在 API 中进行大量计算**
   - 将复杂计算移至客户端
   - 或使用缓存机制

2. **优化数据传输**
   - 压缩响应数据
   - 只返回必要字段

---

## 测试

### 单元测试（计划中）

```bash
npm test
```

### 端到端测试（计划中）

```bash
npm run test:e2e
```

---

## 贡献代码

请参考 [贡献指南](../CONTRIBUTING.md) 了解详细的代码提交流程。

---

## 资源链接

- **Next.js 文档**: https://nextjs.org/docs
- **React 文档**: https://react.dev
- **TypeScript 手册**: https://www.typescriptlang.org/docs
- **technicalindicators**: https://github.com/anandanand84/technicalindicators
- **lightweight-charts**: https://tradingview.github.io/lightweight-charts/

---

## 获取帮助

遇到问题？可以通过以下方式获取帮助：

- 查看 [FAQ](../README.md#常见问题)
- 提交 [GitHub Issue](https://github.com/yourusername/oracle-x/issues)
- 查阅项目文档 (`docs/`)

祝开发愉快！🚀
