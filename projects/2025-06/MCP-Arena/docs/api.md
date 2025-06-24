# MCP 服务供应商相关接口
## 创建 MCP 服务
POST /createService

| 参数         | 类型       | 必填 | 说明        |
| ---------- | -------- | -- | --------- |
| `name`     | `string` | ✔  | 服务名       |
| `endpoint` | `string` | ✔  | API 根地址   |
| `category` | `string` | ✔  | 服务分类，用于服务广场分类展示 |
| `description` | `string` | ✔  | 服务描述，用于服务广场展示 |

## 获取 MCP 服务列表
GET /services

| 参数         | 类型       | 必填 | 说明        |
| ---------- | -------- | -- | --------- |
| `category` | `string` |  | 服务分类，为空则返回所有分类 |

响应参数新增：
| 参数         | 类型       | 说明        |
| ---------- | -------- | --------- |
| `sla` | `number` | 服务等级协议评分 |
| `qos` | `number` | 服务质量指标 |
| `rating` | `number` | 用户综合评分 |
| `revenue` | `number` | 累计收益 |

## 服务广场展示
GET /services/{serviceID}/square

| 参数         | 类型       | 必填 | 说明        |
| ---------- | -------- | -- | --------- |
| `serviceID` | `string` | ✔  | 服务 ID |
| `tab` | `enum` |  | 展示标签（rewards/slash） |
| `page` | `number` |  | 分页页码 |
| `pageSize` | `number` |  | 分页大小 |

响应参数：
| 参数         | 类型       | 说明        |
| ---------- | -------- | --------- |
| `rewardRecords` | `object[]` | 奖励/惩罚记录列表 |
| `totalRevenue` | `number` | 历史总收益 |
| `dailyRevenue` | `number` | 24小时收益 |

## 获取 MCP 服务详情
GET /services/{serviceID}

| 参数         | 类型       | 必填 | 说明        |
| ---------- | -------- | -- | --------- |
| `serviceID` | `string` | ✔  | 服务 ID |

## 调用 MCP 服务
POST /services/{serviceID}/call

| 参数         | 类型       | 必填 | 说明        |
| ---------- | -------- | -- | --------- |
| `serviceID` | `string` | ✔  | 服务 ID |
| `method` | `string` | ✔  | 调用的方法名 |
| `params` | `object` | ✔  | 调用方法的参数 |
