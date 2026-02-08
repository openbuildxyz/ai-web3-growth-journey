# 仓颉代码重构技能 (Cangjie Code Refactoring Skill)

## 概述

此技能用于根据CANGJIE_CODING_GUIDELINES.md规范自动重构仓颉代码，确保代码符合仓颉编程语言的最佳实践和规范要求。

## 功能

1. 自动检测代码中的规范问题
2. 根据指南自动修复常见问题（如字符串处理、类型转换、异常处理等）
3. 提供重构建议和报告

## 参数

- `path` (string, required): 要重构的代码文件或目录路径
- `fix` (boolean, optional, default: true): 是否自动修复发现的问题
- `report` (boolean, optional, default: true): 是否生成重构报告

## 示例

```bash
# 重构单个文件
skill run cangjie-refactor:refactor --path ./src/main.cj --fix true

# 重构目录中的所有.cj文件
skill run cangjie-refactor:refactor --path ./src --fix true --report true
```