# 变更日志

本文档记录 Oracle-X 项目的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增

- 项目结构规范化
- 代码质量工具配置（ESLint、Prettier）
- 完整的项目文档体系
- MIT 开源许可证

### 优化

- 增强 TypeScript 类型检查
- 改进路径别名配置

## [0.1.0] - 2026-02-08

### 新增

- 实时市场数据监控（Binance API）
- 专业技术指标计算（RSI、MACD、布林带、ATR）
- AI 驱动的交易分析（基于阶跃星辰 API）
- 流式响应展示分析过程
- Chrome 扩展支持
- 用户画像分析功能
- 三级风险评估系统
- Twitter 情绪分析集成

### 技术架构

- Next.js 14.2.5 + React 18.3
- TypeScript 5.4
- lightweight-charts 图表库
- technicalindicators 技术分析库
- Vercel Edge Runtime 部署

---

## 版本说明

版本号格式：主版本号.次版本号.修订号

- **主版本号**：不兼容的 API 变更
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

## 变更类型

- `新增` - 新功能
- `优化` - 已有功能的改进
- `修复` - Bug 修复
- `弃用` - 即将移除的功能
- `移除` - 已移除的功能
- `安全` - 安全性修复
