# Research: Agentskills Standard Support in CangjieMagic Framework

## Decision: Implement @skill DSL Macro for CangjieMagic Framework

## Rationale: 
Based on analysis of the CangjieMagic framework and the agentskills standard, the best approach is to implement a `@skill` DSL macro that follows the same architectural pattern as the existing `@tool` and `@toolset` macros. This approach will:

1. Maintain consistency with the existing CangjieMagic framework architecture
2. Provide a familiar interface for developers already using the framework
3. Leverage the existing infrastructure for tool management and execution
4. Enable seamless integration with the agentskills standard specification

## Alternatives Considered:

1. **Direct file-based approach**: Reading SKILL.md files directly without a DSL macro
   - Pros: Simpler implementation, direct compliance with agentskills standard
   - Cons: Doesn't integrate well with CangjieMagic's existing tool management system, lacks compile-time validation

2. **Wrapper approach**: Creating a wrapper around existing Python agentskills reference implementation
   - Pros: Leverages existing implementation, ensures compliance
   - Cons: Adds complexity, requires Python runtime, doesn't follow Cangjie architecture patterns

3. **Complete re-implementation**: Building a new skill system from scratch
   - Pros: Full control over implementation, optimized for Cangjie
   - Cons: Significant development effort, potential for non-compliance with standard

## Technical Findings:

### CangjieMagic Framework Architecture:

#### Component Organization Pattern:
The CangjieMagic framework follows a consistent three-tier architecture for its components:

1. **User-facing components** (`apps\CangjieMagic\src\[component]`)
   - Contains high-level, user-friendly implementations
   - Examples: `apps\CangjieMagic\src\agent` (concrete agent implementations), `apps\CangjieMagic\src\tool` (specific tool implementations)

2. **Core components** (`apps\CangjieMagic\src\core\[component]`)
   - Contains abstract interfaces and core logic
   - Examples: `apps\CangjieMagic\src\core\agent` (Agent interface), `apps\CangjieMagic\src\core\tool` (Tool interface)

3. **DSL macros** (`apps\CangjieMagic\src\dsl\[component].cj`)
   - Contains AST transformation macros
   - Examples: `apps\CangjieMagic\src\dsl\agent.cj`, `apps\CangjieMagic\src\dsl\tool.cj`

#### Agent Component Architecture:
- **User-facing**: Located in `apps\CangjieMagic\src\agent`, contains concrete agent implementations like `ToolAgent`, `ConversationAgent`, etc.
- **Core**: Located in `apps\CangjieMagic\src\core\agent`, contains interfaces like `Agent`, `AgentExecutor`, `AgentRequest`, etc.
- **DSL**: The `@agent` macro in `apps\CangjieMagic\src\dsl\agent.cj` transforms class declarations into agent implementations with properties like model, executor, tools, etc.

#### Tool Component Architecture:
- **User-facing**: Located in `apps\CangjieMagic\src\tool`, contains specific tool implementations like `NativeFuncTool`, `SimpleToolManager`, etc.
- **Core**: Located in `apps\CangjieMagic\src\core\tool`, contains interfaces like `Tool`, `ToolManager`, `Toolset`, etc.
- **DSL**: The `@tool` macro in `apps\CangjieMagic\src\dsl\tool.cj` transforms function declarations into Tool objects with metadata.

#### Package Structure:
The `pkg.cj` file in `apps\CangjieMagic\src\core\` imports all core modules, creating a unified interface for the framework:
```cj
package magic.core

public import magic.core.agent.*
public import magic.core.tool.*
public import magic.core.memory.*
public import magic.core.model.*
public import magic.core.rag.*
```

### Agentskills Standard:
- Skills are defined as directories containing a SKILL.md file
- SKILL.md contains YAML frontmatter with metadata (name, description, license, etc.)
- The body contains instructions, examples, and guidelines for the skill
- Optional directories: scripts/, references/, assets/
- Skills can be validated using the reference implementation

### Claude Skills Examples:
- Skills are implemented as structured markdown files with specific metadata
- Skills include detailed instructions for specific tasks
- Skills can reference external resources and scripts
- Skills are designed to be discoverable and reusable

## Implementation Strategy:

The `@skill` macro will follow the same pattern as the existing `@tool` macro but will be specifically designed to handle the agentskills standard format. It will:

1. Parse SKILL.md files to extract metadata and instructions
2. Transform skill definitions into Cangjie Tool objects
3. Integrate with the existing ToolManager system
4. Support the optional directories (scripts/, references/, assets/) as needed

## Integration with Existing Framework:

### DSL Macro Integration:
- The `@skill` macro will be implemented in `apps\CangjieMagic\src\dsl\skill.cj`
- It will follow the same AST transformation pattern as `@tool` and `@agent`
- Skills will be transformed into objects that implement the `Tool` interface
- This allows skills to be managed by the existing `ToolManager`

### Core Component Integration:
- A `Skill` interface will be added in `apps\CangjieMagic\src\core\skill`
- This interface will extend the `Tool` interface to maintain compatibility
- A `SkillManager` will be created to handle skill-specific operations while maintaining compatibility with `ToolManager`

### User-Facing Component Integration:
- Skill implementations will be placed in `apps\CangjieMagic\src\skill`
- These will include concrete implementations like `FileBasedSkill`, `SkillLoader`, etc.
- Existing agent implementations will be able to use skills through the existing tool integration

## Architecture Consistency:
The skill implementation will maintain consistency with the existing CangjieMagic architecture by:
1. Following the same three-tier component organization pattern
2. Using the same DSL macro approach for code generation
3. Integrating with existing interfaces like `ToolManager`
4. Maintaining the same package structure and import patterns

## 已知问题 (Known Issues)
1. 
- **SkillManager 类型转换问题**: 当前在使用 SimpleSkillManager 时，将 Skill 实现转换为 Skill 接口时存在问题。`as Skill` 操作返回 `None` 而不是预期的 Skill 对象，阻止了与 SkillManager 的正确集成。这是一个已知问题，需要进一步研究类层次结构和接口实现。
  - **解决方法**: 目前，可以直接通过调用其 `execute` 方法来使用技能，如示例中所示。
  - **状态**: 正在处理中 - 调查正确的接口实现和转换行为。

2. 这个 @skill 转换 class 继承 BaseSkill，但 BaseSkill 中的 execute 方法也没有被 override，似乎没啥用？

3. skill不应该继承tool，以下是分析内容：

Anthropic公司上个月发布的agent skill标准，参考网址https://agentskills.io/specification。请分析从agent开发角度来说，skill和tool有什么异同。从程序上实现skill标准的时候，架构是继承tool，还是独立实现一套skill更加合理？

一、Skill与Tool的异同（从Agent开发角度）
 
维度	Tool（工具）	Skill（技能）
核心定位	单一功能模块（如文件读取、数据计算），是“可执行操作单元”	任务解决方案（如PDF处理、代码审查），是“组合化能力包”
构成形态	独立可调用的程序/接口，无额外依赖（或依赖明确且极简）	以SKILL.md为核心，可包含脚本、文档、资源，是“配置+逻辑+资源”的集合
调用逻辑	Agent直接触发，输入输出格式固定（如“输入文件路径→输出文本”）	Agent根据任务匹配激活，需解析SKILL.md中的指令、依赖工具列表，是“决策+执行”的组合
依赖关系	不依赖其他Tool/Skill，自身是最小执行单元	可通过指定依赖的Tool，需Tool支撑才能完成任务
适用场景	通用化、原子化任务（如字符串处理、网络请求）	场景化、复杂任务（如PDF提取+表格分析、多步骤表单处理）

 
二、程序实现架构选择：独立实现Skill更合理
 
核心结论：优先独立实现一套Skill架构，而非继承Tool，理由如下：
 
1. Skill是“任务维度的能力封装”，Tool是“操作维度的功能单元”，二者层级不同（Skill可包含多个Tool，而非Tool的子类）；
​
2. Skill需支持配置解析（SKILL.md前端matter）、资源加载（scripts/assets）、依赖管理（allowed-tools）等Tool不具备的特性，继承会导致Tool架构冗余；
​
3. 独立架构可兼容现有Tool生态（通过 allowed-tools 关联已实现的Tool），且符合Anthropic标准中“Skill为顶层任务单元”的设计逻辑，扩展性更强（如后续支持多Tool组合、动态资源加载）。
 
三、补充建议
 
独立实现时，可设计“Skill管理器”模块，负责解析SKILL.md、管理Tool依赖调用、加载附属资源，Tool保持原子化不变，二者通过“依赖列表”建立关联，既符合标准规范，又能复用现有Tool资产。
 
需要我基于该标准，帮你梳理一份“Skill与Tool的接口适配方案”（含依赖调用流程图+核心代码框架）吗？