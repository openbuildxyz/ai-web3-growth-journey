# 贡献指南

感谢你对最小可行产品(MVP)知识库的关注！我们欢迎并鼓励社区成员贡献内容，丰富这个知识库，帮助更多创业者和产品人员。

本文档将指导你如何向项目提交贡献，确保提交的内容能够顺利合并。

## 贡献流程概述

1. 找到你想要改进的内容
2. Fork 仓库到你的GitHub账号
3. 克隆你的Fork到本地
4. 创建新分支进行修改
5. 提交变更并推送到你的Fork
6. 创建Pull Request (PR)

## 详细步骤

### 1. Fork 仓库

1. 访问[项目GitHub仓库](https://github.com/openbuildxyz/ai-web3-growth-journey/)
2. 点击右上角的"Fork"按钮
3. 选择你的GitHub账号作为目标

### 2. 克隆到本地

```bash
git clone https://github.com/your-username/repo-name.git
cd repo-name
```

### 3. 添加上游远程仓库

```bash
git remote add upstream https://github.com/original-owner/repo-name.git
```

### 4. 创建新分支

```bash
git checkout -b feature/your-feature-name
```

分支命名建议:
- `feature/xxx` - 用于添加新功能或内容
- `fix/xxx` - 用于修复错误
- `improve/xxx` - 用于改进现有内容
- `doc/xxx` - 用于文档改进

### 5. 进行修改

根据下方的"内容指南"进行内容编辑。

### 6. 提交你的变更

```bash
git add .
git commit -m "描述你的变更"
git push origin feature/your-feature-name
```

### 7. 创建Pull Request

1. 访问你的Fork仓库页面
2. 点击"Compare & pull request"按钮
3. 填写PR标题和描述，详细说明你的变更内容和原因
4. 点击"Create pull request"

## 内容指南

### 文件结构

知识库内容主要位于`content/docs/`目录下，按主题分类:

- `getting-started/` - 开始指南
- `planning/` - 规划阶段
- `building/` - 构建阶段
- `launching/` - 发布阶段
- `case-studies/` - 案例研究
- 等等...

### 创建新内容

1. **新章节**: 在相应目录下创建新的`.mdx`文件
2. **文件头部**: 每个文件都需要包含以下头部信息:

```md
---
title: 您的章节标题
description: 简短的章节描述（100-150字符）
---
```

3. **更新导航**: 如果添加新文件，需要更新相应目录下的`meta.json`文件，将新文件添加到"pages"数组中。

### 内容格式和风格

1. **使用Markdown**: 内容使用Markdown格式，支持所有标准Markdown语法
2. **标题层级**: 
   - 文件开始使用一级标题 (`# 标题`)
   - 主要段落使用二级标题 (`## 标题`)
   - 子部分使用三级及以下标题
3. **代码块**: 使用标准Markdown代码块，并指定语言:
   ````
   ```javascript
   // 示例代码
   ```
   ````
4. **图片**: 图片文件应放在`public/images/`目录下，并使用相对路径引用:
   ```md
   ![图片描述](/images/your-image.png)
   ```
5. **链接**: 使用相对路径链接到其他章节:
   ```md
   [链接到其他章节](/docs/category/page-name)
   ```

### 内容质量建议

为保证知识库的高质量，请确保你的贡献:

1. **实用性**: 提供实用的建议和可操作的指导
2. **简洁明了**: 使用简洁明了的语言传达核心概念
3. **示例丰富**: 尽可能提供实际例子、代码片段或案例研究
4. **引用来源**: 引用外部信息时提供来源链接
5. **避免冗余**: 不要重复已有内容，可以链接到相关章节
6. **保持更新**: 确保信息是最新的，特别是涉及工具和平台的内容

## 审核流程

提交PR后:

1. 维护者会审核你的贡献
2. 可能会提出修改建议或要求更改
3. 讨论并解决任何问题
4. 一旦获得批准，你的贡献将被合并到主分支

## 行为准则

参与本项目即表示您同意遵守以下基本原则:

- 尊重其他贡献者
- 接受建设性批评
- 专注于帮助他人
- 避免推广个人产品或服务

## 问题和讨论

如有问题或想法，请:

1. 查看现有[Issues](https://github.com/openbuildxyz/ai-web3-growth-journey/issues)
2. 如果没有找到相关问题，创建新Issue
3. 在提交PR前，可以先创建Issue讨论你的想法

## 许可

通过提交PR，你同意你的贡献将在本项目的许可下发布。详情请查看[LICENSE](LICENSE)文件。

感谢你的贡献，让我们一起打造更好的MVP知识库！ 