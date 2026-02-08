# 技能示例 (Skill Examples)

此目录包含符合 [agentskills 标准](https://agentskills.io) 的技能示例实现。这些示例演示了如何在 CangjieMagic 框架中创建和使用技能。

## 概述 (Overview)

技能示例展示了在 CangjieMagic 框架内实现 agentskills 标准。示例包括：

- **GreetingSkill**: 生成个性化问候的简单技能
- **CalculatorSkill**: 执行基本数学计算的技能
- **SkillExecutionTests**: 演示如何执行技能的测试

## 文件结构 (File Structure)

```
skill_examples/
├── greeting_skill.cj        # 问候技能的实现
├── calculator_skill.cj      # 计算器技能的实现
├── skill_execution_tests.cj # 技能执行的测试
├── main.cj                  # 示例应用程序的入口点
├── README.md               # 英文说明文档
└── README_CN.md            # 中文说明文档
```

## 使用方法 (Usage)

要运行技能示例：

```bash
cjpm run --name magic.examples.skill_examples
```

## Agentskills 标准合规性 (Agentskills Standard Compliance)

此示例中的所有技能都遵循 agentskills 标准规范：

- 使用必需字段定义技能：`name`, `description`
- 正确处理可选字段：`license`, `compatibility`, `metadata`, `allowedTools`
- 技能实现适当的接口以与 CangjieMagic 框架配合使用
- 技能可以从 SKILL.md 文件加载或直接在代码中定义

## 创建您自己的技能 (Creating Your Own Skills)

要创建遵循 agentskills 标准的自定义技能：

1. 继承 `BaseSkill` 类（它继承自 `AbsSkill` 而非 `Tool`）
2. 实现必需的属性：`name`, `description` 等
3. 重写 `execute` 方法以实现您的技能功能
4. 如需高级功能，请使用 `@skill` DSL 宏

示例 (Example):
```cangjie
public class MyCustomSkill <: BaseSkill {
    public init() {
        super(
            name: "my-custom-skill",
            description: "执行特定任务的自定义技能",
            license: Some("MIT"),
            compatibility: None,
            metadata: HashMap<String, String>([("author", "您的姓名"), ("version", "1.0")]),
            allowedTools: None,
            instructions: "# 我的自定义技能\n\n此技能执行特定任务。",
            skillPath: "./my-custom-skill"
        )
    }

    override public func execute(args: HashMap<String, JsonValue>): String {
        // 在此处实现您的技能功能
        return "执行了我的自定义技能"
    }
}
```

## 与 CangjieMagic 框架集成 (Integration with CangjieMagic Framework)

这些技能与现有的 CangjieMagic 框架无缝集成：

- 技能通过 `SkillToToolAdapter` 适配器与 `ToolManager` 集成
- 技能不再直接实现 `Tool` 接口，而是通过适配器模式实现兼容性
- 已支持工具的代理可以通过适配器使用技能
- 技能遵循框架中其他组件的相同架构模式

## 架构变更 (Architecture Changes)

重构后的技能系统采用了新的架构：

- **AbsSkill**: 独立的抽象基类，不继承自 `Tool` 接口
- **SkillToToolAdapter**: 适配器模式，使技能能够与现有的 `ToolManager` 兼容
- **BaseSkill**: 继承自 `AbsSkill`，提供基础实现
- 这种设计解决了之前技能与工具混合的问题，提供了更清晰的职责分离