# 渐进式技能加载机制设计文档

## 概述

渐进式技能加载机制是CangjieMagic框架中实现的一个重要功能，它允许系统自动发现并加载指定目录的子目录中的SKILL.md文件。这种机制实现了即插即用的技能扩展方式，无需手动配置即可动态加载新技能。该机制通过ProgressiveSkillLoader类实现，该类接受一个目录路径作为参数，然后自动扫描该目录下的所有子目录，寻找SKILL.md文件并加载它们。

## 设计目标

1. **自动化发现**：自动扫描指定目录下的子目录，寻找SKILL.md文件
2. **即插即用**：只需将SKILL.md文件放入相应子目录，系统即可自动加载
3. **兼容性**：与现有的技能管理系统保持兼容
4. **可扩展性**：易于扩展和维护

## 架构设计

### ProgressiveSkillLoader 类

这是实现渐进式技能加载的核心类，主要职责包括：

- 扫描指定基础目录下的所有子目录
- 检测每个子目录中是否存在SKILL.md文件
- 使用SkillManagementService加载有效的SKILL.md文件（该服务内部协调加载、验证和资源管理）
- 将加载的技能注册到技能管理器中

### 与其他组件的关系

```
ProgressiveSkillLoader
         |
         | 使用
         v
SkillManagementService (领域服务)
         |
         | 协调
         v
SkillLoadingService → 基础设施层组件 (YAML解析器、Markdown处理器等)
SkillValidationService → 验证组件
ResourceLoadingService → 外部资源加载
         |
         | 创建
         v
SkillManifest 对象
         |
         | 转换为
         v
具体的Skill实现
         |
         | 注册到
         v
CompositeSkillToolManager
```

## 工作流程

1. **目录扫描**：ProgressiveSkillLoader扫描指定的基础目录（如examples目录）
2. **子目录识别**：识别基础目录下的所有子目录
3. **SKILL.md检测**：检查每个子目录中是否存在SKILL.md文件
4. **技能加载**：对于包含SKILL.md文件的子目录，使用SkillManagementService加载技能
5. **技能验证**：SkillManagementService使用SkillValidationService验证技能清单
6. **外部资源加载**：SkillManagementService使用ResourceLoadingService加载外部资源
7. **技能注册**：将加载成功的技能注册到CompositeSkillToolManager中
8. **状态更新**：更新内部状态以跟踪已加载的技能

## 代码示例

```cangjie
// 创建渐进式技能加载器
let examplesDir = "path/to/examples/directory"
let loader = ProgressiveSkillLoader(skillBaseDirectory: examplesDir)

// 创建技能管理器
let skillManager = CompositeSkillToolManager()

// 加载技能
let skills = loader.loadSkillsToManager(skillManager)

// 输出加载的技能数量
println("Loaded ${skills.size} skills")
```

## 实现细节

### 文件路径处理

ProgressiveSkillLoader会正确处理文件路径，确保能够准确定位子目录中的SKILL.md文件。

### 错误处理

- 如果子目录中没有SKILL.md文件，会记录信息但不会中断整体加载过程
- 如果SKILL.md文件格式不正确，会通过SkillManagementService记录错误但不会影响其他技能的加载
- 提供详细的错误信息帮助开发者调试问题

### 性能考虑

- 避免重复加载相同的技能
- 提供重新加载功能以适应目录结构的变化
- 高效的目录扫描算法
- 利用SkillManagementService的完整技能管理生命周期，包括验证和资源加载

## 使用场景

1. **开发环境**：在开发过程中快速添加和测试新技能
2. **插件系统**：作为插件系统的底层支持机制
3. **动态扩展**：在运行时动态扩展系统功能
4. **模块化部署**：支持模块化的技能部署策略

## 优势

1. **简化部署**：无需修改代码或配置文件即可添加新技能
2. **提高灵活性**：可以根据需要动态调整可用的技能集
3. **降低维护成本**：减少了手动管理技能列表的工作量
4. **增强可扩展性**：为系统提供了良好的扩展能力
5. **完整性**：利用SkillManagementService的完整技能管理生命周期，包括验证和外部资源加载
6. **一致性**：与现有架构保持一致，避免重复实现

## 注意事项

1. **命名冲突**：确保不同子目录中的SKILL.md文件定义的技能名称唯一
2. **权限设置**：确保应用程序有权限访问技能目录及其子目录
3. **性能监控**：在大量技能的情况下监控加载性能
4. **版本控制**：建议对技能目录进行版本控制以跟踪变更
5. **验证要求**：确保SKILL.md文件符合agentskills规范，以便通过验证

## 未来发展方向

1. **热重载**：实现在不重启系统的情况下检测和加载新技能
2. **条件加载**：根据特定条件选择性地加载技能
3. **依赖管理**：处理技能之间的依赖关系
4. **安全验证**：增加对技能的安全性验证机制
5. **增量加载**：只加载自上次扫描以来新增或修改的技能