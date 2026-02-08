# Rad-Vault: 基于 LASSO 算法的 MRI 影像组学特征资产化引擎

### 1. 项目介绍 (Project Overview)
**Rad-Vault** 是一个结合了 AI 影像组学与 DeSci (去中心化科学) 理念的预研项目。
在 Web3 医疗生态中，患者隐私数据难以在保护隐私的前提下产生价值。本项目通过 **LASSO 稀疏建模技术**，将高维的 MRI 原始影像降维提纯为具备临床解释性的“数字特征资产”。

**核心痛点：**
- 传统医疗数据是孤岛，且原始影像体积大、难以确权。
- 深度学习模型是黑盒，不符合 Web3 对透明度（Transparency）的要求。

**解决方案：**
- 提供透明的 R 语言分析引擎，提取关键生物标记物（Biomarkers）。
- 为 AI Agent 提供可验证的逻辑决策支持，实现“数据即资产”的转化。

### 2. 团队信息 (Team Information)
- **成员：** 杨双源
- **院校：** 香港理工大学 (The Hong Kong Polytechnic University)
- **专业：** 生物医学工程 (Biomedical Engineering)
- **角色：** 算法开发、数据建模、DeSci 逻辑构建

### 3. 技术实现 (Technical Implementation)
本项目构建了一套严谨的影像组学分析流水线：
- **数据预处理**：实现零方差特征过滤与 Z-score 标准化，防止数据偏态。
- **特征降维 (Core AI)**：采用 **LASSO (Least Absolute Shrinkage and Selection Operator)** 回归。通过 L1 正则化将不相关特征系数压缩至零，解决高维共线性问题。
- **模型验证**：基于 10 折交叉验证 (10-fold CV) 筛选最优 Lambda 值，确保模型在验证集上的泛化能力。
- **可解释性输出**：不同于黑盒模型，本项目输出明确的特征贡献度排序，可直接对应医学物理意义。

### 4. Web3 愿景
本引擎旨在集成于医疗 AI Agent 之中。未来，提取的特征系数可存储于链上（On-chain），作为去中心化诊断证明（Proof of Diagnosis）的核心依据。
