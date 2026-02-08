# UCToo MCP 服务器适配器

## 概述
本项目实现了一个MCP（Model Context Protocol）服务器适配器，将uctoo-backend服务器API转换为MCP服务，供AI助手客户端通过自然语言使用。该适配器允许AI助手使用自然语言查询来调用uctoo-backend服务器API。

该实现使用Magic Framework的@agent和@tool注解来创建一个AI代理，可以处理自然语言请求并将其转换为适当的后端API调用。系统模拟API调用并基于自然语言处理提供结构化响应。

## 架构
系统由以下主要组件构成：

### 1. 自然语言处理器 ([natural_language_processor.cj](src/natural_language_processor.cj))
- 解析来自AI助手的自然语言请求
- 使用基于关键词的评分机制识别查询中的用户意图
- 使用模式匹配从自然语言中提取参数
- 处理带有建议机制的模糊查询

### 2. MCP适配器 ([mcp_adapter.cj](src/mcp_adapter.cj))
- 处理API通信的核心组件
- 将自然语言请求转换为后端API调用
- 根据意图确定适当的端点和HTTP方法
- 模拟API调用以演示功能

### 3. API映射器 ([api_mapper.cj](src/api_mapper.cj))
- 实现基于uctoo-backend的标准API生成确定性算法
- 处理非标准API的算法遍历
- 使用翻译规则管理API转换逻辑
- 为标准CRUD操作和非标准端点生成映射

### 4. 配置 ([config.cj](src/config.cj))
- 通过环境变量管理系统配置
- 配置后端URL、端口、连接限制、超时和日志记录

### 5. 模型
- 请求、响应和API映射的数据模型
- 错误处理模型
- 参数和翻译规则模型

## 主要特性

### 自然语言处理
- 基于关键词和模式的意图识别及评分算法
- 使用正则表达式模式从自然语言查询中提取参数
- 支持常见实体类型（用户、产品、订单）
- 处理带建议机制的模糊请求
- 上下文感知处理

### API转换
- 标准CRUD操作的自动映射
- 支持复杂的非标准后端API
- 基于数据库模式的确定性API生成
- 用于将自然语言映射到API端点的翻译规则

### 错误处理
- 对所有系统组件的全面错误处理
- 详细的调试错误信息
- 优雅处理处理异常

### 配置和性能
- 基于环境的配置管理
- 模拟API调用以演示功能
- 结构化响应格式
- 可扩展的映射框架

## 工具

MCP适配器暴露了以下可被AI代理使用的工具：

### processNaturalLanguageRequest
- 处理自然语言查询并将其转换为结构化API调用
- 基于意图和参数返回模拟的API响应

### getMcpServiceById
- 通过ID检索特定MCP服务的详细信息
- 返回服务元数据和配置

### listApiMappings
- 列出所有可用的API映射
- 显示映射ID、端点和关联模式

## 配置
系统可以通过环境变量进行配置：
- `BACKEND_URL` - uctoo-backend服务器的后端URL（默认：http://localhost:3000）
- `PORT` - MCP服务器适配器的端口（默认：8080）
- `MAX_CONNECTIONS` - 最大并发连接数（默认：100）
- `REQUEST_TIMEOUT` - 请求超时时间（毫秒）（默认：10000）
- `LOG_LEVEL` - 日志级别（默认：INFO）

## 使用示例

### 自然语言查询
- "获取所有用户" → 作为GET_RESOURCE意图处理用户资源
- "查找ID为123的用户" → 作为带有ID参数的GET_RESOURCE意图处理
- "创建一个名为John的新用户" → 作为带有name参数的CREATE_RESOURCE意图处理
- "更新ID为456的用户邮箱为john@example.com" → 作为带有ID和email参数的UPDATE_RESOURCE意图处理

### 工具使用
```javascript
// 处理自然语言请求
const result = await processNaturalLanguageRequest("获取所有用户");

// 获取MCP服务详情
const serviceDetails = await getMcpServiceById("mcp-service-users");

// 列出所有API映射
const mappings = await listApiMappings();
```

## 开发

### 项目结构
```
apps/CangjieMagic/src/examples/uctoo_api_mcp_server/
├── src/
│   ├── main.cj                          # 主入口点和代理定义
│   ├── mcp_adapter.cj                   # MCP适配器核心逻辑
│   ├── api_mapper.cj                    # API映射和转换
│   ├── natural_language_processor.cj    # NLP处理
│   ├── config.cj                        # 配置管理
│   ├── utils.cj                         # 工具函数
│   ├── mcp_service.cj                   # MCP服务模型
│   ├── backend_api_mapping.cj           # 后端API映射模型
│   ├── parameter.cj                     # 参数模型
│   ├── translation_rule.cj              # 翻译规则模型
│   ├── natural_language_request.cj      # 自然语言请求模型
│   ├── api_response.cj                  # API响应模型
│   └── error_response.cj                # 错误响应模型
├── resources/
│   └── api_definitions.json             # 用于映射的API定义（计划中）
└── tests/
    ├── unit/                            # 单元测试（计划中）
    ├── integration/                     # 集成测试（计划中）
    └── contract/                        # 契约测试（计划中）
```

### 代理实现

系统使用Magic Framework的@agent注解实现AI代理：

```cangjie
@agent[
  model: "deepseek:deepseek-chat",
  description: "MCP adapter for UCToo backend APIs, supporting natural language queries",
  tools: [processNaturalLanguageRequest, getMcpServiceById, listApiMappings]
]
class UctooMCPAdapterAgent {
  @prompt("You are an MCP adapter that can convert natural language requests to API calls for the uctoo-backend server. Based on the user's natural language description, call the appropriate backend service and return the result.")
}
```

### 关键实现细节

#### 自然语言处理
系统采用基于关键词的意图确定算法，通过评分机制从自然语言查询中识别用户意图。多种关键词与不同意图（GET_RESOURCE、CREATE_RESOURCE、UPDATE_RESOURCE、DELETE_RESOURCE等）相关联，评分系统确定最可能的意图。

参数提取使用正则表达式模式来识别常见的实体，如ID、名称、电子邮件和电话号码。

#### API映射
系统包含一个自动API映射生成器，为以下内容创建MCP适配器：
- 基于数据库模式的标准CRUD操作（确定性算法）
- 通过算法遍历的非标准API

映射包括自然语言模式和翻译规则，用于将查询转换为API端点。

## 程序流程

当前版本的系统遵循以下正确的程序流程：

### 1. 客户端（uctoo_api_mcp_client）流程
1. **启动客户端**：运行`cjpm run --name magic.examples.uctoo_api_mcp_client`
2. **发送请求**：
   - 发送"调用hello接口"请求
   - 发送"使用账号 demo 和密码 123456 登录"请求
   - 发送"获取id等于3a5a079d-38b2-4ea2-b8cd-f3c0d93dacfb的entity实体"请求
3. **接收响应**：
   - hello接口调用成功，返回"Hello World"
   - 登录请求成功，返回用户信息和访问令牌
   - 获取entity实体请求返回"未找到"信息

### 2. 服务器端（uctoo_api_mcp_server）流程
1. **接收MCP协议请求**：通过MCP协议接收客户端请求
2. **请求分发处理**：
   - 对于hello接口请求：直接返回"Hello World"
   - 对于登录请求：通过AI代理（UctooMCPAdapterAgent）处理
   - 对于entity实体请求：通过AI代理处理
3. **登录处理详细流程**：
   - AI代理识别登录意图
   - 调用`processNaturalLanguageRequest`工具
   - `NaturalLanguageProcessor`处理登录请求
   - 调用`callLoginApiDirectly`方法直接调用后端登录API
   - 使用`Utils.extractTokenFromResponse`方法从JSON响应中解析access_token
   - 成功提取并存储access_token用于后续API调用

### 3. 关键技术实现
1. **统一的access_token解析**：
   - 所有access_token解析都使用`Utils.extractTokenFromResponse`公共方法
   - 该方法首先尝试JSON解析，失败时回退到正则表达式解析
   - 解析成功后将token存储到`UctooMCPAdapter`中供后续API调用使用
2. **日志系统重构**：
   - 所有`Utils.logMessage`调用现在都写入到日志文件
   - 与`main.cj`中的`logToFile`函数保持一致的日志记录方式
   - 提供了完整的调试信息追踪

### 4. 问题修复
**之前程序流程异常的原因**：
- 旧版本的log系统存在JSON解析错误的bug
- `Utils.logMessage`方法只输出到控制台，无法记录调试信息
- 导致难以追踪和调试JSON解析过程中的问题

**修复后的效果**：
- 所有日志都写入到文件中，便于调试
- JSON解析功能正常工作，能够正确从登录响应中提取access_token
- 登录流程成功完成，返回完整的用户信息和访问令牌
- 整个MCP适配器流程按预期工作

## 部署
适配器可以按照标准的Cangjie部署实践进行部署：
1. 为后端服务URL和其他设置配置环境变量
2. 使用`cjpm build`构建项目
3. 运行编译后的二进制文件
4. 监控日志以了解运行状况

该系统设计为与Magic Framework的MCP服务器基础设施配合使用，并且可以与支持模型上下文协议的AI助手集成。

#### 🔧 如何运行
1.  部署https://gitee.com/UCT/uctoo-backend 开发框架服务器端应用

2.  **配置 API Key**: 在uctoo_api_mcp_client项目的 `main.cj` 文件中，将 `<your api key>` 替换为你的 DeepSeek API Key;或者在CangjieMagic目录下的.env文件中配置DeepSeek API Key (参考.env.example文件)。修改config.cj中的配置参数与步骤1中的uctoo_backend部署参数一致。
    ```cangjie
    Config.env["DEEPSEEK_API_KEY"] = "sk-xxxxxxxxxx";
    ```

你需要打开两个终端窗口：

3.  **启动服务端**: 在第一个终端中，CangjieMagic目录，运行以下命令启动 MCP 服务。
    ```bash
    cjpm run --skip-build --name magic.examples.uctoo_api_mcp_server
    ```
4.  **启动客户端**: 在第二个终端中，CangjieMagic目录，运行以下命令启动客户端并与之交互。
    ```bash
    cjpm run --skip-build --name magic.examples.uctoo_api_mcp_client
    ```
    