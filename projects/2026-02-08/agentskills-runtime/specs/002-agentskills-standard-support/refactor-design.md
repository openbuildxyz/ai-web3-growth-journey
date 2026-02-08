# Agentskills标准重构设计方案

## 问题分析

根据research.md中的已知问题，当前实现存在以下问题：
1. SkillManager类型转换问题：将Skill实现转换为Skill接口时返回None
2. BaseSkill继承了AbsTool，但实际上Skill和Tool有不同的职责和用途
3. Skill不应该继承Tool，而应该独立实现

## 重构目标

1. 解决SkillManager类型转换问题
2. 独立实现Skill架构，不再继承Tool
3. 保持与现有Tool系统的兼容性
4. 遵循agentskills标准的最佳实践

## 重构方案

### 1. 创建独立的Skill架构

#### 1.1 创建AbsSkill抽象基类
- 不再继承AbsTool
- 实现Skill接口的核心功能
- 提供基础的Skill实现

#### 1.2 修改Skill接口
- 移除对Tool接口的继承
- 保留agentskills标准要求的所有属性和方法
- 添加与Skill生命周期相关的特定方法

#### 1.3 更新SkillManager实现
- 修复类型转换问题
- 确保Skill对象能正确转换为Skill接口

### 2. 保持与Tool系统的兼容性

#### 2.1 创建SkillToToolAdapter
- 作为适配器，使Skill可以作为Tool使用
- 在需要的地方提供Tool接口兼容性

#### 2.2 更新DSL宏
- 修改@skill宏以适应新的架构
- 确保生成的类正确实现Skill接口

### 3. 具体实现步骤

#### 步骤1: 创建AbsSkill抽象基类
- 文件: apps\CangjieMagic\src\skill\abs_skill.cj
- 包含所有Skill的基本实现

#### 步骤2: 修改Skill接口
- 文件: apps\CangjieMagic\src\core\skill\skill.cj
- 移除对Tool的继承

#### 步骤3: 创建SkillToToolAdapter
- 文件: apps\CangjieMagic\src\skill\skill_to_tool_adapter.cj
- 提供Skill到Tool的适配

#### 步骤4: 更新BaseSkill实现
- 文件: apps\CangjieMagic\src\skill\base_skill.cj
- 继承AbsSkill而不是AbsTool

#### 步骤5: 修复SimpleSkillManager
- 文件: apps\CangjieMagic\src\skill\simple_skill_manager.cj
- 解决类型转换问题

#### 步骤6: 更新@skill DSL宏
- 文件: apps\CangjieMagic\src\dsl\skill.cj
- 适配新的架构

## 预期效果

1. 解决类型转换问题
2. 更清晰的架构分离(Skill和Tool职责分离)
3. 保持向后兼容性
4. 更符合agentskills标准的实现