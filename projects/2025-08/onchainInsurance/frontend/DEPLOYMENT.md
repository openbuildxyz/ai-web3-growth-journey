# 🚀 部署指南

## 📋 部署前准备

### 1. 合约部署
确保你已经成功部署了以下合约：
- `InsuranceManager.sol`
- `MockUSDC.sol`（测试环境）

### 2. 获取合约地址
部署完成后，记录以下合约地址：
```
InsuranceManager: 0x...
MockUSDC: 0x...
```

## ⚙️ 配置步骤

### 1. 更新合约地址
编辑 `src/lib/web3.ts` 文件：

```typescript
export const CONTRACTS = {
  INSURANCE_MANAGER: '0x你的InsuranceManager合约地址',
  MOCK_USDC: '0x你的MockUSDC合约地址',
};
```

### 2. 更新ABI文件
确保ABI文件是最新的：
```bash
# 在contract目录下运行
./extract-abi.sh
# 然后复制到frontend/src/abi/
```

### 3. 网络配置
如果部署到测试网络，需要：
- 在MetaMask中添加对应的测试网络
- 确保用户账户在该网络中有ETH用于Gas费
- 如果使用自定义RPC，可以在web3.ts中配置

## 🌐 部署选项

### 选项1: Vercel部署（推荐）

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "feat: 完成保险系统前端"
   git push origin main
   ```

2. **在Vercel中部署**
   - 访问 [vercel.com](https://vercel.com)
   - 导入GitHub仓库
   - 选择frontend目录
   - 点击Deploy

3. **配置环境变量（可选）**
   如果需要，可以在Vercel中设置环境变量：
   ```
   NEXT_PUBLIC_INSURANCE_MANAGER=0x...
   NEXT_PUBLIC_MOCK_USDC=0x...
   ```

### 选项2: 本地部署

1. **构建生产版本**
   ```bash
   pnpm build
   ```

2. **启动生产服务器**
   ```bash
   pnpm start
   ```

3. **使用PM2管理进程（可选）**
   ```bash
   npm install -g pm2
   pm2 start "pnpm start" --name insurance-frontend
   pm2 save
   pm2 startup
   ```

### 选项3: Docker部署

1. **创建Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **构建和运行**
   ```bash
   docker build -t insurance-frontend .
   docker run -p 3000:3000 insurance-frontend
   ```

## 🔧 测试配置

### 1. 本地测试
```bash
# 启动开发服务器
pnpm dev

# 在浏览器中访问
open http://localhost:3000
```

### 2. 功能测试清单
- [ ] 钱包连接功能
- [ ] 保险信息显示
- [ ] 购买保险流程
- [ ] 捐赠功能
- [ ] 交易确认和状态更新
- [ ] 错误处理和提示

### 3. 测试用户流程
1. 连接MetaMask钱包
2. 切换到部署合约的网络
3. 确保账户有ETH和USDC
4. 测试购买和捐赠功能

## 🚨 安全注意事项

### 1. 生产环境检查
- [ ] 合约地址正确无误
- [ ] 网络配置正确
- [ ] HTTPS连接
- [ ] 错误信息不暴露敏感信息

### 2. 用户安全提醒
在界面中添加安全提醒：
- 验证合约地址
- 检查交易详情
- 注意钓鱼网站

### 3. 代码安全
- 不在前端存储私钥
- 验证所有用户输入
- 使用最新版本的依赖包

## 🔄 更新和维护

### 1. 依赖更新
定期更新依赖包：
```bash
pnpm update
```

### 2. 合约升级
如果合约地址更改：
1. 更新 `src/lib/web3.ts` 中的地址
2. 更新ABI文件
3. 重新部署前端

### 3. 功能扩展
添加新功能时：
1. 更新类型定义
2. 添加新的组件
3. 更新文档

## 📊 监控和分析

### 1. 错误监控
可以集成Sentry进行错误监控：
```bash
pnpm add @sentry/nextjs
```

### 2. 分析工具
集成Google Analytics或其他分析工具：
```bash
pnpm add @next/third-parties
```

### 3. 性能监控
使用Next.js内置的性能监控功能：
```javascript
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
}
```

## 💡 优化建议

### 1. 性能优化
- 使用Next.js的图片优化
- 启用静态生成（SSG）
- 代码分割和懒加载

### 2. 用户体验
- 添加加载状态
- 友好的错误提示
- 响应式设计

### 3. SEO优化
- 添加meta标签
- 使用语义化HTML
- 结构化数据

## 🆘 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查MetaMask是否安装
   - 确认网络设置
   - 查看浏览器控制台错误

2. **合约调用失败**
   - 验证合约地址
   - 检查ABI文件
   - 确认账户权限

3. **交易失败**
   - 检查Gas费设置
   - 验证USDC余额和授权
   - 查看交易哈希详情

### 调试步骤
1. 打开浏览器开发者工具
2. 查看Console错误信息
3. 检查Network请求
4. 验证合约交互

## 📞 技术支持

如果遇到问题，请：
1. 查看控制台错误信息
2. 检查合约部署状态
3. 验证网络配置
4. 联系开发团队 