# SheDid 部署指南 🚀

## 📋 部署前准备

### 1. 环境变量配置
创建 `.env` 文件并配置以下变量：

```bash
# Metaso AI 配置
VITE_METASO_API_KEY=mk-CCE7EA901A44F09BB3C839D9FB4AD4FF
VITE_METASO_API_URL=https://metaso.cn/api/mcp

# 应用配置
VITE_APP_NAME=SheDid
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 2. 依赖安装
```bash
pnpm install
```

### 3. 本地测试
```bash
pnpm dev
```

## 🌐 Vercel 部署

### 方法一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

### 方法二：通过 GitHub 集成
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 配置环境变量
5. 点击 "Deploy"

### Vercel 环境变量配置
在 Vercel 项目设置中添加：
- `VITE_METASO_API_KEY`
- `VITE_METASO_API_URL`
- `VITE_APP_NAME`
- `VITE_IPFS_GATEWAY`

## 🎯 Netlify 部署

### 方法一：拖拽部署
```bash
# 构建项目
pnpm build

# 将 dist 文件夹拖拽到 Netlify
```

### 方法二：GitHub 集成
1. 访问 [Netlify Dashboard](https://app.netlify.com/)
2. 点击 "New site from Git"
3. 选择 GitHub 仓库
4. 配置构建设置：
   - Build command: `pnpm build`
   - Publish directory: `dist`
5. 添加环境变量
6. 点击 "Deploy site"

## 📱 GitHub Pages 部署

### 1. 安装 gh-pages
```bash
pnpm add -D gh-pages
```

### 2. 更新 package.json
```json
{
  "scripts": {
    "predeploy": "pnpm build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://AllenWang-Yang.github.io/ai-web3-growth-journey"
}
```

### 3. 部署
```bash
pnpm run deploy
```

## 🔧 构建优化

### 生产环境构建
```bash
pnpm build
```

### 预览构建结果
```bash
pnpm preview
```

### 分析构建包大小
```bash
pnpm build --analyze
```

## 🌍 自定义域名

### Vercel 自定义域名
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 配置 DNS 记录

### Netlify 自定义域名
1. 在 Netlify 项目设置中点击 "Domain management"
2. 添加自定义域名
3. 配置 DNS 记录

## 🔒 HTTPS 配置

所有推荐的部署平台都自动提供 HTTPS：
- ✅ Vercel: 自动 HTTPS
- ✅ Netlify: 自动 HTTPS  
- ✅ GitHub Pages: 自动 HTTPS

## 📊 性能监控

### 推荐工具
- [Vercel Analytics](https://vercel.com/analytics)
- [Netlify Analytics](https://www.netlify.com/products/analytics/)
- [Google Analytics](https://analytics.google.com/)

### 性能优化建议
- 启用 gzip 压缩
- 配置 CDN 缓存
- 优化图片资源
- 代码分割和懒加载

## 🚨 常见问题

### 1. 路由问题
确保配置了 SPA 重定向规则：

**Vercel**: `vercel.json` 已配置
**Netlify**: 创建 `_redirects` 文件：
```
/*    /index.html   200
```

### 2. 环境变量不生效
- 确保变量名以 `VITE_` 开头
- 重新部署项目
- 检查平台环境变量配置

### 3. 钱包连接问题
- 确保在 HTTPS 环境下访问
- 检查 MetaMask 是否已安装
- 确认网络配置正确

## 📞 技术支持

如果遇到部署问题，可以：
1. 查看构建日志
2. 检查环境变量配置
3. 确认依赖版本兼容性
4. 联系技术支持

---

**祝你部署顺利！让 SheDid 的光芒照亮世界！** ✨