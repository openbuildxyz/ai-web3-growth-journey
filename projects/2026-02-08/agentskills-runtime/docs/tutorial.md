# 用户教程

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [用户教程](#用户教程)
  - [Agent 定义](#agent-定义)
  - [编写提示词](#编写提示词)
    - [使用提示词模式](#使用提示词模式)
    - [自定义提示词模式](#自定义提示词模式)
  - [Agent 交互方法](#agent-交互方法)
    - [输入模板](#输入模板)
    - [对话历史](#对话历史)
  - [MCP 协议和工具](#mcp-协议和工具)
    - [工具函数编写](#工具函数编写)
    - [使用工具和 MCP 服务器](#使用工具和-mcp-服务器)
    - [工具额外属性设置](#工具额外属性设置)
  - [规划](#规划)
    - [Agent 执行 DSL（实验）](#agent-执行-dsl实验)
  - [外部知识](#外部知识)
  - [示例](#示例)
    - [示例 1: 命令行助手 Agent](#示例-1-命令行助手-agent)
  - [多 Agent 协作](#多-agent-协作)
    - [线性协同](#线性协同)
    - [主从协同](#主从协同)
    - [自由协同](#自由协同)
    - [Agent 协同子组构建](#agent-协同子组构建)
  - [快捷 AI 函数](#快捷-ai-函数)
  - [Agent Human-in-the-Loop](#agent-human-in-the-loop)
  - [模型配置](#模型配置)
  - [常用 API 介绍](#常用-api-介绍)
    - [全局配置](#全局配置)
    - [Agent 类型](#agent-类型)
    - [Agent 劫持机制](#agent-劫持机制)
    - [内置 Agent](#内置-agent)
      - [`BaseAgent`](#baseagent)
      - [`DispatchAgent`](#dispatchagent)
      - [`ToolAgent`](#toolagent)
      - [`HumanAgent`](#humanagent)
    - [Jsonable 接口](#jsonable-接口)
    - [接入新模型](#接入新模型)
    - [自定义规划方法](#自定义规划方法)
    - [语义检索功能](#语义检索功能)
      - [向量模型](#向量模型)
      - [向量数据库](#向量数据库)
      - [索引映射表](#索引映射表)
      - [语义数据结构](#语义数据结构)
      - [使用示例](#使用示例)
    - [知识图谱](#知识图谱)
      - [MiniRag](#minirag)
      - [`实例化`](#实例化)
      - [`知识图谱构建`](#知识图谱构建)
      - [`知识图谱检索`](#知识图谱检索)
      - [使用示例](#使用示例-1)
        - [`知识图谱检索`](#知识图谱检索)
<!-- /code_chunk_output -->

Cangjie Agent DSL 是一个用于定义和管理 Agent 的专用语言。它允许开发人员通过结构化的系统提示词、工具和各类协作策略来增强 Agent 的功能。本手册将介绍如何使用 Cangjie Agent DSL 的各种功能，并通过实例帮助用户快速上手。

Cangjie Agent DSL 被设计为仓颉语言的 eDSL，即在仓颉语言中通过元编程机制实现了嵌入式的 DSL，且仓颉语言作为它的宿主语言。这意味着 Agent DSL 编写的代码最终都被转换为普通的仓颉代码，并最终由仓颉编译器完成编译。

## Agent 定义

目前，我们使用宏 `@agent` 修饰 `class` 类型来定义一个 Agent 类型。

```cangjie
@agent class Foo { }
```

宏 `@agent` 支持如下属性，具体属性可参考相应章节内容。

| 属性名 | 值类型 | 说明 |
|-------|-------|-------|
| `description` | `String` | Agent 的功能描述；默认未设置时，将由 LLM 从提示词中自动总结出 |
| `model` | `String` | 配置使用到的 LLM 模型服务；默认使用 gpt-4o |
| `tools` | `Array` | 配置能够使用的外部工具 |
| `rag` |   `Map` | 配置外部的知识源 |
| `memory` |  `Bool` | 是否使用记忆，即保存 Agent 的多次问答记录（目前记忆仅支持 in-memory 非持久化数据）；默认为 `false` |
| `executor` | `String` | 规划模式；默认为 `react` |
| `temperature` | `Float` | Agent 使用 LLM 时的 temperature 值；默认为 `0.5` |
| `enableToolFilter` | `Bool` | 启用工具过滤功能，Agent 在执行前会自动根据输入问题选择合适的工具集合；默认 `false` |
| `dump` | `Bool` | 调试代码用，是否打印 Agent 变换后的 AST；默认为 `false` |

## 编写提示词

每个 Agent 的核心是系统提示词，它定义了 Agent 的角色信息和执行步骤，使得大语言模型（LLM）能够更准确和快速地回答问题。在 Agent 定义中，`@prompt` 用于编写 Agent 的系统提示词。

- 在 `@prompt` 宏的作用域下，所有字符串字面量（包括插值字符串）会被依次拼接为完整的系统提示词。
- 在 `@prompt` 中能够访问仓颉语言的函数和成员变量。
- 每个 Agent 最多有一个 `@prompt` 定义。

**示例：字符串拼接**
以下代码将三个字符串依次拼接作为完整的 Agent 系统提示词，并且第三个插值字符串中调用了函数 `bar`。

```cangjie
@agent
class Foo {
    @prompt(
        "# This is a Foo agent"
        "## Description"
        "balabala ${bar()}"
    )
}
```

**示例：访问成员变量**

```cangjie
@agent
class Calculator {
    @prompt(
        """
        你是一个计算器，能够进行计算。
        你的名字是 ${name}-${version}。
        """
        "例如，你可以加法运算，1 + 2 = 3 ..."
    )
    private let name: String
    private let version: Int64
    ...
}

let calculator = Calculator(name: "aha", version: 1)
```

宏 `@prompt` 支持设置 `include` 属性，属性值为字符串。该字符串是一个文件路径，表示将文件内容作为 Agent 系统提示词。
- 当配置 `include` 属性后，`@prompt` 中编写的字面量将失效，不再作为系统提示词
- 若 `include` 指向的文件不存在，将抛出异常

**示例：使用外部文件编写系统提示词**

```cangjie
@agent
class Foo {
    @prompt[include: "./a.md"]()
}
```

### 使用提示词模式

良好的结构化提示词能够显著提升 LLM 的性能。通过定义统一的提示词语法，可以帮助开发者编写更加结构化的提示词。

**使用提示词模式**

宏 `@prompt`  支持设置 `pattern` 属性，其值应为提示词模式类型。使用提示词模式时，`@prompt` 作用域内必须编写满足模式的*提示词元素*而不是字符串字面量。

注意：`include` 属性和 `pattern` 属性无法同时使用；若两者同时出现将抛出异常。

**示例：使用提示词模式**

```cangjie
@agent
class Foo {
    @prompt[pattern: APE] (
        action: "帮助用户制定旅行路线",
        purpose: "让用户在计划的时间内尽可能多地参观景点并得到充分休息",
        expectation: "生成一条合理的旅行路线，包括时间、景点、通勤等信息"
    )
}
```

以下是目前已提供的提示词模式。

<table>
    <tr>
        <th>提示词模式</th>
        <th>说明</th>
    </tr>

<tr>
<td>

`APE`

</td>
<td>

`action`: 定义要完成的工作或活动
`purpose`: 定义为什么要开始这个行动
`expectation`: 陈述预期结果

</td>
</tr>
<tr>
<td>

`BROKE`

</td>
<td>

`background`: 描述背景并提供足够的信息
`role`: 指定代理的角色
`objectives`: 定义要实现的任务目标
`keyResult`: 定义关键的、可衡量的结果，以指导代理如何评估目标的实现情况
`evolve`: 通过实验和调整来测试结果，并在需要时进行优化

</td>
</tr>
<tr>
<td>

`COAST`

</td>
<td>

`context`: 为对话设定背景
`objective`: 描述目标
`action`: 解释所需的行动
`scenario`: 描述情景
`task`: 描述任务

</td>
</tr>
<tr>
<td>

`TAG`

</td>
<td>

`task`: 定义具体的任务
`action`: 描述需要做什么
`goal`: 解释最终目标

</td>
</tr>
<tr>
<td>

`RISE`

</td>
<td>

`role`: 指定代理的角色
`input`: 描述信息或资源
`steps`: 要求提供详细步骤
`expectation`: 描述期望的结果

</td>
</tr>
<tr>
<td>

`TRACE`

</td>
<td>

`task`: 定义具体的任务
`request`: 描述你的请求
`action`: 解释你需要的行动
`context`: 提供背景或情境
`example`: 给出一个示例以说明你的观点

</td>
</tr>
<tr>
<td>

`ERA`

</td>
<td>

`expectation`: 描述期望的结果
`role`: 指定代理的角色
`action`: 指定要采取的行动

</td>
</tr>
<tr>
<td>

`CARE`

</td>
<td>

`context`: 为讨论设定背景或情境
`action`: 描述你想做什么
`result`: 描述期望的结果
`example`: 给出一个示例以说明你的观点

</td>
</tr>
<tr>
<td>

`ROSES`

</td>
<td>

`role`: 指定代理的角色
`objective`: 陈述目标或目的
`scenario`: 描述情境
`expectation`: 定义期望的结果
`steps`: 达到解决方案所需的步骤

</td>
</tr>
<tr>
<td>

`ICIO`

</td>
<td>

`instruction`: 具体的任务指示给 AI
`context`: 提供更多背景信息给 AI
`input`: 告知模型需要处理的数据
`output`: 告知我们期望的输出类型或样式

</td>
</tr>
<tr>
<td>

`CRISPE`

</td>
<td>

`capacityAndRole`: 代理应扮演的角色
`insight`: 提供见解、背景和情境
`statement`: 你要求代理做什么
`personality`: 你希望代理以什么风格、个性或方式响应
`experiment`: 请求代理提供多个示例进行响应

</td>
</tr>
<tr>
<td>

`RACE`

</td>
<td>

`role`: 指定代理的角色
`action`: 详细说明要采取的行动
`context`: 提供相关情境的详细信息
`expectation`: 描述期望的结果

</td>
</tr>
<tr>
<td>

`SAGE`

</td>
<td>

`situation`: 描述执行任务的背景或环境
`action`: 具体指定需要采取的操作或步骤
`goal`: 说明任务完成后应达到的目的或效果
`expectation`: 具体说明对输出结果的要求

</td>
</tr>

</table>

### 自定义提示词模式

宏 `@promptPattern` 作用于 `class` 类型，可定义新的提示词模式。在被修饰的类定义中，宏 `@element` 用于修饰成员变量，可定义提示词元素。
- 每个元素必须是 `String` 类型，
- `description` 属性用于解释元素，不会影响最终提示词。

提示词模式类型必须实现 `toString` 方法，该方法用于构建提示词。

**示例：自定义提示词模式**

```cangjie
@promptPattern
class APE {
    @element[description: "定义任务"]
    let action: String

    @element[description: "定义任务原因"]
    let purpose: String

    @element[description: "清晰地定义期望结果"]
    let expectation: String

    public func toString(): String {
        return "...${action}...${purpose}...${expectation}..."
    }
}
```

## Agent 交互方法

由 `@agent` 定义的 Agent 都有一个默认方法 `func chat(question: ToString): String` 作为交互入口。

```cangjie
@agent class Foo { ... }

let agent = Foo()
let result = agent.chat("What's the weather today?")
println(result)
```

此外，通过 `chatGet` 能够让 Agent 能够直接返回一个数据类型而不仅仅是字符串。如果 Agent 未能生成满足要求的数据类型，则返回 `None`。方法定义如下：

```cangjie
func chatGet<T>(question: String): Option<T> where T <: Jsonable<T>
```

其中，`Jsonable` 接口 ([见章节](#jsonable-接口))约束了数据类型能够和 JSON 对象进行转换。基础类型 `Int/Int64/String` 均已实现该接口。

宏 `@jsonable` 用于自定义类型来自动实现该接口：

- `@jsonable` 用于修饰 `class` 类型，它通过代码转换的方式让所修饰的类型自动实现 `Jsonable` 接口
- 所修饰的类型中，可以使用 `@field` 添加对于成员变量的描述信息。如果不使用，成员变量将不携带描述信息

**示例：返回数据结构**

```cangjie
@jsonable
class MyDate {
    @field["Year of the foundation"]
    let year: Int64
    let month: Int64
}

@agent
class Foo { }

let agent = Foo()
let date = agent.chatGet<MyDate>("华为创建时间")
println(date.year)
println(date.month)
```

### 输入模板

`@agent` 定义 Agent 类型时，可以提供*输入模板*，即将输入问题模板化，模板中可编写*占位符变量*。在调用交互接口时仅提供占位符变量的取值。
宏 `@user` 用于定义输入模板：
- `@user` 和 `@prompt` 类似，它会依次将所有字符串字面量拼接作为完整的输入模板
- 在输入模板中的 `{variable}` 是占位符变量，其中变量名由大小写字母、数字和下划线组成
- 同 `@prompt` 一样，`@user` 支持 `include` 属性，并且属性值为文件路径；若设置该属性，文件内容将作为输入模板

在调用 `func chat(variables: Array<(String, ToString)>): String` 方法时，需要传入占位符变量和对应的值。
- 若 Agent 未提供输入模板，调用该方法将抛出 `UnsupportedException` 异常

**示例：使用输入模板**

```cangjie
@agent
class Foo {
    @prompt(
        "System: ..."
    )
    @user(
        "矩形的长为：{length} cm，宽为 {width} cm"
        "计算矩形的面积"
    )
}
let agent = Foo()
let area = agent.chat(
    ("length", 3),
    ("width", 4),
)
```

### 对话历史

和 Agent 的一次 `chat` 调用能构成 `ChatRound`，`Conversation` 维护多个对话过程，从而形成连续对轮的对话历史。

在调用 Agent 时，可以将 `Conversation` 作为 `AgentRequest` 的参数来让 Agent 基于对话完成作答。同时，通过 `AgentResponse` 的 `execution.chatRound` 属性来更新对话历史。

**示例：对话历史示例**

```cangjie
let agent = FooAgent()
let conversation = Conversation()
let resp = agent.chat(
    AgentRequest("Hello", conversation: conversation)
)
// 更新对话
conversation.addChatRound(resp.execution.chatRound)
let resp2 = agent.chat(
    AgentRequest("How are you", conversation: conversation)
)
```

## MCP 协议和工具

工具可以理解为 Agent 执行过程中能够执行的代码。当前 Agent 工具有两个来源：
- 使用 DSL 直接编写的工具函数
- 由 MCP 服务器提供的工具（MCP 服务器可视为*一组工具的集合*）

### 工具函数编写

宏 `@tool` 用于函数，将函数转换为**工具函数**，可被修饰的函数有：

- 全局函数
- `@agent` 定义的 Agent 类成员方法
- `@toolset` 定义的 `Toolset` 类型的成员方法

所有工具函数都有如下的属性：

- `description` 属性描述了工具的功能【必选】
- `parameters` 属性描述了函数参数的含义，它接收 `<parameter-name>: <parameter-description>` 的键值对【可选】
- `filterable` 是否可以被 Agent 过滤，配合 `@agent` 宏的 `enableToolFilter` 属性使用【可选】
- `terminal` 是否终止 Agent 执行，当设置为 `true` 时，Agent 执行这个工具后将直接结束，并且函数的返回值作为 Agent 执行结果【可选】
- `compactable`: 是否（使用 LLM）将工具的执行结果做总结压缩，仅当该属性设置为 `true` 且结果长度超过 `Config.resultSummarizeThreshold` 进行压缩【可选】

如果工具函数是全局函数或是在 Toolset 中，那么需要在 `tools` 属性中显式指定才能让 Agent 使用工具。

**示例：定义并配置全局工具**

```cangjie
@tool[description: "...",
      parameters: { arg: "..."}]
func foo(arg: String): String { ... }

@agent[
    tools: [foo]
]
class A { ... }
```

**示例：定义工具集类型并配置**

```cangjie
@toolset
class FooToolset {
    @tool[description: "..."]
    func foo(arg: String): String { ... }

    @tool[description: "..."]
    func bar(): String { ... }
}

@agent[
    tools: [FooToolset()]
]
class A { ... }
```

**示例：定义内部工具**

```cangjie
@agent
class A {
    @tool[description: "...",
          parameters: { str: "..." }]
    func bar(str: String): String { ... }
}
```

对于工具函数存在的限制：
- 当前工具函数的形参类型满足 `Jsonable` 接口
- 工具函数的返回值必须满足 `ToString` 接口，该接口方法的返回值将作为工具调用的返回值

### 使用工具和 MCP 服务器

Agent 通过 `tools` 属性配置使用的 MCP 服务器以及自定义工具函数。该属性接收多个 MCP 服务器/工具函数，每个配置可采用如下的语法：

- `stdio` 传输协议的 MCP 服务器，`stdioMCP(<command>, <env-kv-pair>*)`，编写启动 MCP 服务器的命令行以及可选的环境变量设置。例如，`stdioMCP("command and arguments", ENV_1: "value1", ENV_2, "value2")`。
- `sse` 传输协议的 MCP 服务器，`sseMCP(<url>)`，编写 MCP 服务器的地址。例如， `httpMCP("https://abc.com/mcp")`。
- `http` 传输协议的 MCP 服务器，`httpMCP(<url>, <headers-kv-pair>*)`，编写 MCP 服务器的地址。例如， `httpMCP("https://abc.com/mcp", API_KEY: "your key")`。
- 工具函数 `<func-id>+`，例如，`foo, bar`。注意 ⚠️：如果工具被定义在 Agent 类的内部，那么它能被其所属的 Agent 直接使用，即**无需**在 `tools` 属性中显式指定。
- 工具集构造 `<expr>`，通常是工具集类型的实例化，例如 `MyToolset()`。

```cangjie
@agent[
    tools: [
        stdioMCP("node index.js args" ),
        stdioMCP("python main.py args", SOME_API_KEY: "xxx"),
        httpMCP("http://abc.mcp.server.com"),
        toolA,
        toolB,
        SomeToolset()
    ]
]
class Foo { ... }
```

我们也可以直接通过 API 方式给 Agent 配置 MCP 工具。

```cangjie
// 初始化 MCP client
let client = MCPClient("node", ["args"])
let agent = SomeAgent()
// 添加 MCP 工具
agent.toolManager.addTools(client.getTools())
```

⚠️注意：目前 MCP 服务器仅支持工具相关的 MCP 协议。

此外，在 `tools` 配置中**同样支持以 JSON 配置的语法设置 MCP 服务器**：

- `stdio` 传输，配置方式为：由 `command`（启动命令）和 `args`（启动参数）构成，并可选设置启动的环境变量  `env`。
- `sse` 传输，配置方式为：通过 `url` 指定 MCP 服务器的地址

```cangjie
@agent[
    tools: [
        { command: "node", args: [ "index.js", "args" ] },
        { command: "python", args: [ "main.py", "args" ], env: { SOME_API_KEY: "xxx" } },
        { url: "http://abc.mcp.server.com" }
    ]
]
class Foo { ... }
```

### 工具额外属性设置

所有工具都允许通过特殊成员变量 `extra: HashMap<String, String>` 来保存额外的属性值。当前有两个特殊属性值：

- `filterable: "true" | "false"` 是否可以被 Agent 过滤，配合 `agent.toolManager.enableFilter` 设置使用
- `terminal: "true" | "false"` 是否终止 Agent 执行，当设置为 `true` 时，Agent 执行这个工具后将直接结束，并且函数的返回值作为 Agent 执行结果

**示例：设置工具额外属性**

```cangjie
let tool: Tool = getSomeTool()
tool.extra["filterable"] = "false"
tool.extra["terminal"] = "true"
```

## 规划

每个 Agent 有一个 `executor` 属性，用于指定使用哪个执行器（不同执行器使用不同的规划策略）。目前支持如下执行器：

| 规划名称  | 说明  |
|---|---|
| `naive`  | 直接问答  |
| `react` | Agent 每次选择使用一个工具完成一个求解步骤，然后根据工具的执行结果判断是否执行完成，不断迭代上述过程直至任务求解完成 |
| `plan-react` | 首先完成一次任务规划，然后对每个规划出来的子任务使用 React 模式进行求解 |
| `tool-loop` | 功能接近 `react`，但没有显式的思考过程 |

其中，`react` 和 `tool-loop` 执行器可以通过形式 `react:<number>` 类指定迭代的最大次数，如 `react:5`。

**示例：配置规划方法**

```cangjie
@agent[executor: "naive"]
class Foo{ }

@agent[executor: "react"]
class Bar{ }
```

### Agent 执行 DSL（实验）

除了直接使用 Magic 预先提供的规划方法外，还可以使用规划 DSL 去更细粒度地控制 Agent 执行过程。

**Agent Execution DSL 定义**：一种用于定义 LLM Agent 执行流程的“编程语言”，通过组合操作实现复杂策略

- **避免重复代码**：避免手写冗余模板代码
- **灵活定制**：能够轻易编写复杂的规划策略

**基本规则**

- 规划 DSL 在 `@agent` 内部 `@execution` 中使用；当使用规划 DSL 后，将忽略 `executor` 属性的配置。
- 管道符 `|>` 串联多个规划操作
- Agent 执行状态是*一个 Prompt 序列*
  - 每次令 LLM 执行完一个操作后，操作结果将添加到这个 Prompt 序列中

**使用示例**

```swift
@agent class Foo {
  @execution(
    plan |> loop(think |> action) |> answer
  )
}
```

流程图示

```
             plan         -> think         -> action ->       think -> ... -> answer
| SysPrompt | -> | SysPrompt | -> | SysPrompt |        | SysPrompt |
                 | Plan: ... |    | Plan: ... |        | Plan: ... |
                                  | Think: ... |       | Think: ... |
                                                       | Action: ... |
                                                       | Result: ... |
```

规划操作是从已有的规划方法中提取而来，将规划中常用的逻辑抽象为可组合的操作，包括三类：*基础操作*、*任务分解操作*、*条件控制操作*。

**基础操作速览**

| 操作符      | 作用             |   约束  |
|-------------|----------------|---------|
| `think`     | 生成推理步骤     | 可以出现在流程的任何位置，无前置/后置操作约束 |
| `action`    | 选择并执行工具   | 可以出现在流程的任何位置，无前置/后置操作约束 |
| `answer`    | 返回最终答案     | 可以出现在流程的任何位置，无前置操作约束，后面不能跟任何操作 |
| `plan`      | 制定计划     | 可以出现在流程的任何位置，无前置/后置操作约束 |
| `loop`      | 循环内部操作序列 | 可以出现在流程的任何位置，无前置/后置操作约束 |
| `tool`      | 依次执行工具函数序列，工具的参数由 LLM 自动生成 | 可以出现在流程的任何位置，无前置/后置操作约束 |
| `done`      | 检查是否终止    | 可以出现在流程的任何位置，无前置操作约束，后面不能跟任何操作 |

**复杂操作：任务分解&合并**

```swift
@agent class ResearchAssistant {
  @execution(
    divide |> each(tool(web_search)) |> summary |> answer
  )
  @tool
  func web_search(...) { ... }
}
```

| 操作符      | 作用             |   约束  |
|-------------|----------------|---------|
| `divide` | 由 LLM 拆分任务为子问题，子问题数由 LLM 自动决定 | 可以出现在流程的任何位置，无前置操作约束，后面必须是 `each` 操作 |
| `each` | 处理子任务 | 前置操作必须为 `divide`，后置操作必须为 `summary` |
| `summary` | 汇总子任务结果 | 前置操作必须为 `each`，无后置操作约束 |

**复杂操作：条件控制**

```swift
@agent class Assistant {
  @execution(
    switch(
      onCase("问题是询问天气？", tool(weather_api)),
      onCase("问题是关于订单查询？", tool(db_query |> db_summary)),
      otherwise(think |> answer)
    )
  )
}
```

- `switch` 接受多个 `onCase` 子句，无前置/后置操作约束
- 每个 `onCase` 子句由一个条件（自然语言表示）和操作序列组成
    - 当 `onCase` 中条件成立（根据当前执行状态），对应的操作序列继续执行
    - `onCase` 子句由上往下依次执行
- 若没有 `onCase` 成立，则执行 `otherwise` 子句
- 若存在多个 `otherwise` 子句，则只有第一个会被执行

## 外部知识

除了系统提示词，外部知识也可以增强 Agent 的解决问题的能力。 Agent 能够从各类知识源中提取必要和有用的信息。

目前，Agent 的 `rag` 属性表明外部知识的数据源，它接受多个数据源配置，每个数据源包含如下的键值对：

| 属性  | 属性值 | 说明 |
|---|---|---|
| `source`  | `String \| Expr`  | 数据源 |
| `mode`  | `String`  | 使用模式，支持 `"static"` 和 `"dynamic"` 两种；默认为 `"static"` |
| `description`  | `String`  | 可进一步描述数据源，帮助 Agent 更加精准地获取数据 |

属性 `source` 表明数据的实际来源，支持两种类型：
- 合法路径指向*预置的文件类型*
    - 当前支持的文件类型包括 markdown, Sqlite 数据库
- 类型为 `Retriever` 的表达式

```cangjie
@agent[
  rag: { source: "path/to/some.md", mode: "dynamic" }
]
class Foo { }
```

⚠️注意：使用 Sqlite 数据库的功能需要配置 `cfg.toml` 中 `sqlite = "enable"`，且由于数据库使用了 Sqlite，所以需要安装三方依赖。详见 [third_party_libs.md](./third_party_libs.md)

## 示例

### 示例 1: 命令行助手 Agent

```cangjie
@agent[executor: "react"]
class CJCAgent {
    @prompt(
        """
        你是一个 CJC 命令行助理。
        你帮助用户根据他们的问题生成命令行。
        """
    )

    @tool[description: "获取 CJC 的使用手册"]
    private func getManual(): String {
        let subProcess: SubProcess = Process.start(
            "cjc", ["--help"], stdOut: ProcessRedirect.Pipe
        )
        let strReader: StringReader<InputStream> = StringReader(subProcess.stdOut)
        let result = strReader.readToEnd().trimAscii()
        return result
    }
}

let agent = CJCAgent()
let result = agent.chat("编译一个文件到 ARM 平台")
```

## 多 Agent 协作

多 Agent 可以被组织为组以进行高效协作。这些协作通常分为三类：

1. **线性协同**： Agent 按顺序操作，每个 Agent 接收前一个 Agent 的消息（包括结果和任务），进行处理，然后将结果传递给下一个 Agent 。
2. **主从协同**：一个 Agent 作为领导者，负责监督其他 Agent 的活动，其他 Agent 需向领导者报告。
3. **自由协同**：所有 Agent 作为一个平等的协作单元，进行组内讨论，每个 Agent 可以看见所有消息。

`AgentGroup` 接口用于抽象所有这些协作方式（详见 API 手册）。

### 线性协同

管道表达式 `|>` 用于将多个 Agent 组成为 `LinearGroup`。

```cangjie
let linearGroup: LinearGroup = ag1 |> ag2 |> ag3
```

### 主从协同

使用 `<=` 操作符将多个 Agent 组成 `LeaderGroup`，操作符前的 Agent 作为领导者，后面的值作为下属 Agent 的数组。

```cangjie
let leaderGroup: LeaderGroup = ag1 <= [ag2, ag3]
```

### 自由协同

使用 `|` 操作符将多个 Agent 组成 `FreeGroup`。

```cangjie
let freeGroup: FreeGroup = ag1 | ag2 | ag3
```

`FreeGroup` 还提供更为灵活的 `discuss` 方法。

```cangjie
public enum FreeGroupMode {
    | Auto // The speaker will be selected by LLM automatically
    | RoundRobin
}
class FreeGroup {
    public func discuss(topic!: String, initiator!: String, speech!: String,
                        mode!: FreeGroupMode = FreeGroupMode.Auto): String
    ...
}
```

`discuss` 方法能够指定：

- `topic` 讨论的主题（即需要解决的问题）
- `initiator` 第一个发言的 Agent
- `speech` 第一个发言 Agent 的内容
- `mode` 讨论模式，依次自动选择 Agent 发言或是按照轮询的方式

以下代码实现两个 Agent 进行猜数字游戏，参考 [AutoGen](https://github.com/microsoft/autogen/blob/main/website/docs/tutorial/human-in-the-loop.ipynb)。

```cangjie
@agent class AgentWithNumber {
    @prompt(
        "You are playing a game of guess-my-number. You have the "
        "number 33 in your mind, and I will try to guess it. "
        "If I guess too high, say 'too high', if I guess too low, say 'too low'."
    )
}

@agent class AgentGuessNumber {
    @prompt(
        "I have a number in my mind, and you will try to guess it. "
        "If I say 'too high', you should guess a lower number. If I say 'too low', "
        "you should guess a higher number. "
    )
}

func game() {
    let group = AgentWithNumber() | AgentGuessNumber()
    group.discuss(topic: "Number guessing game",
                  initiator: "AgentWithNumber",
                  speech: "I have a number between 1 and 70. Guess it!",
                  mode: FreeGroupMode.RoundRobin)
}
```

### Agent 协同子组构建

在构建线性协同时，不仅 Agent 能够参与，AgentGroup 同样能够直接参与构造。例如，

```cangjie
ag1 |> (ag2 <= [ag3]) |> ag4
```

上述代码构建了一个线性协同组，但同时第二个单元是一个主从协同组。此时，该主从协同组即为线性协同的**子组**。

然而，在构建主从协同和自由协同时无法直接将 `AgentGroup` 纳入构建；此时需要使用函数 `func subGroup(g: AgentGroup, description!: String): Agent` 将一个 Agent 协同组转换成可参与构建 Agent 协同组的子组对象。

```cangjie
ag1 | (ag2 <= [ag3]) | ag4 // Compilation error
ag1 | subGroup(ag2 <= [ag3], description: "An subgroup attempts to ...") | ag4 // Okay
```

## 快捷 AI 函数

`@ai` 可用于修饰函数，表明函数的执行将由 LLM 执行完成。`@ai` 修饰的函数必须是 `foreign` 函数，这相当于该函数的实现在模型侧，对当前代码而言是一个外部函数。要求：**函数的形参类型和返回值类型必须满足 `Jsonable` 接口**。并且，`@ai` 允许属性：

| 属性名 | 值类型 | 说明 |
|-------|-------|-------|
| `prompt` | `String` | AI 函数的额外知道 |
| `model` | `String` | 配置使用到的 LLM 模型服务；默认使用 gpt-4o |
| `tools` | `Array` | 配置能够使用的外部工具 |
| `temperature` | `Float` | Agent 使用 LLM 时的 temperature 值；默认为 `0.5` |
| `dump` | `Bool` | 调试代码用，是否打印 Agent 变换后的 AST；默认为 `false` |

**示例**：

```cangjie
@tool[description: "Fetches the html content of a URL."]
func fetch(url: String): String { ... }

@ai[
    prompt: "不超过 3 个关键字",
    tools: [fetch]
]
foreign func keywordsOf(url: String): Array<String>

main() { keywordsOf("https://cangjie-lang.cn/") }
```

## Agent Human-in-the-Loop

[Human-in-the-Loop (HITL) Tutorial](./hitl.md)

## 模型配置

模型配置使用格式 `<provider>:<model>`，当前支持如下的模型服务商。

| 服务商名称  | 示例  | 配置说明 | 服务 URL 配置 |
|---|---|---|---|
| 阿里云 | `dashscope:qwen-plus` | `DASHSCOPE_API_KEY` | `DASHSCOPE_BASE_URL`，默认 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| DeepSeek | `deepseek:deepseek-chat` | `DEEPSEEK_API_KEY` | `DEEPSEEK_BASE_URL`，默认 `https://api.deepseek.com` |
|  火山方舟 | `ark:doubao-lite-4k` | `ARK_API_KEY` | `ARK_BASE_URL`，默认 `https://ark.cn-beijing.volces.com/api/v3` |
| Llama.cpp | `llamacpp` | 无需配置模型名称和 API Key | `LLAMACPP_BASE_URl`，默认 `http://localhost:8080` |
| Ollama | `ollama:phi-3` | 无需配置 API Key | `OLLAMA_BASE_URl`，默认 `http://localhost:11434` |
| OpenAI  | `openai:gpt-4o` | `OPENAI_API_KEY` | `OPENAI_BASE_URL`，默认 `https://api.openai.com/v1` |
| SiliconFlow | `siliconflow:deepseek-ai/DeepSeek-V3` | `SILICONFLOW_API_KEY` | `SILICONFLOW_BASE_URL`，默认 `https://api.siliconflow.cn/v1` |
| 智谱 AI | `zhipuai:glm-4` | `ZHIPUAI_API_KEY` | `ZHIPUAI_BASE_URL`，默认 `https://open.bigmodel.cn/api/paas/v4` |
| Google | `google:gemini-2.0-flash` | `GOOGLE_API_KEY` | `GOOGLE_BASE_URL`，默认 `https://generativelanguage.googleapis.com/v1beta/openai` |
| 月之暗面 | `moonshot:kimi-k2-0711-preview` | `MOONSHOT_API_KEY` | `MOONSHOT_BASE_URL`，默认 `https://api.moonshot.cn/v1` |
| OpenRouter | `openrouter:qwen/qwen3-coder:free` | `OPENROUTER_API_KEY` | `OPENROUTER_BASE_URL`，默认 `https://openrouter.ai/api/v1` |

模型配置不仅可以在 `@agent` 的 `model` 属性中使用，还可以直接通过 `ModelManager` 的静态成员方法来直接构造模型实例：`static func createChatModel(modelName: String): ChatModel`。

**模型支持列表**

|   | Chat | Embedding | Image |
|---|---|---|---|
| 阿里云 | ✔️ | ✔️ | ❌ |
| DeepSeek | ✔️ | ❌️ | ❌ |
| 火山方舟 | ✔️ | ✔️ | ❌ |
| Llama.cpp | ✔️ | ❌  | ❌ |
| Ollama | ✔️ | ✔️ | ❌ |
| OpenAI | ✔️ | ✔️ | ✔️ |
| SiliconFlow | ✔️ | ✔️ | ✔️ |
| 智谱 AI | ✔️ | ❌ | ❌ |
| Google | ✔️ | ❌ | ❌ |
| 月之暗面 | ✔️ | ❌ | ❌ |
| OpenRouter | ✔️ | ❌ | ❌ |

如果需要接入新的模型，可参考直接使用 API 设置（见下文）。

## 常用 API 介绍

本节中介绍的 API 可能不完全，详见 [API Reference](./api_reference.md)。

### 全局配置

类 `magic.config.Config` 提供如下的全局配置，所有的配置变量都可读写。

| 配置名称  | 类型 | 说明  | 默认值 |
|---|---|---|---|
|  `logLevel` | `LogLevel` |  日志级别  | `LogLevel.ERROR` |
| `logFile` | `String` | 日志文件路径 | `stdout` |
| `enableAgentLog` | `Bool` | 是否保存每个 Agent 单独日志  | `false` |
| `agentLogDir` | `String` | 每个 Agent 单独日志的存放目录 | `./logs/agent-logs` |
| `saveModelRequest` | `Bool` | 是否保存每个模型请求 | `false` |
| `modelRequestDir` | `String` | 模型请求存放目录 | `./logs/model-requests` |
| `defaultChatModel` | `Option<ChatModel>` | 默认的大语言模型 | `None` |
| `defaultEmbeddingModel` | `Option<EmbeddingModel>` | 默认的向量模型 | `None` |
| `externalScriptDir` | `String` | 保存外部脚本的目录 | `./external_scripts` |
| `defaultContextLen` | `Int` | LLM上下文长度 | `32000` |
| `defaultTokenizer` | `Option<Tokenizer>` | 设置默认的 tokenizer，用于计算提示词中的 token 数 | `UnicodeTokenizer()` |
| `enableFunctionCall` | `Bool` | 是否在 Agent 执行器中使用 LLM function call 能力（当前仅 `tool-loop/dsl` 两个执行器 | `false` |
| `maxReactNumber` | `Int` | React 模式的最大迭代次数 | `10` |
| `modelRetryNumber` | `Int` | 模型请求失败时的最大重试次数 | `3` |
| `env` | `HashMap<String,String>` | 设置环境变量 | - |

### Agent 类型

所有被 `@agent` 定义的类型都自动实现 `interface Agent`，具有如下的 API。这些 API 的用途是访问 Agent 的属性。

```cangjie
public interface Agent {
    /**
     * Name of the agent
     */
    prop name: String

    /**
     * Functionality description of the agent
     */
    prop description: String

    /**
     * Temerature the agent will pass to the LLM
     */
    mut prop temperature: Option<Float64>

    /**
     * System prompt of the agent
     */
    mut prop systemPrompt: String

    /**
     * Tools the agent can use
     */
    prop toolManager: ToolManager

    /**
     * Chat model the agent will use
     */
    mut prop model: Option<ChatModel>

    /**
     * The underlying agent executor
     */
    mut prop executor: AgentExecutor

    /**
     * Retreiver the agent can use
     */
    mut prop retriever: Option<Retriever>

    /**
     * Memory the agent will use
     */
    prop memory: Option<Memory>

    /**
     * Personal data the agent will use
     */
    prop personal: Option<Personal>

    /**
     * Set the agent interceptor
     */
    mut prop interceptor: Option<Interceptor>

    /**
     * Query the agent and get the answer
     */
    func chat(request: AgentRequest): String
}
```

其中 `func chat(request: AgentRequest): String` 方法是消息处理接口。
注意到，[章节](#agent-交互方法)中介绍的交互方法 `func chat(question: String): String` 是基于这一接口方法的封装。其中，

```cangjie
class AgentRequest {
    // The current user question
    public let question: String
    ...
}
```

### Agent 劫持机制

`Agent` 拥有可变属性 `mut prop interceptor: Interceptor` 可用于设置消息处理劫持 Agent。

```cangjie
enum InterceptorMode {
    | Always
    | Periodic(Int64)
    | Conditional((Request) -> Bool)
}

class Interceptor {
    public init(interceptorAgent: Agent, mode!: InterceptorMode = InterceptorMode.Always)
}
```

当设置劫持 Agent 后，每当 Agent 接收到消息（以 `Request` 类型表示）时，如果劫持条件成立，那么该消息将交由劫持 Agent 来处理，而不是原本 Agent 进行处理。有三种劫持模式判别条件是否成立：

- `Always` 永远劫持
- `Periodic` 周期性地劫持，即原本 Agent 每处理指定数量的消息后，下一条消息将被劫持
- `Conditional` 使用判别函数进行判断，如果函数返回 `true`，则劫持消息

```cangjie
let ag1 = Foo()
let ag2 = Bar()
ag1.interceptor = Interceptor(ag2, mode: InterceoptorMode.Periodic(2))

ag1.chat("msg 1")
ag1.chat("msg 2")
ag1.chat("msg 3") // ag2 will handle with this request message
```

### 内置 Agent

除了通过 `@agent` 定义 Agent 之外，当前框架内置如下的几种 Agent。

#### `BaseAgent`

`BaseAgent` 用于通过 API 调用的方式构造 Agent。

```cangjie
class BaseAgent <: Agent {
    public init(
        name!:         String                = "Base Agent",
        description!:  String                = "",
        temperature!:  Option<Float64>       = None,
        systemPrompt!: String                = "",
        toolManager!:  ToolManager           = SimpleToolManager(),
        model!:        Option<ChatModel>     = None,
        executor!:     Option<AgentExecutor> = None,
        retriever!:    Option<Retriever>     = None,
        memory!:       Option<Memory>        = None,
        interceptor!:  Option<Interceptor>   = None
    )
}
```

**示例：通过 `BaseAgent` 构造 Agent**

```cangjie
let agent= BaseAgent()
agent.systemPrompt = "New system prompt ..."
agent.model = ModelManager.createChatModel("ollama:phi3")
agent.toolManager.addTool(fooTool)
```

#### `DispatchAgent`

`DispatchAgent` 专用于在主从协同模式下完成任务分发

```cangjie
class DispatchAgent {
    public init(model!: String)
}
```

**示例**

```cangjie
let group = DiapatchAgent(model: "deepseek:deepseek-chat") <=[
    FooAgent(),
    BarAgent(),
    ...
]
```

#### `ToolAgent`

`ToolAgent` 不再使用大语言模型回复问题，而是直接执行提供的函数来产生回复。

```cangjie
class ToolAgent<T> where T <: Jsonable<T> {
    public init(fn!: (String) -> T)
}
```

使用该 Agent 配合线性协同，可完成类似 Langchain 的编排功能。

```cangjie
let group = FooAgent() |> ToolAgent(fn: { q: String => ...; }) |> BarAgent()
```

#### `HumanAgent`

`HumanAgent` 用户将用户作为 Agent 参与到 Agent 协同中。可将其视作特殊的 `ToolAgent`。

```cangjie
class HumanAgent {
    public init(qaFunc!: Option<(String) -> String> = None)
}
```

其中参数 `qaFunc` 可自定义，默认实现为将用户问题打之终端并接收用户输入作为回复。

```cangjie
let humanAgent = HumanAgent(qaFunc: { q: String => println(q); return "answer" })
let result = humanAgent.chat("question")
```

### Jsonable 接口

`Jsonable` 接口约束了类型能够和 JSON 数据进行互相转换。宏 `@jsonable` 能够为修饰的 `class/struct/enum` 类型自动实现该接口。

```cangjie
public interface Jsonable<T> {
    /**
     * Get the type schema of T
     */
    static func getTypeSchema(): TypeSchema

    /**
     * Deserialize from a Json string
     */
    static func fromJsonValue(json: JsonValue): T

    /**
     * Serialize to a Json string
     */
    func toJsonValue(): JsonValue
}
```

### 接入新模型

新模型可实现接口 `interface ChatModel`，然后通过 `agent.model` 属性进行设置。

模型相关类型在 `magic.core.model` 包中。

```cangjie
interface ChatModel <: Model {
    func create(req: ChatRequest): ChatResponse
    func asyncCreate(req: ChatRequest): AsyncChatResponse
}
```

使用到的消息类型在 `magic.core.message` 中。

```cangjie
public class ChatMessage <: ToString {
    public let name: String          // name of the sender
    public let role: ChatMessageRole // role of the sender
    public let content: String       // Content of the message
}
```

**示例：自定义对话模型**

```cangjie
@agent
class Foo { }

class NewModel <: ChatModel {
    public func create(req: ChatRequest): ChatResponse { ... }
    public func asyncCreate(req: ChatRequest): AsyncChatResponse { ... }
}

let foo = Foo()
foo.model = NewModel()
```

在自定义模型之后，可为模型注册名称，从而在 `@agent` 属性中可以直接配置使用。注册函数为 `ModelManager` 的成员方法 `func registerChatModel(name: String, buildFn: () -> ChatModel)`。
⚠️注意：需要确保模型注册在调用 Agent 实例方法之前。

**示例：注册自定义模型**

```cangjie
@agent[model: "newModel"]
class Foo { }

main() {
    ModelManager.register("newModel", { => NewModel() })
    let agent = Foo()
}
```

### 自定义规划方法

当预置的 `naive` 和 `react` 两种规划方法不满足需求时，可通过接口 `interface AgentExecutor` 开发新的执行器，然后通过 `agent.executor` 属性进行设置。

该接口相关类型在 `magic.core.agent` 包中。

```cangjie
interface AgentExecutor {
    func run(agent: Agent, request: AgentRequest): AgentResponse

    func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse
}
```

**示例：自定义Agent执行器**

```cangjie
@agent
class Foo { }

class NewExecutor <: AgentExecutor {
    func run(agent: Agent, request: AgentRequest): AgentResponse { ... }

    func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse { ... }
}

let foo = Foo()
foo.executor = NewExecutor()
```

在自定义执行器后，可为其注册名称，从而在 `@agent` 属性中可以直接配置使用。注册函数为 `AgentExecutorManager` 的成员方法 `func registerAgentExecutor(name: String, buildFn: () -> AgentExecutor)`。
⚠️注意️ ：需要确保模型注册在调用 Agent 实例方法之前。

**示例：注册自定义执行器**

```cangjie
@agent[executor: "newExecutor"]
class Foo { }

main() {
    AgentExecutorManager.register("newExecutor", { => NewExecutor() })
    let agent = Foo()
}
```

### 语义检索功能

语义检索功能被划分为如下几个模块：

- 向量模型：为数据结构的语义信息（`String` 类型）构建语义向量 `vector`
- 向量数据库：构建向量索引，即维护 `vector -> index` 的映射关系；提供向量检索
- 索引映射表：维护索引到数据的映射关系，即 `index -> 数据`
- 语义数据结构，将上述模块封装，提供便捷的使用接口

除向量模型外，本节中所有类型都定义在 `vdb` 子包中。

#### 向量模型

向量被定义如下。

```cangjie
class Vector {
    public init(data: Array<Float32>)
}
```

可使用 `VectorBuilder` 构建向量。

```cangjie
public class VectorBuilder {
    public VectorBuilder(model!: EmbeddingModel)

    public func createEmbeddingVector(content: String): Vector
}
```

目前支持如下两种 embedding 模型服务，位于 `model.openai/ollama` 子包中。

```cangjie
class OpenAIEmbeddingModel <: EmbeddingModel {
    ...
}

class OllamaEmbeddingModel <: EmbeddingModel {
    ...
}
```

可利用 `ModelManager.createEmbeddingModel` 方法来方便地构造模型实例。

**示例：构建向量**

```cangjie
let model = ModelManager.createEmbeddingModel("openai:text-embedding-ada-002")
let vecBuilder = VectorBuilder(model: model)
let vector= vecBuilder.createEmbeddingVector("第一条向量")
```

#### 向量数据库

向量数据库抽象为如下的接口。

```cangjie
public interface VectorDatabase<Self> {
    /**
     * Add the vector to the database
     * ATTENTION: index must start from 0
     */
    func addVector(vector: Vector): Unit

    /**
     * Query the database and find indexes of similar data
     */
    func search(queryVec: Vector, number!: Int64): Array<Int64>

    /**
     * Save to the file
     */
    func save(filePath: String): Unit

    /**
     * Load from the file
     */
    static func load(filePath: String): Self
}
```

目前支持的是 `InMemoryVectorDatabase` 和 `FaissVectorDatabase` 两个。

```cangjie
class FaissVectorBase {
    public init(dimension: Int64)
}

class InMemoryVectorDatabase {
    public init()
}
```

注意：如果使用 faiss 向量数据库，需要配置 `cfg.toml` 中 `faiss = "enable"` 且需要安装三方依赖。详见 [third_party_libs.md](./third_party_libs.md)

#### 索引映射表

索引映射表用于维护 `index -> 数据` 关系，被抽象为如下接口。

```cangjie
public interface IndexMap<Self, T> where T <: ToString {
    /**
     * The index is determined by the order in which it was added.
     */
    func add(content: T): Unit

    func get(index: Int64): T

    func save(filePath: String): Unit

    static func load(filePath: String): Self
}
```

目前提供了如下两种索引映射表：

`SimpleIndexMap` 支持保存数据类型为 `String`，即维护 `index -> String` 的映射关系。在持久化时，它会直接将映射关系保存为 JSON 文件。
```cangjie
class SimpleIndexMap <: IndexMap<SimpleIndexMap, String> { ... }
```

`JsonlIndexMap` 支持保存任意满足 `Jsonable` 的数据类型。在持久化时，它会将数据保存为 JSONL 文件，并且 index 即为文件行号。

```cangjie
class JsonlIndexMap<T> <: IndexMap<JsonlIndexMap<T>, T> where T <: Jsonable<T> & ToString
```

#### 语义数据结构

向量数据集一般不直接使用，而是被封装在两个数据结构 `SemanticMap` 和 `SemanticSet` 中。

```cangjie
public class SemanticMap<VDB, IMAP, T> where VDB <: VectorDatabase<VDB>,
                                             IMAP <: IndexMap<IMAP, T>,
                                             T <: ToString {
    /**
     * 实例化对象
     * @param vectorDB 是用于做相似度检索的向量数据库
     * @param embeddingModel 是用于做向量化的 embedding 模型；默认使用 OpenAI 的 text-embedding-ada-002
     */
    public init(vectorDB!: VDB,
                indexMap: IMAP,
                embeddingModel!: Option<EmbeddingModel> = None)

    /**
     * 主要用于设置 embedding 模型
     */
    public mut prop embeddingModel: EmbeddingModel

    /**
     * 插入新的键值对
     */
    public func put(key: String, value: T): Unit

    /**
     * 根据 key 对 map 进行语义检索，查找出相似的 value；
     * number 是查找的最大数量
     * minDistance 最小的相似度距离
     */
    public func search(query: String,
                       number!: Int64 = 5,
                       minDistance!: Float64 = 0.3): Array<T>

    /**
     * 构造 Retriever 对象
     */
    public func asRetriever(): Retriever

    /**
     * 保存到指定的目录下
     */
    public func save(dirPath: String): Unit

    /**
     * 根据目录路径加载数据
     */
    public static func load(dirPath: String): SemanticMap<VDB, IMAP, T>
}
```

另一个数据结构 `SemanticSet` 有相似 API，差异在于：它检索和查找的内容就是 value 本身。

```cangjie
public class SemanticSet<VDB, IMAP, T> where VDB <: VectorDatabase<VDB>,
                                             IMAP <: IndexMap<IMAP, T>,
                                             T <: ToString {
    public init(vectorDB!: VDB,
                indexMap: IMAP,
                embeddingModel!: Option<EmbeddingModel> = None)
    public mut prop embeddingModel: EmbeddingModel
    public func put(value: T): Unit
    public func search(query: String, number!: Int64 = 5, minDistance!: Float64 = 0.3): Array<T>
    public func save(dirPath: String): Unit
    public static func load(dirPath: String): SemanticSet<VDB, IMAP, T>
}
```

#### 使用示例

```cangjie
import magic.vdb.*

main() {
    let smap = SemanticMap(vectorDB: InMemoryVectorDatabase())
    smap.put("前往上海", "Plan A")
    smap.put("吃饭", "Plan B")
    smap.put("前往北京", "Plan C")
    smap.put("睡觉", "Plan D")
    let c = smap.search("前往上海", number: 2)
    println(c)
}
```

将向量数据库作为 retriever 添加到 agent 中使用。目前，使用的向量数据库只能作为 `Static` 模式使用。

```cangjie
let agent = FooAgent()
agent.retriever = smap.asRetriever()
```

### 知识图谱
#### MiniRag
基于MiniRag知识图谱的创建和使用，MiniRag使用到向量、kv和图存储，当前实现支持了本地存储。
https://github.com/HKUDS/MiniRAG
#### `实例化`
使用`MiniRagBuilder`来实例化MiniRag对象，用于后续的知识图谱的构建和基于图谱的检索。
实例化MiniRag需要指定ChatModel、Tokenizer、EmbeddingModel
基于当前可用的tokenizer(详见api_reference.md)需要下载对应的tokenizer配置文件
如:
[OpenAI CL100K](https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken)需要下载cl100k_base.tiktoken文件
[DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3/tree/main)等开源模型需要下载对应的tokenizer.json和tokenizer_config.json文件
其他配置见`MiniRagBuilder`接口文档。
```cangjie
import magic.config.Config
import magic.rag.graph.{MiniRagBuilder, MiniRagConfig, MiniRag}
import magic.model.ollama.OllamaEmbeddingModel
import magic.tokenizer.Cl100kTokenizer
func instantiateMiniRag(): MiniRag {
    Config.env["DEEPSEEK_API_KEY"] = "<your api key>"
    let model = ModelManager.createChatModel("<Chat Model Name>")
    let embed = OllamaEmbeddingModel("<Embedding Model Name>", baseURL: "<Embedding Model URL>")
    let tokenizer = Cl100kTokenizer("<Your TickToken File Location>")
    let config = MiniRagConfig(model, embed, tokenizer)
    MiniRagBuilder(config).build()
}
```
#### `知识图谱构建`
```cangjie
func buildGraph(): Unit {
    let miniRag:MiniRag = instantiateMiniRag()
    let content:String = "<Text Read From File>"
    miniRag.insert(content)
    miniRag.commit()
}
```

#### `知识图谱检索`
```cangjie
func search(query:String): String {
    let miniRag = instantiateMiniRag()
    let retriever = miniRag.asRetriever()
    let response = retriever.search(query)
    response.toPrompt()
}
```

#### 使用示例
[使用示例](../src/examples/mini_rag/main.cj)