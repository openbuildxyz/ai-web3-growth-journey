# 贡献指南

感谢您对 Oracle-X 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 Bug 修复
- ✨ 新功能开发
- 📝 文档改进
- 🎨 UI/UX 优化
- 🧪 测试用例添加

## 开发环境设置

### 前置要求

- Node.js 20+
- npm 或 pnpm
- Git

### 安装步骤

1. **Fork 并克隆仓库**

```bash
git clone https://github.com/your-username/oracle-x.git
cd oracle-x
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 为 `.env.local` 并填入真实的 API Keys：

```bash
cp .env.example .env.local
```

4. **启动开发服务器**

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 开发规范

### 代码风格

本项目使用 ESLint 和 Prettier 保证代码质量和一致性：

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格问题
npm run lint:fix

# 格式化代码
npm run format

# 检查格式（不修改文件）
npm run format:check
```

**请在提交代码前运行 `npm run lint:fix` 和 `npm run format`。**

### TypeScript 类型检查

确保所有代码都通过 TypeScript 类型检查：

```bash
npm run type-check
```

### 提交规范

我们使用语义化提交信息（Semantic Commit Messages）：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

#### 示例

```bash
feat(api): 添加社交情绪分析 API

新增 /api/sentiment 端点，集成 Twitter API 获取实时情绪数据。

Closes #123
```

## 分支管理

- `main`: 主分支，保持稳定可发布状态
- `develop`: 开发分支，日常开发在此进行
- `feature/*`: 功能分支
- `fix/*`: Bug 修复分支

### 工作流程

1. 从 `develop` 分支创建新分支

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. 开发并提交代码

```bash
git add .
git commit -m "feat: your feature description"
```

3. 推送到远程仓库

```bash
git push origin feature/your-feature-name
```

4. 在 GitHub 上创建 Pull Request，指向 `develop` 分支

## Pull Request 指南

### 创建 PR 前

- ✅ 代码通过所有检查（`npm run lint`、`npm run type-check`）
- ✅ 添加必要的注释和文档
- ✅ 测试所有相关功能
- ✅ 同步最新的 `develop` 分支代码

### PR 描述模板

```markdown
## 概述

简要描述本次 PR 的目的和内容

## 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 变更内容

- 详细列出主要变更点
- 可以包含截图或 GIF 演示

## 测试

说明如何测试这些变更

## 相关 Issue

Closes #issue_number

## 检查清单

- [ ] 代码已通过 ESLint 检查
- [ ] 代码已通过 TypeScript 类型检查
- [ ] 已测试核心功能
- [ ] 已更新相关文档
```

## 代码审查

所有 PR 都需要至少一位维护者的审查和批准。审查者会关注：

- 代码质量和可读性
- 是否符合项目架构
- 性能影响
- 安全性考虑
- 测试覆盖率

## 报告 Bug

使用 GitHub Issues 报告 Bug，请提供：

1. **环境信息**：操作系统、Node 版本、浏览器版本
2. **重现步骤**：详细的操作步骤
3. **预期行为**：你期望发生什么
4. **实际行为**：实际发生了什么
5. **截图或日志**：如果适用

## 功能请求

欢迎提出新功能建议！请在 Issue 中说明：

1. **问题背景**：这个功能要解决什么问题
2. **建议方案**：你期望的实现方式
3. **替代方案**：是否有其他可行的方式
4. **附加信息**：任何有助于理解的补充信息

## 联系方式

如有任何问题，可以通过以下方式联系我们：

- GitHub Issues
- Email: your.email@example.com

再次感谢您的贡献！🎉
