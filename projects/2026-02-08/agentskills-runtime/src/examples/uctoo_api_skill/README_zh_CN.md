# UCToo API Agent Skills

## 概述
本项目实现了Agent Skills，将自然语言请求转换为uctoo-backend服务器API调用。技能遵循agentskills标准规范，允许AI助手使用自然语言与uctoo-backend服务进行交互。

该实现使用CangjieMagic框架的技能系统创建可互操作的agent技能，以连接自然语言查询和后端API功能。

## 架构
系统由以下主要组件组成：

### 1. UctooAPISkill (src/uctoo_api_skill.cj)
- 处理自然语言请求的核心技能
- 将自然语言映射到适当的后端API调用
- 处理身份验证和会话管理
- 返回结构化响应

### 2. 自然语言处理器 (src/natural_language_processor.cj)
- 解析来自AI助手的自然语言请求
- 使用基于关键字的评分识别用户意图
- 使用模式匹配从自然语言中提取参数
- 使用建议机制处理模糊查询

### 3. API映射器 (src/api_mapper.cj)
- 将自然语言意图映射到特定API端点
- 处理自然语言和API格式之间的参数转换
- 管理API端点配置和元数据

### 4. 认证管理器 (src/auth_manager.cj)
- 处理认证令牌管理
- 在API调用之间维护会话状态
- 提供安全凭证处理

### 5. 配置 (src/config.cj)
- 通过环境变量管理系统配置

## 主要功能

### 自然语言处理
- 基于关键字和模式的意图识别，带有评分算法
- 使用正则表达式模式从自然语言查询中提取参数
- 支持常见实体类型（用户、产品、订单）
- 使用建议机制处理模糊请求
- 上下文感知处理

### API集成
- 与uctoo-backend服务器API无缝集成
- 支持标准CRUD操作
- 身份验证和会话管理
- 错误处理和响应格式化

### Agentskills标准兼容性
- 完全符合agentskills标准规范
- 支持SKILL.md文件中的YAML frontmatter
- 支持技能元数据和验证
- 外部资源访问（scripts/, references/, assets/）

### 错误处理
- 为所有系统组件提供全面的错误处理
- 为调试提供详细的错误消息
- 优雅处理API故障和网络问题

## 技能

该实现公开以下agent技能：

### UctooAPISkill
- 处理自然语言查询并将其转换为后端API调用
- 根据意图和参数返回结构化的API响应

## 配置
系统可通过环境变量进行配置：
- `BACKEND_URL` - uctoo-backend服务器的后端URL（默认：http://localhost:3000）
- `DEFAULT_TIMEOUT` - 请求超时（毫秒）（默认：10000）
- `LOG_LEVEL` - 日志级别（默认：INFO）

## 使用示例

### 自然语言查询
- "获取所有用户" → 处理为用户的GET请求
- "查找ID为123的用户" → 处理为带ID参数的GET请求
- "创建名为John的新用户" → 处理为带名称参数的POST请求
- "使用邮箱john@example.com更新用户456" → 处理为带ID和邮箱参数的PUT请求

## 开发

### 项目结构
```
apps/CangjieMagic/src/examples/uctoo_api_skill/
├── src/
│   ├── main.cj                          # 主入口点和代理定义
│   ├── uctoo_api_skill.cj               # 核心API技能实现
│   ├── natural_language_processor.cj    # NLP处理
│   ├── api_mapper.cj                    # API映射和转换
│   ├── auth_manager.cj                  # 身份验证管理
│   ├── config.cj                        # 配置管理
│   ├── utils.cj                         # 实用函数
│   ├── error_handler.cj                 # 错误处理
│   ├── models/                          # 数据模型
│   │   ├── api_request.cj               # API请求模型
│   │   └── api_response.cj              # API响应模型
│   └── skills/                          # 额外技能实现
│       └── ...
├── resources/
│   └── api_definitions.json             # 用于映射的API定义（计划中）
├── tests/
│   ├── unit/                            # 单元测试（计划中）
│   ├── integration/                     # 集成测试（计划中）
│   └── contract/                        # 合约测试（计划中）
└── SKILL.md                             # 标准技能定义文件
```

### Agent实现

系统实现了AI Agent，使用Magic Framework的@agent注解：

```cangjie
@agent[
  model: "deepseek:deepseek-chat",
  description: "UCToo后端API的MCP适配器，支持自然语言查询",
  tools: [processNaturalLanguageRequest, getMcpServiceById, listApiMappings]
]
class UctooMCPAdapterAgent {
  @prompt("您是一个MCP适配器，可以将自然语言请求转换为uctoo-backend服务器的API调用。根据用户的自然语言描述，调用适当的后端服务并返回结果。")
}
```

### 关键实现细节

#### 自然语言处理
系统采用基于关键字的意图确定算法，通过评分从自然语言查询中识别用户意图。多个关键字与不同意图（GET_RESOURCE、CREATE_RESOURCE、UPDATE_RESOURCE、DELETE_RESOURCE等）相关联，评分系统确定最可能的意图。

参数提取使用正则表达式模式识别ID、名称、电子邮件和电话号码等常见实体。

#### API映射
系统包括自动API映射生成器，为以下内容创建MCP适配器：
- 基于数据库模式的标准CRUD操作（确定性算法）
- 通过算法遍历的非标准API

映射包括自然语言模式和转换规则，用于将查询转换为API端点。

## 程序流程

系统当前版本遵循以下正确的程序流程：

### 1. 客户端（uctoo_api_mcp_client）流程
1. **客户端启动**：运行 `cjpm run --name magic.examples.uctoo_api_mcp_client`
2. **发送请求**：
   - 发送"调用hello接口"请求
   - 发送"使用账户demo和密码123456登录"请求
   - 发送"获取ID为3a5a079d-38b2-4ea2-b8cd-f3c0d93dacfb的实体"请求
3. **接收响应**：
   - Hello接口调用成功，返回"Hello World"
   - 登录请求成功，返回用户信息和访问令牌
   - 获取实体请求返回"未找到"信息

### 2. 服务器（uctoo_api_mcp_server）流程
1. **接收MCP协议请求**：通过MCP协议接收客户端请求
2. **请求分发处理**：
   - 对于hello接口请求：直接返回"Hello World"
   - 对于登录请求：通过AI代理（UctooMCPAdapterAgent）处理
   - 对于实体请求：通过AI代理处理
3. **详细登录处理流程**：
   - AI代理识别登录意图
   - 调用`processNaturalLanguageRequest`工具
   - `NaturalLanguageProcessor`处理登录请求
   - 调用`callLoginApiDirectly`方法直接调用后端登录API
   - 使用`Utils.extractTokenFromResponse`方法从JSON响应中解析access_token
   - 成功提取并存储access_token以供后续API调用

### 3. 关键技术实现
1. **统一的access_token解析**：
   - 所有access_token解析使用`Utils.extractTokenFromResponse`公共方法
   - 该方法首先尝试JSON解析，失败时回退到正则表达式解析
   - 成功解析的令牌存储在`UctooMCPAdapter`中以供后续API调用
2. **日志系统重构**：
   - 所有`Utils.logMessage`调用现在写入日志文件
   - 与`main.cj`中的`logToFile`函数保持一致的日志记录方法
   - 提供完整的调试信息跟踪

### 4. 问题解决
**之前程序流程异常的原因**：
- 旧版本的日志系统存在JSON解析错误bug
- `Utils.logMessage`方法仅输出到控制台，无法记录调试信息
- 使得追踪和调试JSON解析问题变得困难

**修复后效果**：
- 所有日志现在写入文件，便于调试
- JSON解析功能正常工作，能够正确从登录响应中提取access_token
- 登录流程顺利完成，返回完整的用户信息和访问令牌
- 整个MCP适配器流程按预期工作

## 部署
适配器可使用标准Cangjie部署实践进行部署：
1. 配置后端服务URL和其他设置的环境变量
2. 使用`cjpm build`构建项目
3. 运行编译的二进制文件
4. 监控日志以了解运行状况

系统设计为与Magic Framework的MCP服务器基础架构配合使用，可与支持Model Context Protocol的AI助手集成。

## 🧰 如何运行

1. 部署 https://gitee.com/UCT/uctoo-backend 开发框架服务端应用程序

2. **配置API密钥**：在uctoo_api_mcp_client项目的`main.cj`文件中，将`<your api key>`替换为您的DeepSeek API密钥。修改config.cj中的配置参数以匹配步骤1中uctoo_backend的部署参数。
   ```cangjie
   Config.env["DEEPSEEK_API_KEY"] = "sk-xxxxxxxxxx";
   ```

您需要打开两个终端窗口：

3. **启动服务器**：在第一个终端中，在CangjieMagic目录中运行以下命令以启动MCP服务。
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_server
   ```
   
   **为什么要运行 uctoo_api_mcp_server 服务**：
   
   `uctoo_api_skill` 项目是基于 Agent Skills 标准的技能实现，它与 `uctoo_api_mcp_server` 项目共同构成了完整的MCP（Model Context Protocol）适配器功能。尽管 `uctoo_api_skill` 项目专注于将自然语言请求转换为后端API调用的技能实现，但仍然需要一个MCP服务器来处理AI助手客户端的连接和通信。
   
   `uctoo_api_mcp_server` 项目提供了以下关键功能：
   - MCP协议服务：处理AI助手客户端的连接和通信协议
   - Agent服务：提供AI助手可以调用的工具集
   - 请求路由：将AI助手的自然语言请求转发给相应的技能处理器
   - 响应处理：将技能执行结果格式化后返回给AI助手
   
   因此，尽管 `uctoo_api_skill` 是技能的核心实现，但仍需要 `uctoo_api_mcp_server` 作为通信桥梁，使AI助手能够通过MCP协议与技能进行交互。
   
4. **启动客户端**：在第二个终端中，在CangjieMagic目录中运行以下命令以启动客户端并与其交互。
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_client
   ```

## 详细运行流程

### 与 uctooAPI 设计规范的兼容性

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

4. **认证机制**：使用 JWT 进行接口权限验证，通过 `/api/uctoo/auth/login` 获取动态 token

### 1. 初始化阶段

1. **环境检查**：系统检查必需的环境变量，如 `BACKEND_URL` 和 `DEEPSEEK_API_KEY`
2. **组件初始化**：初始化以下核心组件：
   - `UctooAPISkill`：主要技能处理器
   - `NaturalLanguageProcessor`：自然语言处理器
   - `ApiMapper`：API映射器
   - `AuthManager`：认证管理器
3. **配置加载**：从以下路径加载系统配置：
   - 配置文件路径：`src/config.cj`
   - 加载的配置项包括：
     - `BACKEND_URL`：uctoo-backend服务器的后端URL（默认：http://localhost:3000）
     - `DEFAULT_TIMEOUT`：请求超时（毫秒）（默认：10000）
     - `LOG_LEVEL`：日志级别（默认：INFO）
     - `API_KEY`：用于API调用的访问密钥（如果提供）

### 2. 客户端-服务器交互流程

1. **客户端启动**：`apps\CangjieMagic\src\examples\uctoo_api_mcp_client` 启动，创建 `EnhancedUctooMCPTestAgent`
2. **MCP连接建立**：客户端通过 `stdioMCP("cjpm run --skip-build --name magic.examples.uctoo_api_mcp_server")` 命令与服务器建立MCP协议连接
3. **自然语言请求发送**：客户端将用户输入的自然语言请求（如"调用hello接口"、"请使用账号demo和密码123456登录"等）发送到服务器

### 3. 服务器端请求处理流程

1. **请求接收**：`apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 接收来自客户端的自然语言请求
2. **AI处理**：服务器端的 `UctooMCPAdapterAgent` 使用AI模型处理请求
3. **工具调用**：服务器调用 `processNaturalLanguageRequest` 工具函数
4. **技能执行**：在 `processNaturalLanguageRequest` 函数内部，`NaturalLanguageProcessor` 调用 `UctooAPISkill` 的 `execute` 方法
5. **意图识别**：`UctooAPISkill` 中的 `NaturalLanguageProcessor` 使用基于关键字的评分算法识别用户意图
6. **参数提取**：使用正则表达式模式从自然语言中提取参数
7. **API映射**：`ApiMapper` 将自然语言意图映射到特定的API端点
8. **认证检查**：`AuthManager` 检查当前会话的认证状态
9. **API调用**：执行相应的后端API调用
10. **响应处理**：将API响应处理后返回给客户端

### 4. 技能执行细节

`apps\CangjieMagic\src\examples\uctoo_api_skill` 项目中的 `UctooAPISkill` 负责：
- **自然语言到API的映射**：`NaturalLanguageProcessor` 负责解析自然语言请求并识别用户意图
- **API映射**：`ApiMapper` 将识别的意图转换为具体的API端点和参数
- **认证管理**：`AuthManager` 管理认证令牌和会话状态
- **请求执行**：协调整个请求处理流程

`apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 项目负责：
- **MCP协议处理**：处理客户端与服务器之间的通信协议
- **AI代理**：提供AI能力来理解用户请求
- **工具调度**：调用适当的工具函数（如 `processNaturalLanguageRequest`）
- **响应格式化**：将结果格式化为适合客户端的响应

**框架增强支持**：

`apps\CangjieMagic\src\examples\uctoo_api_mcp_server` 能够调用 `apps\CangjieMagic\src\examples\uctoo_api_skill` 的技能，是通过 `specs\003-agentskills-enhancement` 项目对 CangjieMagic 框架的增强支持实现的。这个增强项目实现了对 agentskills 标准的全面支持，包括：

- **SKILL.md 文件加载**：框架现在可以加载和解析标准的 SKILL.md 文件
- **技能验证**：对技能进行验证以确保符合 agentskills 规范
- **外部资源访问**：允许技能访问 scripts/、references/、assets/ 等外部资源
- **技能执行**：通过标准化的接口执行技能

因此，`uctoo_api_mcp_server` 中的 `processNaturalLanguageRequest` 函数能够调用 `uctoo_api_skill` 中的 `UctooAPISkill` 实例，因为框架增强了对技能的动态加载和执行能力。这使得 `uctoo_api_mcp_server` 可以优先使用 `uctoo_api_skill` 中定义的自然语言处理逻辑，而不是使用 `uctoo_api_mcp_server` 中原有的处理流程，从而实现了技能的模块化和可扩展性。

### 5. 认证处理流程

1. **初始检查**：当收到需要认证的请求时，检查当前会话是否已认证
2. **认证令牌提取**：如果用户提供了认证信息（用户名/密码或API密钥），提取并验证
3. **令牌存储**：成功认证后，将令牌存储在 `AuthManager` 中供后续请求使用
4. **令牌刷新**：如果令牌即将过期，自动刷新令牌

### 6. 错误处理流程

1. **输入验证**：验证请求参数的格式和完整性
2. **API调用错误**：捕获并处理后端API调用错误
3. **认证错误**：处理认证失败和令牌过期情况
4. **响应格式化**：将错误信息格式化为对AI助手友好的格式

### 7. 结束阶段

1. **资源清理**：释放占用的资源，如网络连接和缓存
2. **会话终止**：如果需要，终止当前会话并清理认证令牌
3. **日志记录**：记录操作日志和性能指标

### 8. 特殊场景处理

- **模糊查询**：当自然语言请求不够明确时，系统使用建议机制提示用户提供更多信息
- **批量操作**：处理需要多个API调用的复杂请求
- **并发请求**：管理多个并发的API请求，确保响应顺序正确
- **超时处理**：对长时间运行的API调用实施超时控制

这些流程确保了UCToo API Agent Skills能够高效、可靠地处理自然语言请求，并将其转换为相应的后端API调用。

## API调用发起方分析

基于我们对系统架构和日志的分析，我们确定了以下关于API调用发起的信息：

### API调用发起方

- **`apps\CangjieMagic\src\examples\uctoo_api_mcp_server`** 负责向uctoo后端API发起实际的HTTP请求。
- **`apps\CangjieMagic\src\examples\uctoo_api_skill`** 负责将自然语言请求转换为API调用规范，但不直接发起HTTP请求。

### 技术依据

此架构是由于CangjieMagic框架的agentskills增强机制而实现的。`uctoo_api_mcp_server` 通过来自 `specs\003-agentskills-enhancement` 项目对CangjieMagic框架的增强支持来访问 `uctoo_api_skill` 中的技能。此增强项目为agentskills标准实现全面支持，包括：

- **SKILL.md文件加载**：框架现在可以加载和解析标准的SKILL.md文件
- **技能验证**：验证技能以确保符合agentskills规范
- **外部资源访问**：允许技能访问scripts/、references/、assets/等外部资源
- **技能执行**：通过标准化接口执行技能

因此，`uctoo_api_mcp_server` 中的 `processNaturalLanguageRequest` 函数能够调用 `uctoo_api_skill` 中的 `UctooAPISkill` 实例。框架增强了对技能的动态加载和执行能力。这使得 `uctoo_api_mcp_server` 可以优先使用 `uctoo_api_skill` 中定义的自然语言处理逻辑，而不是使用 `uctoo_api_mcp_server` 中原有的处理流程，从而实现了技能的模块化和可扩展性。

### 责任分工

- **`uctoo_api_skill` 的责任**：
  - 自然语言理解和意图识别
  - 从自然语言查询中提取参数
  - 基于识别的意图进行API端点映射
  - 认证令牌管理
  - 定义自然语言如何映射到API调用

- **`uctoo_api_mcp_server` 的责任**：
  - 与客户端的MCP协议通信
  - 接收请求并路由到适当的技能
  - 向后端API执行实际的HTTP请求
  - 处理和格式化API响应以供客户端使用
  - 管理认证会话

这种关注点分离实现了更好的模块化：`uctoo_api_skill` 专注于理解自然语言和定义API映射，而 `uctoo_api_mcp_server` 处理实际的网络通信和协议管理。