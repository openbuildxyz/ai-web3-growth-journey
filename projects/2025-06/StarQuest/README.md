# 🌟 StarQuest 游戏机制说明

![image](https://github.com/user-attachments/assets/39393a2b-9c9f-4888-8541-956bbf26dd3f)

![mainPage](https://github.com/user-attachments/assets/b6f204ad-2af0-4c87-8e74-ebe1c9bbfada)


**StarQuest** 是一款规则上链、结果随机，并通过 AI 增强游戏趣味性的 Web3 游戏，围绕“探索、选择、成长、奖励”展开。玩家将穿越由其他玩家创建的“星岛”，展开一次次充满变数与想象力的星愿旅程。每次选择都记录于链上，每次游戏过程都由 AI 生成独特的图文反馈，最终构成玩家的专属命运轨迹。

---

## 🧩 核心机制概览

| 模块        | 描述 |
|-------------|------|
| ✅ 链上游戏规则 | 所有探索路径选择、事件结果与奖励均由合约+VRF（链上可验证随机数）驱动，确保公平与公开性。 |
| ✅ AI 游戏增强 | 每次游戏均由AI生成图文反馈，增强游戏沉浸感。 |
| ✅ 玩家成长 | 玩家具备等级、技能、装备槽等成长体系，随游戏过程不断增强。 |
| ✅ 星岛成长 | 玩家创建的“星岛”也会随挑战次数成长，增加游戏的变化性。 |
| ✅ 资产留存 | 每次旅程的重大节点可生成“星愿纪念 NFT”，可展示、交易或参与后续活动。 |
| ✅ 风险收益博弈 | 玩家失败将损失门票，由星岛收取；成功则赢得星岛资金池中的奖励部分。 |

---

## 🎮 基础玩法流程

### 1. 创建/进入星岛

- 房主可支付一定费用创建“星岛”，并可**自定义注入奖励资金池**（如 0.01 ETH），为探索者提供激励。
- 同时输入一句星愿描述，系统基于输入生成星岛形象与事件风格。
- 玩家可选择任意星岛进行探索，支付入场费（如 0.0005 ETH），开始旅程。

### 2. 多层探索与选择

- 每个星岛包含多层（通常为3~5层）。
- 每层会出现 **3 个路径选项**（如「曦光阶」、「晨星道」、「辉辉径」）。
- 玩家选择路径 → VRF 返回该路径对应的事件类型：

  | 事件类型 | 效果 |
  |----------|------|
  | 🌟 星辉奖励 | 获得 token 奖励与经验 |
  | 🌀 星愿馈赠 | 获得 buff、技能道具或幸运祝福 |
  | 💥 星屑干扰 | 探索失败，结束本局，入场门票被星岛收回 |

- 玩家可在任意层数 **主动中止探索并结算奖励**，也可选择继续深入冒险。

> ✅ 若成功完成所有层数，将按层数比例获得星岛资金池中的奖励份额

### 3. AI 图文生成

每次事件由 AI 模型生成反馈，包括：

- 图像：对应场景图
- 文本：个性化剧情描述

最终串联为“星愿回忆录”，可 mint 成 NFT 收藏或交易。

---

## 🧬 玩家成长系统

| 内容 | 描述 |
|------|------|
| 🎖 等级 | 每次探索获得 EXP，提升等级解锁新技能位 |
| 🧠 技能 | 被动技能，例如“免疫首次失败”、“重新掷一次命运”等 |
| 💠 星纹 | 可装备的 NFT 组件，提升幸运、事件收益、特殊效果 |
| 📜 星愿纪念 | 每次完整旅程可生成一个图文结合的纪念 NFT，用于展示或市场交易 |

---

## 🏝 星岛成长系统（房主机制）

| 内容 | 描述 |
|------|------|
| 📈 星岛等级 | 每被挑战一次，星岛成长 +1，提升可设置的奖励上限与内容复杂度 |
| 🪄 星岛标签 | 由AI自动标注，如「梦幻型」、「高风险型」、「叙事型」等，帮助玩家筛选偏好星岛 |
| 🎨 星岛进化 | 达到等级阈值后可解锁新的AI模板与图像风格，打造更具吸引力的岛屿形象 |
| 💰 收益机制 | 玩家探索失败时，其入场费用归属房主资金池；资金池中的奖励部分将分配给成功通关者 |

---

## 🪙 游戏经济设计（初版）

| 动作 | 成本 | 回报 |
|------|------|------|
| 创建星岛 | 0.001 ETH + 奖池（可自定） | 解锁星岛，成长回报、分成收益 |
| 探索一次 | 0.0005 ETH | 成功可获星辉 + 星岛奖励，失败门票归星岛 |
| 通关奖励 | 无额外成本 | 可赢得星岛资金池中一部分奖励（按规则比例分配） |
| 纪念NFT铸造 | 0.00001 ETH（可选） | 生成 AI 图+文 旅程记录 NFT，可收藏或交易 |

> 💡 星岛资金池按比例动态分发：如一人通关，则可拿走 60%；若多人通关，则平分或按积分算法加权。

---

## 🗺 示例：一次星愿探索

1. 玩家 Lv3，进入「星岛·晨光之丘」（房主注入 0.01 ETH 奖池）
2. 第1层选择“微星阶” → 触发奖励事件
   - AI图像：金色石阶闪耀星辉
   - 文本描述：“你的第一步，照亮了心中最柔软的愿望。”
3. 第3层触发失败事件 → 退出探索，入场费归星岛
4. 若通关成功：
   - 获得 0.003 ETH 奖励（从星岛奖池中分得）
   - 获得经验+星辉+纪念 NFT

---

## ✨ 项目总结

- 🔐 **链上机制可验证**：每一次选择与结果都可在链上查询，确保无中心作弊
- 🧠 **AI 强化体验**：图文生成提升故事感与玩家粘性，构建个人命运宇宙
- 🧬 **成长性+竞技性并存**：玩家与空间同步成长，鼓励长期参与
- 🪙 **高参与激励结构**：失败有惩罚，成功有分红，构成明确博弈张力
- 💎 **收藏资产化**：纪念NFT让游戏留痕，形成展示与交易价值

---
