# Web3 Agent Market - Backend Implementation Plan

本文档详细列出了实现 Web3 Agent Market 后端所需的原子开发步骤，并按功能模块进行划分。每个步骤都明确定义了其业务逻辑，旨在为后端开发提供清晰的指引。

**核心思想**: 本后端作为链上数据的缓存与业务逻辑处理层。所有链上状态（如任务、资金、仲裁）的变更均以 **The Graph 监听到的智能合约事件** 为唯一真实来源。前端通过 REST API 与后端交互，主要用于发起链上交易（提交 `tx_hash`）和查询经过聚合的业务数据。

## 0. 基础设施与项目初始化 (Infrastructure & Setup)

- [x] **项目结构**: 并配置必要的模块（如 `AuthModule`, `UsersModule`, `TasksModule` 等）。
- [x] **配置管理**: 使用 `@nestjs/config` 管理环境变量（数据库连接、JWT 密钥、The Graph URL 等）。
- [x] **API 文档**: 集成 Swagger (`@nestjs/swagger`)，确保 API 文档能根据代码中的 DTO 和控制器自动生成。
- [x] **全局模块**: 配置全局的异常过滤器、验证管道（ValidationPipe）和响应拦截器。
- [x] **认证策略**: 在 `AuthModule` 中配置 JWT 策略 (`JwtStrategy`) 和全局认证守卫 (`JwtAuthGuard`)。
- [x] **Web3 集成**: 封装一个可注入的 `Web3Service`，用于与区块链节点和智能合约进行交互（如验证签名）。
- [x] **缓存**: 集成并配置缓存模块（如 `cache-manager`，使用内存缓存），用于存储登录 `nonce` 等临时数据。
- [ ] **The Graph 同步服务 (GraphSyncService)**: 实现一个核心服务，通过 Webhook 或轮询从 The Graph 订阅服务中接收数据，并将数据更新到后端数据库。**所有链上相关的模块都依赖此服务来保证数据一致性。**

## 1. 用户认证与授权 (Auth)

- [x] **`POST /auth/challenge`**: 实现 `AuthService.createChallenge`。逻辑：接收钱包地址，生成一个唯一的、有时效性的随机字符串（`nonce`），将其与钱包地址关联并存入缓存，返回标准化待签名消息。
- [x] **`POST /auth/login`**: 实现 `AuthService.login`。逻辑：接收钱包地址、签名和 `nonce`。验证 `nonce` 和签名。验证成功后，查找或创建用户（默认角色 `buyer`）并签发 JWT。
- [x] Refine `POST /auth/login`: 优化登录逻辑，当前端 dto 没有传入角色字段时默认为 buyer，当有传入字段时以传入字段为准。

## 2. 用户与 Agent 管理 (Users & Agents) - (纯后端，无链上交互)

- [x] **`GET /users/me`**: 实现接口，返回当前用户信息。
- [x] **`PATCH /users/me`**: 实现接口，更新用户资料（如邮箱）。
- [x] **`POST /agents`**: 实现 `seller` 创建 Agent 档案的接口。
- [x] **`GET /agents`**: 实现 Agent 列表查询。
- [x] **`GET /agents/{id}`**: 实现获取 Agent 详情。
- [x] **`PUT /agents/{id}`**: 实现 Agent 更新接口。
- [x] **`POST /agents/{id}/online` & `offline`**: 实现上下线接口。
- [x] **`GET /agents/tags`**: 实现查询可用标签列表接口。
- [x] **Refine `POST & PUT /agents`**: 优化 Agent 创建与更新逻辑，同步 `agent_tags` 和 `agent_tag_dict`。

## 3. 任务生命周期 (Tasks)

- [x] **GraphSyncService: 监听 `TaskManager` 合约事件**
  - **`TaskCreated(taskId, buyer, amount, metaHash)`**: 监听到事件后，在 `tasks` 表创建一条新记录，状态为 `created`。同时根据 `amount` 在 `escrows` 表创建记录，状态 `locked`。
  - **`TaskAccepted(taskId, agent)`**: 更新对应任务状态为 `accepted`，并记录 `agent` 地址。
  - **`TaskSubmitted(taskId, deliveryHash)`**: 更新任务状态为 `pending_review`。
  - **`TaskApproved(taskId)`**: 更新任务状态为 `completed`。
  - **`TaskCancelled(taskId)`**: 更新任务状态为 `cancelled`。
- [x] **前端交互 REST API**:
  - **`POST /tasks`**: (仅提交元数据) 前端在发起 `createTask` 链上交易 **之前**，调用此接口上报任务的详细描述、附件等元数据。后端将这些信息存储（例如 IPFS），生成 `metaHash` 并返回给前端，前端再用此 `metaHash` 调用智能合约。
  - **`POST /tasks/tx`**: 前端发起链上交易（如 `createTask`, `acceptTask` 等）后，将 `tx_hash` 提交到此接口。后端仅记录 `tx_hash` 用于追踪，**不**直接更新业务状态。状态更新依赖 `GraphSyncService`。
  - **`GET /tasks`**: 实现任务列表查询。逻辑：按角色 (`buyer`/`agent`) 和 `status` 过滤。
  - **`GET /tasks/{id}`**: 实现任务详情查询。聚合 `task_deliverables`, `task_events`, `escrows`。
  - **`POST /tasks/{id}/deliver`**: Agent 提交交付物（如文件、文本），后端存储交付物，生成 `deliveryHash`，并返回给 Agent。Agent 再调用链上 `submitDelivery` 方法。

## 4. Agent 调用与执行 (Agent Invocation) - (纯后端，无链上交互)

- [x] **`POST /tasks/{id}/execute`**: 任务进入 `pending_review` 状态后，买家可调用此接口测试 Agent 交付成果。
  - 校验调用者为任务买家，任务状态为 `pending_review`。
  - 创建 `agent_invocations` 记录，状态 `pending`。
  - 安全调用外部 Agent API。
  - [x] 更新调用记录状态 (`success`/`failed`) 并返回结果。

- [x] **`GET /agent/{task_id}/generate`**: 后端生成密钥返回。
  - 必须使用 CSPRNG（加密安全随机数）生成Secret。
  - 生成 Key ID
  - 只在这一次返回明文 Secret，生产环境时需要调用AWS的`secretsManager`通过`AGENT_{agentId}_SECRET` 动态读取密钥，开发环境不考虑。
  - 存库时只存 Hash
  - 抽取 Secret Provider 抽象，在开发环境下直接返回ENV中配置的`AGENT_TEST_SECRET`，生产环境是返回AWS的secretsManager获取`AGENT_{agentId}_SECRET`
  
- [x] **Refine `POST /tasks/{id}/execute`**:  增加调用外部Agent API时的签名，开发时通过ENV下的`AGENT_TEST_SECRET`，线上时通过AWS的secretsManage读取`AGENT_{agentId}_SECRET`。

## 5. 资金托管与支付 (Escrow & Payments)

- [x] **GraphSyncService: 监听 `EscrowVault` 和 `TokenExchange` 合约事件**
  - **`Deposited(taskId, from, amount)`**: （通常与 `TaskCreated` 一同发生）确认资金已存入托管。更新 `escrows` 记录状态。
  - **`Released(taskId, to, amount)`**: 资金释放给 Agent。更新 `escrows` 记录为 `released`，并更新 `wallet_balances`。
  - **`Refunded(taskId, to, amount)`**: 资金退还给 Buyer。更新 `escrows` 记录为 `refunded`，并更新 `wallet_balances`。
  - **`TokensPurchased(buyer, ethIn, tokensOut)`**: 用户购买平台代币。更新对应 `payments` 记录为 `completed` 并更新 `wallet_balances`。
- [x] **前端交互 REST API**:
  - **`POST /wallet/deposit/intent`**: 用户输入希望购买的代币数量，后端为其生成一条 `pending` 状态的 `payment` 记录（类型 `deposit`）。
  - **`POST /payments/{id}/tx`**: 用户在前端完成链上操作（如 `buy` 代币）后，回传 `tx_hash`。后端仅记录，等待 `GraphSyncService` 监听到 `TokensPurchased` 事件后更新状态。
  - **`GET /payments`**: 查询个人资金流水。
  - **`GET /wallet/balance`**: 查询用户在平台内的代币余额 (`wallet_balances` 表)。

## 6. 争议与仲裁 (Arbitration)

- [x] **GraphSyncService: 监听 `TaskManager` 和 `Arbitration` 合约事件**
  - **`TaskDisputed(taskId, by)`**: 任务进入争议状态。更新任务状态为 `disputed`。
  - **`CaseOpened(taskId, buyer, agent, ...)`**: 仲裁案例开启。创建 `arbitrations` 记录，状态 `voting`。
  - **`Voted(taskId, voter, decision)`**: DAO 成员投票。创建 `arbitration_votes` 记录。
  - **`CaseFinalized(taskId, result, ...)`**: 仲裁结束。更新 `arbitrations` 记录状态（`resolved_buyer`/`resolved_seller`）。
  - **`TaskArbitrated(taskId, buyerAmount, agentAmount)`**: 任务根据仲裁结果结算。此事件是资金分配的最终依据。
- [x] **前端交互 REST API**:
  - **`POST /tasks/{id}/dispute`**: 前端提交 `tx_hash` 发起争议。
  - **`GET /arbitrations`**: 查询仲裁列表 (DAO 视角)。
  - **`GET /arbitrations/{id}`**: 查询仲裁详情及投票情况。
  - **`POST /arbitrations/{id}/vote`**: DAO 成员提交投票的 `tx_hash`。

## 7. DAO 治理 (DAO)

- [x] **GraphSyncService: 监听 `Arbitration` 合约事件**
  - **`Staked(user, amount)`**: 用户质押成为 DAO 成员。创建/更新 `dao_members` 表，记录其质押金额和状态。
  - **`Unstaked(user, amount)`**: 用户取消质押。更新 `dao_members` 表。
- [x] **前端交互 REST API**:
  - **`POST /dao/stake/tx`**: 用户提交质押/取消质押的 `tx_hash`。
  - **`GET /dao/members/me`**: 查询当前用户的 DAO 身份和质押信息。

## 8. 评价与声誉 (Reviews & Reputation) - (纯后端，无链上交互)

- [x] **`POST /tasks/{id}/review`**: 任务在 `completed` 状态后，买家可发表评价。插入 `reviews` 表。
- [x] **声誉更新服务**: 评价提交后触发。
  - 更新 `agents` 表的综合评分 (`rating`)。
  - 更新 `users` (买家) 和 `agents` (卖家) 的声誉分 (`reputation_score`)。
  - 在 `reputation_logs` 中记录声誉变更历史。
- [x] **`GET /agents/{id}/reviews`**: 查询 Agent 收到的所有评价。
- [x] **`GET /users/{id}/reputation`**: 查询用户声誉分数及历史。

## 9. 通知 (Notifications) - (纯后端，无链上交互)

- [x] **通知服务**: 封装 `create` 方法。
- [x] **业务埋点**: 在 `GraphSyncService` 处理完事件并更新数据库后（如任务被接受、交付、完成、进入争议等），触发相应的通知。
- [x] **`GET /notifications`**: 查询当前用户的通知列表。
- [x] **`POST /notifications/{id}/read`**: 标记通知为已读。
