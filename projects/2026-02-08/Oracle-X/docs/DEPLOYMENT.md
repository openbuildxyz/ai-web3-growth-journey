# 部署指南

Oracle-X 主要部署在 Vercel 平台，支持自动化 CI/CD 流程。

---

## Vercel 部署（推荐）

### 前置要求

- GitHub 账号
- Vercel 账号（https://vercel.com）

### 快速部署

#### 方法 1: 通过 Vercel Dashboard

1. **连接 GitHub 仓库**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New Project"
   - 选择 Oracle-X 的 GitHub 仓库
   - 授权 Vercel 访问仓库

2. **配置项目**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` （项目根目录）
   - **Build Command**: `npm run build` (默认)
   - **Output Directory**: `.next` (默认)

3. **配置环境变量**

   在 Vercel 项目设置中添加以下环境变量：

   ```
   STEP_API_KEY=your_step_api_key
   AI_MODEL=step-3.5-flash
   AI_BASE_URL=https://api.stepfun.com/v1
   AI_TEMPERATURE=0.3
   AI_MAX_TOKENS=1000
   AI_VISION_MODEL=step-1o-turbo-vision

   # 可选
   RAPIDAPI_KEY=your_rapidapi_key
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 1-2 分钟）
   - 访问 Vercel 提供的 URL 查看应用

#### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 自动部署

Vercel 会自动监听 GitHub 仓库的变动：

- **Push 到 `main` 分支** → 触发生产环境部署
- **Push 到其他分支** → 触发预览环境部署
- **Pull Request** → 自动生成预览链接

---

## 环境变量管理

### 生产环境

在 Vercel Dashboard → 项目设置 → Environment Variables 中配置：

```env
STEP_API_KEY=<production_key>
AI_MODEL=step-3.5-flash
RAPIDAPI_KEY=<production_key>
```

### 开发环境

在本地创建 `.env.local` 文件：

```bash
cp .env.example .env.local
# 编辑 .env.local 填入开发环境的 API Keys
```

### 预览环境

Vercel 会自动从生产环境复制环境变量到预览环境。如需不同配置，可单独设置。

---

## 自定义域名

### 添加域名

1. 在 Vercel Dashboard → Settings → Domains
2. 输入你的域名（如 `oraclex.com`）
3. 根据提示配置 DNS 记录：
   - **A 记录**: 指向 Vercel 的 IP
   - **CNAME 记录**: 指向 `cname.vercel-dns.com`

### SSL 证书

Vercel 自动为所有域名提供免费的 SSL 证书（Let's Encrypt）。

---

## 性能优化

### 边缘函数

Oracle-X 的 API 路由运行在 Vercel Edge Runtime 上：

- 全球边缘节点部署
- 低延迟响应（< 50ms）
- 自动扩容

### 图片优化

使用 Next.js Image 组件：

```jsx
import Image from 'next/image';

<Image src="/logo.png" alt="Logo" width={200} height={100} priority />;
```

### 缓存策略

在 `next.config.js` 中配置：

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};
```

---

## 监控与日志

### Vercel Analytics

在 Vercel Dashboard 中启用 Analytics 查看：

- 页面访问量
- 性能指标（Web Vitals）
- 用户地理分布

### 日志查看

```bash
# 查看最近的部署日志
vercel logs

# 实时查看日志
vercel logs --follow
```

### 错误追踪（可选）

集成 Sentry 进行错误监控：

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 回滚部署

### 通过 Dashboard

1. 进入 Vercel Dashboard → Deployments
2. 找到之前的正常部署
3. 点击 "..." → "Promote to Production"

### 通过 CLI

```bash
# 查看部署历史
vercel ls

# 回滚到指定部署
vercel rollback [deployment-url]
```

---

## 生产环境检查清单

部署前请确保：

- [ ] 所有环境变量已正确配置
- [ ] 代码通过 `npm run lint` 和 `npm run type-check`
- [ ] 本地测试通过 `npm run build`
- [ ] 敏感信息未提交到 Git
- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] Chrome 扩展已打包并测试
- [ ] API Keys 使用生产环境密钥
- [ ] 性能指标达标（Lighthouse Score > 90）

---

## 其他部署平台

### Docker 部署

1. **创建 Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

2. **构建镜像**

```bash
docker build -t oracle-x .
```

3. **运行容器**

```bash
docker run -p 3000:3000 \
  -e STEP_API_KEY=your_key \
  oracle-x
```

### VPS 部署（如 AWS EC2）

```bash
# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆代码
git clone https://github.com/yourusername/oracle-x.git
cd oracle-x

# 安装依赖
npm install

# 配置环境变量
nano .env.local

# 构建项目
npm run build

# 使用 PM2 运行（推荐）
npm install -g pm2
pm2 start npm --name "oracle-x" -- start
pm2 save
pm2 startup
```

---

## 故障排查

### 部署失败

**常见原因:**

1. 依赖安装失败 → 检查 `package.json`
2. 环境变量缺失 → 确认 Vercel 配置
3. 构建错误 → 查看构建日志

**解决方法:**

```bash
# 本地复现构建错误
npm run build
```

### 功能异常

1. 检查 Vercel Functions 日志
2. 验证环境变量是否正确
3. 测试 API 端点响应

### 性能问题

1. 使用 Vercel Analytics 分析性能
2. 检查 Edge Function 响应时间
3. 优化数据库查询（如有）

---

## 成本估算

### Vercel 免费计划

- ✅ 无限个人项目
- ✅ 每月 100GB 带宽
- ✅ 1000 次 Edge Function 执行/天
- ❌ 无团队协作功能

### Vercel Pro 计划

- 💰 $20/月
- ✅ 1TB 带宽
- ✅ 无限 Edge Function 执行
- ✅ 团队协作

对于 Oracle-X MVP，**免费计划足够**。

---

## 安全建议

1. **API Keys 管理**
   - 使用环境变量
   - 定期轮换密钥
   - 监控 API 使用量

2. **HTTPS 强制**
   - Vercel 自动启用
   - 检查 `next.config.js` 中的安全头

3. **Rate Limiting**（计划中）
   - 使用 Vercel Edge Middleware
   - 限制 API 请求频率

---

## 联系支持

- Vercel 文档: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Oracle-X Issues: https://github.com/yourusername/oracle-x/issues

祝部署顺利！🚀
