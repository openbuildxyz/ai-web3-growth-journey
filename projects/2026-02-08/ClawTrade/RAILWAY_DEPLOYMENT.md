# ClawTrade 后端 Railway 部署指南

## 📦 项目技术栈
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **API**: CoinGecko

---

## 🚀 快速部署步骤

### 1. 准备代码仓库
确保代码已推送到 GitHub：
```bash
git add .
git commit -m "准备部署到 Railway"
git push origin main
```

### 2. 在 Railway 创建项目

#### 2.1 登录 Railway
访问 https://railway.app 并使用 GitHub 登录

#### 2.2 创建新项目
1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 授权 Railway 访问你的 GitHub
4. 选择 `clawTrade` 仓库
5. Railway 会自动检测 Node.js 项目

#### 2.3 配置根目录
如果 Railway 没有自动检测到 `server` 目录：
1. 在项目设置中找到 **"Root Directory"**
2. 设置为 `server`

### 3. 添加 PostgreSQL 数据库

1. 在 Railway 项目面板点击 **"+ New"**
2. 选择 **"Database"** → **"Add PostgreSQL"**
3. 数据库会自动创建，并生成 `DATABASE_URL` 变量
4. 确保数据库服务与后端服务在同一个项目中

### 4. 配置环境变量

在 **Variables** 标签页添加以下变量：

#### 必需变量
```bash
# 数据库连接（Railway 自动生成，可能需要调整格式）
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 端口（Railway 自动提供）
PORT=${{PORT}}

# CORS 配置（改为你的前端域名）
CORS_ORIGIN=https://your-frontend.vercel.app

# Node 环境
NODE_ENV=production
```

#### 可选变量
```bash
# CoinGecko API
COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### 5. 部署配置

Railway 会自动使用 `railway.json` 配置：

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 6. 触发部署

1. Railway 会自动检测代码变化并开始部署
2. 你也可以手动触发：点击 **"Deploy"** → **"Redeploy"**
3. 查看实时日志监控部署进度

---

## 🔍 验证部署

### 检查健康状态
访问你的 Railway 域名：
```
https://your-app.railway.app/health
```

预期响应：
```json
{
  "status": "healthy",
  "service": "ClawTrade API",
  "version": "1.0.0",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ"
}
```

### 测试 API 端点
```bash
# 获取市场价格
curl https://your-app.railway.app/api/market/prices

# 查看 AI Agent 状态
curl https://your-app.railway.app/api/openclaw/status
```

---

## 🔧 常见问题

### 问题 1: 数据库连接失败
**错误**: `Error: P1001: Can't reach database server`

**解决方案**:
1. 检查 `DATABASE_URL` 格式是否正确
2. 确保使用了 Railway Postgres 的内部 URL（`${{Postgres.DATABASE_URL}}`）
3. 验证数据库服务状态是否健康

### 问题 2: Prisma 迁移失败
**错误**: `Error: Migration engine error`

**解决方案**:
```bash
# 在本地先生成迁移文件
npm run prisma:migrate dev

# 提交迁移文件
git add prisma/migrations
git commit -m "添加 Prisma 迁移"
git push

# Railway 会在部署时自动执行 prisma migrate deploy
```

### 问题 3: TypeScript 编译错误
**错误**: `error TS2307: Cannot find module`

**解决方案**:
1. 检查 `tsconfig.json` 配置
2. 确保所有依赖都在 `package.json` 的 `dependencies` 中（不是 `devDependencies`）
3. 清理并重新构建：
```bash
rm -rf dist node_modules
npm install
npm run build
```

### 问题 4: CORS 错误
**错误**: 前端请求被 CORS 阻止

**解决方案**:
在 Railway 环境变量中更新 `CORS_ORIGIN`：
```bash
CORS_ORIGIN=https://your-frontend.vercel.app,https://another-domain.com
```

如果需要允许多个域名，修改 `src/index.ts`：
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true
}));
```

---

## 📊 监控与维护

### 查看日志
在 Railway 项目面板：
1. 点击你的服务
2. 切换到 **"Logs"** 标签
3. 查看实时日志流

### 设置自定义域名
1. 在 **"Settings"** 中找到 **"Domains"**
2. 点击 **"Generate Domain"** 获取免费的 railway.app 域名
3. 或添加自定义域名（需要配置 DNS）

### 环境变量管理
- 在 **"Variables"** 标签添加/修改变量
- 修改变量后会自动触发重新部署

### 数据库管理
1. 点击 PostgreSQL 服务
2. 切换到 **"Data"** 标签
3. 可以直接执行 SQL 查询

---

## 🔄 更新部署

### 自动部署（推荐）
Railway 默认开启自动部署，每次推送代码到 main 分支会自动部署：
```bash
git add .
git commit -m "更新功能"
git push origin main
```

### 手动部署
在 Railway 面板：
1. 点击 **"Deployments"**
2. 点击 **"Redeploy"**

---

## 💰 成本估算

Railway 提供：
- **Hobby Plan**: $5/月，包含 $5 使用额度
- **Developer Plan**: $20/月，包含 $10 使用额度 + 额外功能

预估成本（小型项目）：
- PostgreSQL: ~$2-3/月
- Node.js 服务: ~$2-3/月
- **总计**: ~$5/月（在免费额度内）

---

## 📚 相关资源

- [Railway 文档](https://docs.railway.app/)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [Express.js 生产最佳实践](https://expressjs.com/en/advanced/best-practice-production.html)

---

## 🎯 下一步

部署成功后：
1. ✅ 更新前端的 API 地址指向 Railway 域名
2. ✅ 配置自定义域名（可选）
3. ✅ 设置 GitHub Actions CI/CD（可选）
4. ✅ 添加监控告警（可选）

---

**祝部署顺利！** 🚀

如有问题，请查看 Railway 日志或联系技术支持。
