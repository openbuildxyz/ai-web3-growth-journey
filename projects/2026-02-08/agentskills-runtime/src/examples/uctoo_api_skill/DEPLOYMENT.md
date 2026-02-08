# MCP Agent Skills - 部署指南

## 概述
本文档提供了部署MCP Agent Skills实施的说明，该实施将MCP适配器功能转换为符合agentskills标准的Agent Skills实现。

**重要说明**：`apps\CangjieMagic\src\examples\uctoo_api_skill` 项目中的技能是通过 `specs\003-agentskills-enhancement` 项目对 CangjieMagic 框架的增强支持，由 `apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 自动加载和执行的。因此，无需单独部署技能，只需运行 MCP 服务器即可。

## 部署要求

### 系统要求
- 仓颉 (Cangjie) 1.0.0 或更高版本
- CangjieMagic框架
- uctoo-backend服务器访问权限

### 配置要求
- 后端服务器URL配置
- API凭证（如需要）
- 认证令牌（用于受保护的端点）

## 部署步骤

### 1. 环境设置
```bash
# 确保仓颉环境已安装
cangjie --version

# 安装依赖项
cjpm install
```

### 2. 配置设置
设置以下环境变量：
```bash
export BACKEND_URL="http://your-uctoo-backend-server:port"
export UCTOO_API_KEY="your-api-key-here"  # 如果需要
export LOG_LEVEL="INFO"  # 或 "DEBUG" 用于详细日志
```

### 3. 构建项目
```bash
cjpm build --name magic.examples.uctoo_api_mcp_server
```

**注意**：虽然我们构建的是 `uctoo_api_mcp_server` 项目，但 `apps\CangjieMagic\src\examples\uctoo_api_skill` 中定义的技能将在运行时被自动加载和使用。

### 4. 部署技能
**注意**：实际上，无需单独部署 `magic.examples.uctoo_api_skill` 技能。`apps\CangjieMagic\src\examples\uctoo_api_skill` 项目中的技能会通过 `specs\003-agentskills-enhancement` 项目对 CangjieMagic 框架的增强支持，被 `apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 自动加载和执行。

`apps\CangjieMagic\src\examples\uctoo_api_skill` 项目中的 `SKILL.md` 文件（位于项目根目录）包含了技能的标准定义，符合 agentskills 规范。当 `apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 运行时，框架会根据需要自动加载和执行这些技能。

因此，只需运行 MCP 服务器即可：

**API调用发起方说明**：

- `apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 负责向uctoo后端API发起实际的HTTP请求。
- `apps\CangjieMagic\src\examples\uctoo_api_skill` 负责将自然语言请求转换为API调用规范，但不直接发起HTTP请求。

**责任分工**：

- `uctoo_api_skill` 的责任：
  - 自然语言理解和意图识别
  - 从自然语言查询中提取参数
  - API端点映射基于识别的意图
  - 认证令牌管理
  - 定义自然语言如何映射到API调用

- `uctoo_api_mcp_server` 的责任：
  - 与客户端的MCP协议通信
  - 接收请求并路由到适当的技能
  - 向后端API执行实际的HTTP请求
  - 处理和格式化API响应以供客户端使用
  - 管理认证会话
```bash
cjpm run --name magic.examples.uctoo_api_mcp_server
```

`apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 将会根据需要自动加载 `apps\CangjieMagic\src\examples\uctoo_api_skill` 中定义的技能。

## 与 uctooAPI 设计规范的兼容性

`uctoo_api_skill` 项目完全符合 `apps\backend\docs\uctooAPI设计规范.md` 中定义的 API 设计规范：

1. **HTTP 方法使用**：严格按照规范仅使用 GET 和 POST 方法，不使用 PUT、DELETE 等其他方法
   - GET 请求用于数据查询操作
   - POST 请求用于创建、更新和删除操作

2. **端点命名规范**：
   - 查询单条数据：`/api/uctoo/entity/{id}` (GET)
   - 查询多条数据：`/api/uctoo/entity/:limit/:page` (GET)
   - 创建数据：`/api/uctoo/entity/add` (POST)
   - 更新数据：`/api/uctoo/entity/edit` (POST)
   - 删除数据：`/api/uctoo/entity/del` (POST)

3. **其他实体类型也遵循相同规范**：
   - 附件管理：`/api/uctoo/attachments/*`
   - CMS 文章：`/api/uctoo/cms_articles/*`
   - 用户管理：`/api/uctoo/uctoo_user/*`
   - 产品管理：`/api/uctoo/product/*`
   - 订单管理：`/api/uctoo/order/*`

4. **认证机制**：使用 JWT 进行接口权限验证，通过 `/api/uctoo/auth/login` 获取动态 token

## 验证部署

### 功能验证
1. 启动 MCP 服务器：
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_server
   ```
2. 在另一个终端启动 MCP 客户端：
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_client
   ```
3. 测试自然语言到API调用的转换
4. 验证认证功能
5. 测试错误处理机制
6. 验证SKILL.md文件加载

### 性能验证
- 确保响应时间符合要求（<2秒，90%的请求）
- 验证并发处理能力（至少100个AI助手客户端连接）

## 故障排除

### 常见问题
1. **认证失败**
   - 验证凭证是否正确
   - 检查认证端点是否可访问

2. **无效的API响应**
   - 检查后端服务器日志
   - 验证API端点是否存在且正常运行

3. **网络连接问题**
   - 确保后端服务器可访问
   - 检查防火墙设置

4. **SKILL.md格式错误**
   - 验证YAML前言格式正确
   - 确保必需字段（名称、描述）存在
   - 检查名称是否符合agentskills规范

## 维护

### 日志管理
系统会自动记录操作和错误日志，定期检查这些日志以监控系统健康状况。

### 更新过程
1. 下载新版本的 `apps\CangjieMagic\src\examples\uctoo_api_skill` 和 `apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 代码
2. 执行构建过程
   ```bash
   cjpm build --name magic.examples.uctoo_api_mcp_server
   ```
3. 重新启动 MCP 服务器
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_server
   ```
4. 验证功能完整性

## 安全注意事项

- 确保API密钥安全存储
- 定期轮换认证令牌
- 监控异常访问模式
- 使用HTTPS进行所有API通信