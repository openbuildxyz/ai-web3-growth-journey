# Web3 Agent Market 前端对接文档（MVP）

> 本文档用于前端团队与链上合约的完整对接说明。  
> 目标：前端同学**不需要理解合约实现细节，也能正确完成业务 UI 和交互**。

---

## 一、合约总览

当前链上共有 **5 个核心合约**：

| 合约 | 作用 | 前端是否直接调用 |
|---|---|---|
| PlatformToken | 平台 ERC20 Token | ✅ 是 |
| EscrowVault | 资金托管 | ❌ 否 |
| TaskManager | 任务状态机（核心） | ✅ 是 |
| Arbitration | 仲裁 / DAO | ✅ 是 |
| TokenExchange | 资金兑换 | ❌ 否 |

> 前端主要与 **TaskManager + Arbitration** 交互  
> Vault 只会被 TaskManager 间接调用

---

## 二、用户角色

- **Buyer**：发布任务、验收、发起仲裁  
- **Agent**：接单、交付任务  
- **DAO / Arbitrator**：质押 Token、投票、仲裁结案  

---

## 三、Token 与 Approve 规则（非常重要）

### PlatformToken（ERC20）
前端需要支持：
- `balanceOf(address)`
- `allowance(owner, spender)`
- `approve(spender, amount)`

### Approve 对象规则

| 场景 | approve 给谁 |
|---|---|
| 创建任务（托管资金） | EscrowVault |
| 仲裁质押（stake） | Arbitration |

⚠️ **常见错误：approve 给 TaskManager（错误）**

前端必须在交易前检测 allowance，不足时先引导用户 approve。

---

## 四、TaskManager（前端核心合约）

### 1. 任务状态机（UI 依据）

| 状态 | 含义 | 前端行为 |
|---|---|---|
| Created | 已创建，待接单 | 显示「接单」 |
| Accepted | 已接单 | Agent 可开始任务 |
| InProgress | 已开始 | Agent 可交付 |
| PendingReview | 已交付，待验收 | Buyer 可验收 / 仲裁 |
| Completed | 已完成 | 只读 |
| Disputed | 仲裁中 | 显示仲裁信息 |
| Arbitrated | 仲裁完成 | 只读 |
| Cancelled | 已取消 | 只读 |

---

### 2. Buyer 相关函数

#### createTask(amount, metaHash)
- 发布任务并托管资金
- 前置：Token 已 approve 给 Vault
- 结果：任务状态 → Created

#### approve(taskId)
- 验收任务并放款给 Agent
- 前置：状态 = PendingReview
- 结果：状态 → Completed

#### dispute(taskId)
- 发起仲裁
- 前置：状态 = PendingReview
- 结果：状态 → Disputed，并自动在 Arbitration 中创建案件

---

### 3. Agent 相关函数

#### acceptTask(taskId)
- 前置：状态 = Created
- 结果：状态 → Accepted

#### submitDelivery(taskId, deliveryHash)
- 前置：状态 = Accepted
- 结果：状态 → PendingReview

---

### 4. 前端需要监听的事件

前端 UI **以事件驱动**：

- TaskCreated
- TaskAccepted
- DeliverySubmitted
- TaskCompleted
- TaskDisputed
- TaskArbitrated

---

## 五、Arbitration（仲裁模块）

### 1. 仲裁规则（前端必须展示）

- 1 人 1 票
- 达到 quorum 才算有效  45/100  20 yes/25 no
- 超时未达 quorum
- 裁决结果二选一：
  - BuyerWins
  - AgentWins

---

### 2. DAO 成员操作

#### stake(amount)
- 质押平台 Token，获得投票资格
- 前置：Token 已 approve 给 Arbitration

#### vote(taskId, decision)
- decision：
  - 1 = BuyerWins
  - 2 = AgentWins
- 每人每案只能投一次

#### finalize(taskId)
- 结案并执行裁决
- 任何人可调用（通常由 DAO 页面或后台触发）

---

### 3. getCase(taskId) 返回字段说明

| 字段 | 含义 |
|---|---|
| deadline | 仲裁投票截止时间（时间戳） |
| buyerVotes | 支持买家的票数 |
| agentVotes | 支持 Agent 的票数 |
| finalized | 是否已结案（资金是否已分配） |
| result | 仲裁结果：0 未结案 / 1 买家胜 / 2 Agent 胜 |

---

## 六、链上 / 链下数据分工

### 链上存储
- taskId
- amount
- 状态
- metaHash / deliveryHash
- 仲裁结果

### 链下存储
- 任务描述正文
- 交付文件（IPFS / OSS）
- 用户昵称、头像
- 聚合后的任务列表

---

## 七、典型前端流程

### 创建任务（Buyer）
1. 填写任务信息（链下）
2. 上传生成 metaHash
3. 检测 Token allowance（Vault）
4. approve（如需要）
5. 调用 createTask
6. 监听 TaskCreated

### 仲裁流程（DAO）
1. 查询 getCase(taskId)
2. 若未质押 → stake
3. vote
4. 达 quorum 或超时
5. finalize
6. 展示裁决结果

---

## 八、一句话总结给前端

> 所有业务走 TaskManager  
> 钱由 Vault 管，但前端不直接碰  
> 仲裁只在 Arbitration  
> 先 approve，再交易  
> UI 以状态和事件驱动

---

（完）
