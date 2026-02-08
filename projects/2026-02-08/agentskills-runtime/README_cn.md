# AgentSkills Runtime

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/uctoo/agentskills-runtime)
[![Cangjie](https://img.shields.io/badge/language-Cangjie-orange.svg)](https://cangjie-lang.cn/)

## 项目简介

AgentSkills Runtime 是一个基于仓颉编程语言实现的 Agent Skills 标准运行时环境。它是对 AgentSkills 开放标准的国产技术栈实现，提供了安全、高效的 AI 智能体技能执行环境。旨在让 AgentSkills 能够在任何地方运行。开源项目地址 https://atomgit.com/uctoo/agentskills-runtime

## 概述

AgentSkills Runtime 是一个全面的框架，用于构建和执行 AI 智能体技能。它为遵循 agentskills 标准的 AI 智能体工具提供了安全、便携和智能的运行时环境。该框架基于仓颉编程语言构建，并融合了UCToo项目架构的先进特性。

该框架包括：
- 对 agentskills 标准的支持，包括 SKILL.md 文件的加载和验证
- DSL 支持，包含 `@skill`、`@tool` 和 `@agent` 宏
- 清晰的关注点分离的整洁架构（领域层、应用层、基础设施层）
- MCP（Model Context Protocol）支持，用于与 AI 智能体集成
- 技能到工具的适配器，实现技能与工具的兼容性
- 从可配置目录进行渐进式技能加载
- 基于 WASM 的安全沙箱，用于安全的技能执行
- 具有混合密集+稀疏搜索能力的高级 RAG 搜索
- 多格式技能支持（WASM 组件和 SKILL.md 文件）

## 🎯 项目愿景

打造国产自主可控的 AI 智能体技能运行时，推动 Agent Skills 标准在AI生态中的落地应用，构建开放、安全、高效的 AI 原生应用基础设施。旨在让 AgentSkills 能够在任何地方运行。

## 架构设计

该实现遵循整洁架构原则，具有清晰的关注点分离：

- **领域层**：包含业务逻辑和实体（SkillManifest、SkillParameter 等）
- **应用层**：协调用例（SkillLoadingService、SkillValidationService 等）
- **基础设施层**：处理外部关注点（文件加载、YAML 处理等）
- **表示层**：管理技能和工具交互

## 功能特性

### AgentSkills 标准支持
- 根据 agentskills 规范从 SKILL.md 文件加载技能
- 带验证的 YAML 前置元数据解析
- 用于技能指令的 Markdown 正文处理
- 外部资源访问（scripts/、references/、assets/）

### DSL 支持
- `@skill` 宏用于声明式技能定义
- `@tool` 宏用于工具定义
- `@agent` 宏用于智能体定义

### 安全性
- 基于 WASM 的安全沙箱，支持组件模型
- 基于能力的访问控制（文件系统、网络等）
- 资源配额和执行限制
- 执行上下文隔离

### 搜索与发现
- 具有混合密集+稀疏搜索的高级 RAG 搜索（向量嵌入 + BM25 与 RRF 融合）
- 交叉编码器重排序以提高精度
- 带意图分类和实体提取的查询理解
- 用于令牌高效输出的上下文压缩

### 多格式技能支持
- 支持组件模型的 WASM 组件执行
- 遵循 agentskills 标准的 SKILL.md 文件解析和执行
- 格式无关的技能接口
- 动态格式检测和验证

### MCP 集成
- 从技能清单动态发现工具
- 与 MCP 协议的语义搜索集成
- 大型技能目录的分页支持
- 带嵌入式 Web UI 的 HTTP 流模式

### 多语言生态系统支持
- **跨语言互操作性**：支持不同编程语言编写的技能在同一运行时环境中协同工作
- **语言适配器**：为不同编程语言提供标准化的技能接口适配器
- **统一 API 层**：抽象底层实现细节，提供一致的编程接口
- **依赖管理**：智能处理多语言项目的依赖关系和版本冲突

### 多语言 SDK 支持
- **JavaScript/TypeScript SDK**：完整的 Node.js 和浏览器环境支持
- **Python SDK**：集成流行的 Python AI 和数据科学库
- **Java SDK**：企业级应用和 Android 平台支持
- **Go SDK**：高性能并发处理和云原生应用支持
- **Rust SDK**：系统级性能和内存安全保证
- **C# SDK**：.NET 生态系统和 Windows 平台集成

## 核心特性

### 🚀 高性能执行
- **高性能**:  基于仓颉编程语言的高性能运行时
- **强安全**:  WASM 沙箱安全执行环境  + 多层权限控制的安全架构
- **标准化**: 完全兼容 AgentSkills 开放标准规范

### 🔒 安全可靠
- **执行隔离**: 多层安全防护机制
- **权限控制**: 细粒度的权限管理和资源访问控制
- **审计追踪**: 完整的操作日志和安全审计机制

### 📦 标准兼容
- 完全兼容 AgentSkills 开放标准
- 支持 SKILL.md 文件格式
- 实现标准的 YAML 前置元数据规范

### 🔧 易用性
- **简单集成**: 提供简洁的 API 接口
- **丰富示例**: 多样化的使用示例和最佳实践
- **详细文档**: 完善的中英文技术文档

### 🔧 灵活扩展
- 插件化架构设计
- 支持自定义技能开发
- 丰富的 API 接口和工具集

## 快速开始

### 环境要求
- 仓颉编程语言环境 (https://cangjie-lang.cn/)
- 支持的操作系统: Windows/Linux/macOS

### 安装

```bash
# 确保已安装仓颉编程语言环境
cjpm --version

# 克隆项目
git clone https://atomgit.com/uctoo/agentskills-runtime.git
cd agentskills-runtime
```

### 运行示例
```bash
# 构建项目
cjpm build

# 运行示例
cjpm run --skip-build --name magic.examples.uctoo_api_mcp_server
cjpm run --skip-build --name magic.examples.uctoo_api_mcp_client
```

## 使用方法

### 使用 DSL 创建技能

```cangjie
import { Skill, Tool } from "agentskills-runtime";

@Skill(
  name = "hello-world",
  description = "一个简单的问候用户技能",
  license = "MIT",
  metadata = {
    author = "您的姓名",
    version = "1.0.0",
    tags = ["问候", "示例"]
  }
)
public class HelloWorldSkill {
    @Tool(
      name = "greet",
      description = "按姓名问候用户",
      parameters = [
        { name: "name", type: "string", required: true, description: "要问候的人的姓名" }
      ]
    )
    public String greet(String name) {
        return "你好，" + name + "!";
    }
}
```

### 从 SKILL.md 加载技能

创建一个 `SKILL.md` 文件：

```markdown
---
name: example-skill
description: 演示 SKILL.md 格式的示例技能
license: MIT
metadata:
  author: 您的姓名
  version: "1.0"
---

# 示例技能

这是一个演示 SKILL.md 格式的示例技能。

## 提供的工具

### greet

按姓名问候用户。

**参数：**
- `name`（必需，字符串）：要问候的人的姓名

**示例：**
```bash
skill run example-skill:greet name=Alice
```
```

### 渐进式技能加载

```cangjie
let skillDir = "path/to/skill/directory"
let loader = ProgressiveSkillLoader(skillBaseDirectory: skillDir)
let skillManager = CompositeSkillToolManager()
let skills = loader.loadSkillsToManager(skillManager)
```

### 多语言 SDK 使用示例

#### JavaScript/TypeScript 示例
```javascript
import { AgentSkillsRuntime } from '@agentskills/runtime';

// 初始化运行时
const runtime = new AgentSkillsRuntime({
  baseUrl: 'http://localhost:8080',
  apiKey: 'your-api-key'
});

// 加载并执行技能
const result = await runtime.executeSkill('example-skill', {
  name: 'Alice',
  age: 30
});

console.log('执行结果:', result);
```

#### Python 示例
```python
from agentskills import Runtime

# 初始化运行时
runtime = Runtime(
    base_url="http://localhost:8080",
    api_key="your-api-key"
)

# 加载并执行技能
result = runtime.execute_skill("example-skill", {
    "name": "Alice",
    "age": 30
})

print(f"执行结果: {result}")
```

#### Java 示例
```java
import com.agentskills.Runtime;
import com.agentskills.SkillResult;

// 初始化运行时
Runtime runtime = Runtime.builder()
    .baseUrl("http://localhost:8080")
    .apiKey("your-api-key")
    .build();

// 加载并执行技能
Map<String, Object> parameters = new HashMap<>();
parameters.put("name", "Alice");
parameters.put("age", 30);

SkillResult result = runtime.executeSkill("example-skill", parameters);
System.out.println("执行结果: " + result.getOutput());
```

## 开发指南

### 开发环境搭建

```bash
# 安装依赖
cjpm install

# 运行测试
cjpm test

# 代码检查
cjpm check
```

## 项目结构

```
apps/agentskills-runtime/
├── cjpm.toml                            # 仓颉包配置
├── build.cj                             # 构建脚本
├── README.md                            # 项目文档
├── README_cn.md                         # 中文项目文档
├── LICENSE                              # 许可证信息
├── docs/                                # 文档
│   ├── architecture.md                  # 架构概述
│   ├── quickstart.md                    # 快速入门指南
│   └── api-reference.md                 # API 参考
├── src/                                 # 源代码
│   ├── skill/                          # 技能相关功能
│   │   ├── domain/                     # 技能领域模型
│   │   ├── infrastructure/             # 技能基础设施组件
│   │   └── application/                # 技能应用服务
│   ├── security/                       # 安全模块
│   │   ├── wasm_sandbox/               # WASM 沙箱
│   │   └── access_control/             # 访问控制
│   ├── runtime/                        # 运行时核心
│   ├── utils/                          # 工具函数
│   └── examples/                       # 示例实现
├── specs/                               # 规范文档
├── skills/                              # 示例和参考技能
├── sdk/                                 # 多语言 SDK 实现
│   ├── javascript/                     # JavaScript/TypeScript SDK
│   ├── python/                         # Python SDK
│   ├── java/                           # Java SDK
│   ├── go/                             # Go SDK
│   ├── rust/                           # Rust SDK
│   └── csharp/                         # C# SDK
└── tests/                               # 测试实现
```

## 依赖关系

此实现利用了仓颉生态系统中的现有库：
- `yaml4cj`：用于解析 SKILL.md 文件中的 YAML 前置元数据
- `commonmark4cj`：用于根据 CommonMark 规范处理 SKILL.md 文件中的 markdown 内容
- `stdx`：用于各种实用函数

### 多语言 SDK 依赖
各语言 SDK 依赖相应的生态系统：
- **JavaScript**: npm 包管理器，依赖主流 AI 库如 langchain、openai-api
- **Python**: pip 包管理器，依赖 numpy、scikit-learn、transformers 等
- **Java**: Maven/Gradle，依赖 Spring Boot、Apache HttpComponents
- **Go**: Go modules，依赖 gin、gorilla/websocket 等
- **Rust**: Cargo，依赖 tokio、serde、reqwest 等
- **C#**: NuGet，依赖 .NET Core 相关包

### 基本使用

```cangjie
import magic.agentskills.runtime

// 创建技能运行时实例
let runtime = SkillRuntime()

// 加载技能
let skill = runtime.loadSkill("path/to/skill")

// 执行技能
let result = skill.execute(params)
```

### 技能开发示例
```cangjie
import magic.agentskills.runtime
import magic.agentskills.skill.domain.models.skill_manifest

// 定义技能清单
let manifest = SkillManifest {
    name: "example_skill",
    version: "1.0.0",
    description: "示例技能",
    author: "UCToo",
    parameters: [],
    implementation: "./skill_impl.cj"
}

// 创建技能运行时
let runtime = SkillRuntime()

// 加载并执行技能
let skill_result = runtime.execute(manifest, {})
```

## 文档资源

- [完整文档](docs/)
- [API 参考](docs/api-reference.md)
- [开发指南](docs/skill-development.md)

### 规范驱动开发文档
- [AgentSkills 标准规范](specs/003-agentskills-enhancement/spec.md)
- [数据模型定义](specs/003-agentskills-enhancement/data-model.md)
- [实现计划](specs/003-agentskills-enhancement/plan.md)

## 贡献指南

欢迎参与项目贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

请参阅文档中的贡献指南。

### 贡献方式
1. **代码贡献**: 提交 Pull Request 改进代码
2. **文档完善**: 帮助完善技术文档和使用指南
3. **问题反馈**: 报告 Bug 或提出功能建议
4. **技能开发**: 开发新的技能示例
5. **SDK 开发**: 为新的编程语言开发 SDK
6. **语言适配器**: 开发新的语言适配器和绑定
7. **生态系统集成**: 集成主流开发工具和平台

### 开发流程
```bash
# Fork 项目
# 创建功能分支
git checkout -b feature/your-feature

# 提交更改
git commit -am 'Add new feature'

# 推送分支
git push origin feature/your-feature

# 创建 Pull Request
```

## 项目状态

- [x] 核心运行时实现
- [x] 安全沙箱机制
- [x] 标准兼容性验证
- [ ] 性能优化
- [ ] 生产环境部署
- [ ] 社区生态建设

## 整体流程与关键技术

### 核心工作流程

1. **技能发现与加载**
   - 自动扫描配置目录中的技能文件
   - 解析 SKILL.md 文件的 YAML 前置元数据
   - 验证技能格式和依赖关系

2. **安全执行环境**
   - WASM 沙箱提供隔离执行环境
   - 基于能力的权限控制系统
   - 资源使用监控和限制

3. **技能执行与编排**
   - 动态参数解析和验证
   - 技能间依赖关系管理
   - 执行结果收集和处理

### 关键技术组件

- **Skill Manifest Parser**: 解析和验证 SKILL.md 文件格式
- **WASM Runtime**: 安全的技能执行环境
- **Capability Manager**: 细粒度的权限控制系统
- **Resource Monitor**: 资源使用监控和配额管理
- **Dependency Resolver**: 技能依赖关系解析
- **Execution Orchestrator**: 技能执行编排引擎

## 许可证

本项目采用 MIT 许可证，详情请见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目主页: https://atomgit.com/uctoo/agentskills-runtime
- 问题反馈: https://atomgit.com/uctoo/agentskills-runtime/issues
- 邮件联系: contact@uctoo.com
- 微信交流群: 请通过项目主页获取入群二维码

## 致谢

感谢以下开源项目和社区的支持：

### 技术标准
- [AgentSkills 开放标准](https://github.com/agentskills/agentskills)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)

### 编程语言
- [仓颉编程语言](https://cangjie-lang.cn/)
- [WebAssembly](https://webassembly.org/)


### 开源工具
- [UCToo](https://gitee.com/uctoo/uctoo)
- [CangjieMagic](https://gitcode.com/Cangjie-TPC/CangjieMagic)
- 各种优秀的开源库和工具

### 参考资料
- [只需免费AI就能用仓颉开发强大Agent](https://mp.weixin.qq.com/s/jcUVuj7bLs9DaHLhol4-Hg)
- [深度解析agent skill标准](https://mp.weixin.qq.com/s/qFae5uqJsOAEkn1LN12tuA)

---
**AgentSkills Runtime - 让 AI 开发更简单、更安全、更快捷！**