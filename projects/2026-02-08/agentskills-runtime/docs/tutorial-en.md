NOTE: This file is translated from `tutorial.md` by the `doc_translator` agent.

# User Tutorial

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [User Tutorial](#user-tutorial)
  - [Agent Definition](#agent-definition)
  - [Writing Prompts](#writing-prompts)
    - [Using Prompt Patterns](#using-prompt-patterns)
    - [Custom Prompt Pattern](#custom-prompt-pattern)
  - [Agent Interaction Methods](#agent-interaction-methods)
    - [Input Template](#input-template)
    - [Conversation History](#conversation-history)
  - [MCP Protocol and Tools](#mcp-protocol-and-tools)
    - [Writing Tool Functions](#writing-tool-functions)
    - [Using Tools and MCP Servers](#using-tools-and-mcp-servers)
    - [Additional Tool Property Settings](#additional-tool-property-settings)
  - [Planning](#planning)
    - [Agent Execution DSL (Experimental)](#agent-execution-dsl-experimental)
  - [External Knowledge](#external-knowledge)
  - [Examples](#examples)
    - [Example 1: Command Line Assistant Agent](#example-1-command-line-assistant-agent)
  - [Multi-Agent Collaboration](#multi-agent-collaboration)
    - [Linear Collaboration](#linear-collaboration)
    - [Master-Slave Collaboration](#master-slave-collaboration)
    - [Free Collaboration](#free-collaboration)
    - [Agent Collaboration Subgroup Construction](#agent-collaboration-subgroup-construction)
  - [Quick AI Functions](#quick-ai-functions)
  - [Model Configuration](#model-configuration)
  - [Common APIs](#common-apis)
    - [Global Configuration](#global-configuration)
    - [Agent Types](#agent-types)
    - [Agent Interception Mechanism](#agent-interception-mechanism)
    - [Built-in Agents](#built-in-agents)
      - [`BaseAgent`](#baseagent)
      - [`DispatchAgent`](#dispatchagent)
      - [`ToolAgent`](#toolagent)
      - [`HumanAgent`](#humanagent)
    - [Jsonable Interface](#jsonable-interface)
    - [Integrating New Models](#integrating-new-models)
    - [Custom Planning Methods](#custom-planning-methods)
    - [Semantic Retrieval Functionality](#semantic-retrieval-functionality)
      - [Vector Model](#vector-model)
      - [Vector Database](#vector-database)
      - [Index Mapping Table](#index-mapping-table)
      - [Semantic Data Structures](#semantic-data-structures)
      - [Usage Example](#usage-example)
    - [Knowledge Graph](#knowledge-graph)
      - [MiniRag](#minirag)
      - [`Instantiation`](#instantiation)
      - [`Knowledge Graph Construction`](#knowledge-graph-construction)
      - [`Knowledge Graph Retrieval`](#knowledge-graph-retrieval)
      - [Usage Example](#usage-example-1)

<!-- /code_chunk_output -->



The Cangjie Agent DSL is a specialized language for defining and managing Agents. It allows developers to enhance Agent capabilities through structured system prompts, tools, and various collaboration strategies. This manual introduces how to use the various features of Cangjie Agent DSL and provides examples to help users get started quickly.

Cangjie Agent DSL is designed as an eDSL (embedded Domain-Specific Language) within the Cangjie language, implemented through metaprogramming mechanisms in Cangjie, with Cangjie serving as its host language. This means that code written in Agent DSL is ultimately transformed into standard Cangjie code and compiled by the Cangjie compiler.

## Agent Definition

Currently, we use the `@agent` macro to decorate a `class` type to define an Agent type.

```cangjie
@agent class Foo { }
```

The `@agent` macro supports the following attributes. For specific attributes, refer to the corresponding sections.

| Attribute Name | Value Type | Description |
|-------|-------|-------|
| `description` | `String` | Functional description of the Agent; if not set by default, it will be automatically summarized by the LLM from the prompt |
| `model` | `String` | Configures the LLM model service to be used; defaults to gpt-4o |
| `tools` | `Array` | Configures external tools that can be used |
| `rag` |   `Map` | Configures external knowledge sources |
| `memory` |  `Bool` | Whether to use memory, i.e., save multiple Q&A records of the Agent (currently, memory only supports in-memory non-persistent data); defaults to `false` |
| `executor` | `String` | Planning mode; defaults to `react` |
| `temperature` | `Float` | The temperature value when the Agent uses the LLM; defaults to `0.5` |
| `enableToolFilter` | `Bool` | Enables tool filtering functionality; the Agent will automatically select appropriate tools based on the input question before execution; defaults to `false` |
| `dump` | `Bool` | For debugging purposes, whether to print the transformed AST of the Agent; defaults to `false` |

## Writing Prompts

The core of each Agent is its system prompt, which defines the Agent's role information and execution steps, enabling the large language model (LLM) to answer questions more accurately and quickly. In Agent definitions, `@prompt` is used to write the Agent's system prompt.

- Within the scope of the `@prompt` macro, all string literals (including interpolated strings) will be concatenated sequentially to form the complete system prompt.
- Functions and member variables of the Cangjie language can be accessed within `@prompt`.
- Each Agent can have at most one `@prompt` definition.

**Example: String Concatenation**
The following code concatenates three strings as the complete Agent system prompt, with the third interpolated string calling the function `bar`.

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

**Example: Accessing Member Variables**

```cangjie
@agent
class Calculator {
    @prompt(
        """
        You are a calculator capable of performing calculations.
        Your name is ${name}-${version}.
        """
        "For example, you can perform addition, 1 + 2 = 3 ..."
    )
    private let name: String
    private let version: Int64
    ...
}

let calculator = Calculator(name: "aha", version: 1)
```

The `@prompt` macro supports setting the `include` attribute, whose value is a string representing a file path. The file content will be used as the Agent's system prompt.
- When the `include` attribute is configured, the literals written in `@prompt` will be ignored and not used as the system prompt.
- If the file pointed to by `include` does not exist, an exception will be thrown.

**Example: Using External Files to Write System Prompts**

```cangjie
@agent
class Foo {
    @prompt[include: "./a.md"]()
}
```

### Using Prompt Patterns

Well-structured prompts can significantly improve LLM performance. By defining a unified prompt syntax, developers can write more structured prompts.

**Using Prompt Patterns**

The `@prompt` macro supports setting the `pattern` attribute, whose value should be a prompt pattern type. When using prompt patterns, *prompt elements* that satisfy the pattern must be written within the `@prompt` scope instead of string literals.

Note: The `include` attribute and `pattern` attribute cannot be used simultaneously; if both are present, an exception will be thrown.

**Example: Using Prompt Patterns**

```cangjie
@agent
class Foo {
    @prompt[pattern: APE] (
        action: "Help users plan travel routes",
        purpose: "Allow users to visit as many attractions as possible within the planned time while getting adequate rest",
        expectation: "Generate a reasonable travel route, including time, attractions, commuting information, etc."
    )
}
```

The following are the currently available prompt patterns.

<table>
    <tr>
        <th>Prompt Pattern</th>
        <th>Description</th>
    </tr>

<tr>
<td>

`APE`

</td>
<td>

`action`: Defines the work or activity to be completed
`purpose`: Defines why this action is initiated
`expectation`: States the expected outcome

</td>
</tr>
<tr>
<td>

`BROKE`

</td>
<td>

`background`: Describes the background and provides sufficient information
`role`: Specifies the role of the agent
`objectives`: Defines the task objectives to be achieved
`keyResult`: Defines key measurable results to guide how the agent evaluates the achievement of objectives
`evolve`: Tests results through experimentation and adjustment, optimizing as needed

</td>
</tr>
<tr>
<td>

`COAST`

</td>
<td>

`context`: Sets the background for the conversation
`objective`: Describes the goal
`action`: Explains the required action
`scenario`: Describes the scenario
`task`: Describes the task

</td>
</tr>
<tr>
<td>

`TAG`

</td>
<td>

`task`: Defines the specific task
`action`: Describes what needs to be done
`goal`: Explains the ultimate goal

</td>
</tr>
<tr>
<td>

`RISE`

</td>
<td>

`role`: Specifies the role of the agent
`input`: Describes the information or resources
`steps`: Requests detailed steps
`expectation`: Describes the expected result

</td>
</tr>
<tr>
<td>

`TRACE`

</td>
<td>

`task`: Defines the specific task
`request`: Describes your request
`action`: Explains the action you need
`context`: Provides background or context
`example`: Gives an example to illustrate your point

</td>
</tr>
<tr>
<td>

`ERA`

</td>
<td>

`expectation`: Describes the expected result
`role`: Specifies the role of the agent
`action`: Specifies the action to be taken

</td>
</tr>
<tr>
<td>

`CARE`

</td>
<td>

`context`: Sets the background or context for the discussion
`action`: Describes what you want to do
`result`: Describes the expected result
`example`: Gives an example to illustrate your point

</td>
</tr>

<tr>
<td>

`ROSES`

</td>
<td>

`role`: Specifies the role of the agent
`objective`: States the goal or purpose
`scenario`: Describes the scenario
`expectation`: Define the expected outcome
`steps`: The steps required to achieve the solution

</td>
</tr>

<tr>
<td>

`ICIO`

</td>
<td>

`instruction`: Specific task instructions for the AI
`context`: Provide additional background information to the AI
`input`: Specify the data the model needs to process
`output`: Specify the expected output type or format

</td>
</tr>

<tr>
<td>

`CRISPE`

</td>
<td>

`capacityAndRole`: The role the agent should assume
`insight`: Provide insights, background, and context
`statement`: What you are asking the agent to do
`personality`: The style, personality, or manner in which you want the agent to respond
`experiment`: Request the agent to provide multiple response examples

</td>
</tr>
<tr>
<td>

`RACE`

</td>
<td>

`role`: Specify the agent's role
`action`: Detail the actions to be taken
`context`: Provide detailed information about the relevant context
`expectation`: Describe the expected outcome

</td>
</tr>
<tr>
<td>

`SAGE`

</td>
<td>

`situation`: Describe the background or environment for task execution
`action`: Specify the required operations or steps
`goal`: State the purpose or effect to be achieved upon task completion
`expectation`: Specify the requirements for the output result

</td>
</tr>

</table>

### Custom Prompt Pattern

The macro `@promptPattern` applies to `class` types and can define new prompt patterns. Within the modified class definition, the macro `@element` is used to modify member variables, defining prompt elements.
- Each element must be of type `String`.
- The `description` attribute explains the element and does not affect the final prompt.

The prompt pattern type must implement the `toString` method, which constructs the prompt.

**Example: Custom Prompt Pattern**

```cangjie
@promptPattern
class APE {
    @element[description: "Define the task"]
    let action: String

    @element[description: "Define the task's purpose"]
    let purpose: String

    @element[description: "Clearly define the expected outcome"]
    let expectation: String

    public func toString(): String {
        return "...${action}...${purpose}...${expectation}..."
    }
}
```

## Agent Interaction Methods

An Agent defined with `@agent` has a default method `func chat(question: ToString): String` as the interaction entry point.

```cangjie
@agent class Foo { ... }

let agent = Foo()
let result = agent.chat("What's the weather today?")
println(result)
```

Additionally, `chatGet` allows the Agent to return a data type directly instead of just a string. If the Agent fails to generate the required data type, it returns `None`. The method is defined as follows:

```cangjie
func chatGet<T>(question: String): Option<T> where T <: Jsonable<T>
```

Here, the `Jsonable` interface ([see section](#jsonable-interface)) constrains the data type to be convertible to/from a JSON object. Basic types `Int/Int64/String` already implement this interface.

The macro `@jsonable` is used for custom types to automatically implement this interface:
- `@jsonable` modifies `class` types and automatically implements the `Jsonable` interface through code transformation.
- Within the modified type, `@field` can be used to add descriptions for member variables. If not used, member variables will not carry descriptions.

**Example: Returning a Data Structure**

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
let date = agent.chatGet<MyDate>("Huawei's founding date")
println(date.year)
println(date.month)
```

### Input Template

When defining an Agent type with `@agent`, an *input template* can be provided, which templates the input question with *placeholder variables*. When calling the interaction interface, only the values of the placeholder variables need to be provided.
The macro `@user` defines the input template:
- Similar to `@prompt`, `@user` concatenates all string literals as the complete input template.
- In the input template, `{variable}` represents a placeholder variable, where the variable name consists of letters, numbers, and underscores.
- Like `@prompt`, `@user` supports the `include` attribute, where the attribute value is a file path. If set, the file content serves as the input template.

When calling `func chat(variables: Array<(String, ToString)>): String`, placeholder variables and their corresponding values must be provided.
- If the Agent does not provide an input template, calling this method will throw an `UnsupportedException`.

**Example: Using an Input Template**

```cangjie
@agent
class Foo {
    @prompt(
        "System: ..."
    )
    @user(
        "The rectangle's length is: {length} cm, and its width is {width} cm"
        "Calculate the rectangle's area"
    )
}
let agent = Foo()
let area = agent.chat(
    ("length", 3),
    ("width", 4),
)
```

### Conversation History

A single `chat` call with an Agent constitutes a `ChatRound`, and `Conversation` maintains multiple dialogue processes to form a continuous conversation history.

When calling an Agent, `Conversation` can be passed as a parameter of `AgentRequest` to enable the Agent to respond based on the conversation history. Meanwhile, the `execution.chatRound` property of `AgentResponse` updates the conversation history.

**Example: Conversation History Example**

```cangjie
let agent = FooAgent()
let conversation = Conversation()
let resp = agent.chat(
    AgentRequest("Hello", conversation: conversation)
)
// Update the conversation
conversation.addChatRound(resp.execution.chatRound)
let resp2 = agent.chat(
    AgentRequest("How are you", conversation: conversation)
)
```

## MCP Protocol and Tools

Tools can be understood as code that an Agent can execute during its operation. Currently, Agent tools come from two sources:
- Tool functions written directly in DSL
- Tools provided by an MCP server (an MCP server can be considered a *collection of tools*)

### Writing Tool Functions

The macro `@tool` modifies functions to convert them into **tool functions**. The following functions can be modified:
- Global functions
- Member methods of Agent classes defined with `@agent`
- Member methods of `Toolset` types defined with `@toolset`

All tool functions have the following attributes:
- The `description` attribute describes the tool's functionality (required).
- The `parameters` attribute describes the meaning of function parameters, accepting key-value pairs in the format `<parameter-name>: <parameter-description>` (optional).
- `filterable`: Whether the tool can be filtered by the Agent, used with the `enableToolFilter` attribute of `@agent` (optional).
- `terminal`: Whether to terminate Agent execution. When set to `true`, the Agent will end immediately after executing this tool, and the function's return value becomes the Agent's execution result (optional).
- `compactable`: Whether to (use LLM) summarize and compact the tool's execution result. compaction occurs only when this attribute is `true` and the result length exceeds `Config.resultSummarizeThreshold` (optional).

If the tool function is a global function or part of a Toolset, it must be explicitly specified in the `tools` attribute for the Agent to use it.

**Example: Defining and Configuring Global Tools**

```cangjie
@tool[description: "...",
      parameters: { arg: "..."}]
func foo(arg: String): String { ... }

@agent[
    tools: [foo]
]
class A { ... }
```

**Example: Defining a Toolset Type and Configuring It**

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

**Example: Defining Internal Tools**

```cangjie
@agent
class A {
    @tool[description: "...",
          parameters: { str: "..." }]
    func bar(str: String): String { ... }
}
```

Restrictions for tool functions:
- Currently, the parameter types of tool functions must satisfy the `Jsonable` interface.
- The return value of a tool function must satisfy the `ToString` interface, and the return value of this method will serve as the tool's execution result.

### Using Tools and MCP Servers

Agents configure MCP servers and custom tool functions via the `tools` attribute. This attribute accepts multiple MCP servers/tool functions, each configured using the following syntax:
- MCP server with `stdio` protocol: `stdioMCP(<command>, <env-kv-pair>*)`, specifying the command line to start the MCP server and optional environment variables. For example, `stdioMCP("command and arguments", ENV_1: "value1", ENV_2, "value2")`.
- MCP server with `http/sse` protocol: `mcpHttp(<url>)`, specifying the MCP server's address. For example, `httpMCP("https://abc.com/mcp")`.
- Tool function `<func-id>+`, e.g., `foo, bar`. Note ⚠️: If the tool is defined inside the Agent class, it can be used directly by the owning Agent without explicit specification in the `tools` attribute.
- Toolset construction `<expr>`, typically an instantiation of a Toolset type, e.g., `MyToolset()`.

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

MCP tools can also be configured for Agents via API.

```cangjie
// Initialize MCP client
let client = MCPClient("node", ["args"])
let agent = SomeAgent()
// Add MCP tools
agent.toolManager.addTools(client.getTools())
```

⚠️ Note: Currently, MCP servers only support MCP protocols related to tools.

Additionally, the `tools` configuration **also supports JSON syntax for setting up MCP servers**.

- `stdio` transmission, configured by: consisting of `command` (startup command) and `args` (startup arguments), with optional environment variables `env`.
- `HTTP SSE` transmission, configured by: specifying the MCP server address via `url`.

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

### Additional Tool Property Settings

All tools allow saving additional property values via the special member variable `extra: HashMap<String, String>`. Currently, there are two special property values:

- `filterable: "true" | "false"` Whether the tool can be filtered by the Agent, used in conjunction with `agent.toolManager.enableFilter`.
- `terminal: "true" | "false"` Whether to terminate Agent execution. When set to `true`, the Agent will end directly after executing this tool, and the function's return value will serve as the Agent's execution result.

**Example: Setting Additional Tool Properties**

```cangjie
let tool: Tool = getSomeTool()
tool.extra["filterable"] = "false"
tool.extra["terminal"] = "true"
```

## Planning

Each Agent has an `executor` property to specify which executor to use (different executors employ different planning strategies). Currently, the following executors are supported:

| Planning Name | Description |
|---|---|
| `naive`  | Direct Q&A |
| `react` | The Agent selects a tool to complete a solving step each time, then evaluates the tool's execution result to determine if the task is completed, iterating this process until the task is solved. |
| `plan-react` | First, complete a task plan, then use React mode to solve each subtask derived from the plan. |
| `tool-loop` | Functionally similar to `react` but without an explicit thinking process. |

Among these, the `react` and `tool-loop` executors can specify the maximum number of iterations in the form `react:<number>`, such as `react:5`.

**Example: Configuring Planning Methods**

```cangjie
@agent[executor: "naive"]
class Foo{ }

@agent[executor: "react"]
class Bar{ }
```

### Agent Execution DSL (Experimental)

In addition to using the pre-provided planning methods in Magic, you can also use the planning DSL to control the Agent's execution process more granularly.

**Agent Execution DSL Definition**: A "programming language" for defining LLM Agent execution flows, achieving complex strategies through combined operations.

- **Avoid Repetitive Code**: Prevent writing redundant template code manually.
- **Flexible Customization**: Easily write complex planning strategies.

**Basic Rules**

- The planning DSL is used within `@agent` inside `@execution`; when using the planning DSL, the `executor` property configuration is ignored.
- The pipe operator `|>` connects multiple planning operations.
- The Agent execution state is *a sequence of Prompts*.
  - After each LLM operation is completed, the operation result is added to this Prompt sequence.

**Usage Example**

```swift
@agent class Foo {
  @execution(
    plan |> loop(think |> action) |> answer
  )
}
```

Flow Diagram

```
             plan         -> think         -> action ->       think -> ... -> answer
| SysPrompt | -> | SysPrompt | -> | SysPrompt |        | SysPrompt |
                 | Plan: ... |    | Plan: ... |        | Plan: ... |
                                  | Think: ... |       | Think: ... |
                                                       | Action: ... |
                                                       | Result: ... |
```

Planning operations are extracted from existing planning methods, abstracting commonly used logic into composable operations, including three categories: *Basic Operations*, *Task Decomposition Operations*, and *Condition Control Operations*.

**Basic Operations Overview**

| Operator      | Function             |
|-------------|----------------|
| `think`     | Generate reasoning steps |
| `action`    | Select and execute a tool |
| `answer`    | Return the final answer |
| `plan`      | Create a plan |
| `loop`      | Loop internal operation sequences |
| `tool`      | Execute tool function sequences in order, with tool parameters automatically generated by the LLM |
| `done`      | Check for termination |

**Complex Operations: Task Decomposition & Merging**

```cangjie
@agent class ResearchAssistant {
  @execution(
    divide |> each(tool(web_search)) |> summary |> answer
  )
  @tool
  func web_search(...) { ... }
}
```

| Operator      | Function             |
|-------------|----------------|
| `divide` | Split the task into subproblems via LLM, with the number of subproblems determined automatically. |
| `each` | Handle subtasks. |
| `summary` | Summarize subtask results. |

**Complex Operations: Conditional Control**

```swift
@agent class Assistant {
  @execution(
    switch(
      onCase("Is the question about weather?", tool(weather_api)),
      onCase("Is the question about order inquiry?", tool(db_query |> db_summary)),
      otherwise(think |> answer)
    )
  )
}
```

- `switch` accepts multiple `onCase` clauses.
- Each `onCase` clause consists of a condition (expressed in natural language) and an operation sequence.
    - When the condition in `onCase` is met (based on the current execution state), the corresponding operation sequence continues.
    - `onCase` clauses are executed top-down.
- If no `onCase` is met, the `otherwise` clause is executed.

## External Knowledge

In addition to system prompts, external knowledge can also enhance the Agent's problem-solving capabilities. Agents can extract necessary and useful information from various knowledge sources.

Currently, the Agent's `rag` property indicates the data source of external knowledge. It accepts multiple data source configurations, each containing the following key-value pairs:

| Property  | Value | Description |
|---|---|---|
| `source`  | `String \| Expr`  | Data source |
| `mode`  | `String`  | Usage mode, supporting `"static"` and `"dynamic"`; defaults to `"static"`. |
| `description`  | `String`  | Further describes the data source to help the Agent retrieve data more accurately. |

The `source` property indicates the actual data source, supporting two types:
- A valid path pointing to *predefined file types*
    - Currently supported file types include markdown and SQLite databases.
- An expression of type `Retriever`.

```cangjie
@agent[
  rag: { source: "path/to/some.md", mode: "dynamic" }
]
class Foo { }
```

⚠️ Note: Using SQLite database functionality requires configuring `sqlite = "enable"` in `cfg.toml`. Since the database uses SQLite, third-party dependencies must be installed. For details, see [third_party_libs.md](./third_party_libs.md).

## Examples

### Example 1: Command Line Assistant Agent

```cangjie
@agent[executor: "react"]
class CJCAgent {
    @prompt(
        """
        You are a CJC command line assistant.
        You help users generate command lines based on their questions.
        """
    )

    @tool[description: "Retrieve the CJC manual"]
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
let result = agent.chat("Compile a file for the ARM platform")
```

## Multi-Agent Collaboration

Multiple Agents can be organized into groups for efficient collaboration. These collaborations generally fall into three categories:

1. **Linear Collaboration**: Agents operate sequentially, with each Agent receiving the previous Agent's message (including results and tasks), processing it, and passing the result to the next Agent.
2. **Master-Slave Collaboration**: One Agent acts as the leader, supervising other Agents' activities, while other Agents report to the leader.
3. **Free Collaboration**: All Agents act as equal collaborative units, engaging in group discussions where each Agent can see all messages.

The `AgentGroup` interface abstracts all these collaboration methods (see API manual for details).

### Linear Collaboration

The pipe expression `|>` is used to form multiple Agents into a `LinearGroup`.

```cangjie
let linearGroup: LinearGroup = ag1 |> ag2 |> ag3
```

### Master-Slave Collaboration

Use the `<=` operator to form multiple Agents into a `LeaderGroup`, with the Agent before the operator as the leader and the following value as an array of subordinate Agents.

```cangjie
let leaderGroup: LeaderGroup = ag1 <= [ag2, ag3]
```

### Free Collaboration

Use the `|` operator to form multiple Agents into a `FreeGroup`.

```cangjie
let freeGroup: FreeGroup = ag1 | ag2 | ag3
```

`FreeGroup` also provides a more flexible `discuss` method.

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

The `discuss` method can specify:

- `topic` The discussion topic (i.e., the problem to solve).
- `initiator` The first Agent to speak.
- `speech` The content of the first Agent's speech.
- `mode` The discussion mode, either automatically selecting Agents to speak or using a round-robin approach.

The following code implements a number-guessing game between two Agents, referencing [AutoGen](https://github.com/microsoft/autogen/blob/main/website/docs/tutorial/human-in-the-loop.ipynb).

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

### Agent Collaboration Subgroup Construction

When building linear collaboration, not only can Agents participate, but AgentGroups can also directly participate in construction. For example,

```cangjie
ag1 |> (ag2 <= [ag3]) |> ag4
```

The above code constructs a linear collaboration group, but the second unit is a master-slave collaboration group. Here, the master-slave collaboration group is a **subgroup** of the linear collaboration.

However, when building master-slave and free collaborations, `AgentGroup` cannot be directly included in the construction. In this case, the function `func subGroup(g: AgentGroup, description!: String): Agent` must be used to convert an Agent collaboration group into a subgroup object that can participate in building Agent collaboration groups.

```cangjie
ag1 | (ag2 <= [ag3]) | ag4 // Compilation error
ag1 | subGroup(ag2 <= [ag3], description: "A subgroup attempts to ...") | ag4 // Okay
```

## Quick AI Functions

`@ai` can be used to decorate functions, indicating that the function's execution will be completed by the LLM. Functions decorated with `@ai` must be `foreign` functions, meaning the function's implementation resides on the model side and is an external function to the current code. Requirement: **The function's parameter types and return type must satisfy the `Jsonable` interface**. Additionally, `@ai` allows properties:

| Property Name | Value Type | Description |
|-------|-------|-------|
| `prompt` | `String` | Additional knowledge for the AI function |
| `model` | `String` | Configure the LLM model service to be used; defaults to gpt-4o |
| `tools` | `Array` | Configure external tools that can be utilized |
| `temperature` | `Float` | Temperature value when the Agent uses the LLM; defaults to `0.5` |
| `dump` | `Bool` | For debugging purposes, whether to print the transformed AST of the Agent; defaults to `false` |

**Example**:

```cangjie
@tool[description: "Fetches the html content of a URL."]
func fetch(url: String): String { ... }

@ai[
    prompt: "No more than 3 keywords",
    tools: [fetch]
]
foreign func keywordsOf(url: String): Array<String>

main() { keywordsOf("https://cangjie-lang.cn/") }
```

## Model Configuration

Model configuration follows the format `<provider>:<model>`. Currently supported model providers are listed below.

| Provider Name | Example | Configuration Notes | Service URL Configuration |
|---|---|---|---|
| Alibaba Cloud | `dashscope:qwen-plus` | `DASHSCOPE_API_KEY` | `DASHSCOPE_BASE_URL`, default `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| DeepSeek | `deepseek:deepseek-chat` | `DEEPSEEK_API_KEY` | `DEEPSEEK_BASE_URL`, default `https://api.deepseek.com` |
| Volcano Ark | `ark:doubao-lite-4k` | `ARK_API_KEY` | `ARK_BASE_URL`, default `https://ark.cn-beijing.volces.com/api/v3` |
| Llama.cpp | `llamacpp` | No model name or API Key required | `LLAMACPP_BASE_URl`, default `http://localhost:8080` |
| Ollama | `ollama:phi-3` | No API Key required | `OLLAMA_BASE_URl`, default `http://localhost:11434` |
| OpenAI | `openai:gpt-4o` | `OPENAI_API_KEY` | `OPENAI_BASE_URL`, default `https://api.openai.com/v1` |
| SiliconFlow | `siliconflow:deepseek-ai/DeepSeek-V3` | `SILICONFLOW_API_KEY` | `SILICONFLOW_BASE_URL`, default `https://api.siliconflow.cn/v1` |
| Zhipu AI | `zhipuai:glm-4` | `ZHIPUAI_API_KEY` | `ZHIPUAI_BASE_URL`, default `https://open.bigmodel.cn/api/paas/v4` |
| Google | `google:gemini-2.0-flash` | `GOOGLE_API_KEY` | `GOOGLE_BASE_URL`, default `https://generativelanguage.googleapis.com/v1beta/openai` |
| Moonshot | `moonshot:kimi-k2-0711-preview` | `MOONSHOT_API_KEY` | `MOONSHOT_BASE_URL`, default `https://api.moonshot.cn/v1` |
| OpenRouter | `openrouter:qwen/qwen3-coder:free` | `OPENROUTER_API_KEY` | `OPENROUTER_BASE_URL`, default `https://openrouter.ai/api/v1` |

Model configuration can be used not only in the `model` property of `@agent`, but also directly constructed via static methods of `ModelManager`: `static func createChatModel(modelName: String): ChatModel`.

**Model Support Matrix**

|  | Chat | Embedding | Image |
|---|---|---|---|
| Alibaba Cloud | ✔️ | ✔️ | ❌ |
| DeepSeek | ✔️ | ❌️ | ❌ |
| Volcano Ark | ✔️ | ✔️ | ❌ |
| Llama.cpp | ✔️ | ❌ | ❌ |
| Ollama | ✔️ | ✔️ | ❌ |
| OpenAI | ✔️ | ✔️ | ✔️ |
| SiliconFlow | ✔️ | ✔️ | ✔️ |
| Zhipu AI | ✔️ | ❌ | ❌ |
| Google | ✔️ | ❌ | ❌ |
| Moonshot | ✔️ | ❌ | ❌ |
| OpenRouter | ✔️ | ❌ | ❌ |

To integrate new models, refer to direct API configuration (see below).

## Common APIs

This section introduces commonly used APIs. For a complete reference, see [API Reference](./api_reference.md).

### Global Configuration

The class `magic.config.Config` provides the following global configurations, all of which are readable and writable.

| Configuration Name | Type | Description | Default Value |
|---|---|---|---|
| `logLevel` | `LogLevel` | Logging level | `LogLevel.ERROR` |
| `logFile` | `String` | Log file path | `stdout` |
| `enableAgentLog` | `Bool` | Whether to save individual Agent logs | `false` |
| `agentLogDir` | `String` | Directory for individual Agent logs | `./logs/agent-logs` |
| `saveModelRequest` | `Bool` | Whether to save each model request | `false` |
| `modelRequestDir` | `String` | Directory for model requests | `./logs/model-requests` |
| `defaultChatModel` | `Option<ChatModel>` | Default LLM model | `None` |
| `defaultEmbeddingModel` | `Option<EmbeddingModel>` | Default embedding model | `None` |
| `externalScriptDir` | `String` | Directory for external scripts | `./external_scripts` |
| `defaultContextLen` | `Int` | LLM context length | `32000` |
| `defaultTokenizer` | `Option<Tokenizer>` | Default tokenizer for calculating prompt tokens | `UnicodeTokenizer()` |
| `enableFunctionCall` | `Bool` | Whether to use LLM function call capability in Agent executors (currently only `tool-loop/dsl` executors) | `false` |
| `maxReactNumber` | `Int` | Maximum iterations for React mode | `10` |
| `modelRetryNumber` | `Int` | Maximum retries for failed model requests | `3` |
| `env` | `HashMap<String,String>` | Environment variables | - |

### Agent Types

All types defined with `@agent` automatically implement the `interface Agent`, which provides the following APIs for accessing Agent properties.

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

The method `func chat(request: AgentRequest): String` is the message processing interface. Note that the interaction method `func chat(question: String): String` introduced in [this section](#agent-interaction-methods) is a wrapper around this interface method.

```cangjie
class AgentRequest {
    // The current user question
    public let question: String
    ...
}
```

### Agent Interception Mechanism

The `Agent` has a mutable property `mut prop interceptor: Interceptor` for setting message interception.

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

When an interceptor Agent is set, whenever the Agent receives a message (represented as `Request`), if the interception condition is met, the message will be handled by the interceptor Agent instead of the original Agent. There are three interception modes:

- `Always`: Always intercept
- `Periodic`: Periodically intercept (e.g., intercept every Nth message)
- `Conditional`: Use a predicate function to determine whether to intercept

```cangjie
let ag1 = Foo()
let ag2 = Bar()
ag1.interceptor = Interceptor(ag2, mode: InterceoptorMode.Periodic(2))

ag1.chat("msg 1")
ag1.chat("msg 2")
ag1.chat("msg 3") // ag2 will handle this request message
```

### Built-in Agents

In addition to defining Agents via `@agent`, the framework provides the following built-in Agents.

#### `BaseAgent`

`BaseAgent` is used to construct Agents via API calls.

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

**Example: Constructing an Agent via `BaseAgent`**

```cangjie
let agent= BaseAgent()
agent.systemPrompt = "New system prompt ..."
agent.model = ModelManager.createChatModel("ollama:phi3")
agent.toolManager.addTool(fooTool)
```

#### `DispatchAgent`

`DispatchAgent` is specialized for task dispatching in master-slave collaboration mode.

```cangjie
class DispatchAgent {
    public init(model!: String)
}
```

**Example**

```cangjie
let group = DiapatchAgent(model: "deepseek:deepseek-chat") <=[
    FooAgent(),
    BarAgent(),
    ...
]
```

#### `ToolAgent`

`ToolAgent` does not use an LLM to respond to queries but directly executes provided functions to generate responses.

```cangjie
class ToolAgent<T> where T <: Jsonable<T> {
    public init(fn!: (String) -> T)
}
```

Using this Agent with linear collaboration can achieve functionality similar to Langchain's orchestration.

```cangjie
let group = FooAgent() |> ToolAgent(fn: { q: String => ...; }) |> BarAgent()
```

#### `HumanAgent`

`HumanAgent` allows users to participate in Agent collaboration as an Agent. It can be viewed as a specialized `ToolAgent`.

```cangjie
class HumanAgent {
    public init(qaFunc!: Option<(String) -> String> = None)
}
```

The parameter `qaFunc` can be customized. The default implementation prints the user question to the terminal and accepts user input as the response.

```cangjie
let humanAgent = HumanAgent(qaFunc: { q: String => println(q); return "answer" })
let result = humanAgent.chat("question")
```

### Jsonable Interface

The `Jsonable` interface ensures that types can be converted to and from JSON data. The macro `@jsonable` automatically implements this interface for decorated `class/struct/enum` types.

```cangjie
public interface Jsonable<T> {
    /**
     * Get the type schema of T
     */
    static func getTypeSchema(): TypeSchema

    /**
     * Deserialize from a Json string
     */
```
```markdown
    static func fromJsonValue(json: JsonValue): T

    /**
     * Serialize to a Json string
     */
    func toJsonValue(): JsonValue
}
```

### Integrating New Models

New models can implement the `interface ChatModel` and then be configured via the `agent.model` property.

Model-related types are located in the `magic.core.model` package.

```cangjie
interface ChatModel <: Model {
    func create(req: ChatRequest): ChatResponse
    func asyncCreate(req: ChatRequest): AsyncChatResponse
}
```

Message types used are defined in `magic.core.message`.

```cangjie
public class ChatMessage <: ToString {
    public let name: String          // name of the sender
    public let role: ChatMessageRole // role of the sender
    public let content: String       // Content of the message
}
```

**Example: Custom Chat Model**

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

After customizing the model, you can register a name for it, allowing direct configuration via the `@agent` attribute. The registration function is the member method `func registerChatModel(name: String, buildFn: () -> ChatModel)` of `ModelManager`.
⚠️Note: Ensure model registration occurs before invoking Agent instance methods.

**Example: Registering a Custom Model**

```cangjie
@agent[model: "newModel"]
class Foo { }

main() {
    ModelManager.register("newModel", { => NewModel() })
    let agent = Foo()
}
```

### Custom Planning Methods

When the built-in `naive` and `react` planning methods are insufficient, you can develop new executors by implementing the `interface AgentExecutor` and configure them via the `agent.executor` property.

Related types for this interface are in the `magic.core.agent` package.

```cangjie
interface AgentExecutor {
    func run(agent: Agent, request: AgentRequest): AgentResponse

    func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse
}
```

**Example: Custom Agent Executor**

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

After customizing the executor, you can register a name for it, enabling direct configuration via the `@agent` attribute. The registration function is the member method `func registerAgentExecutor(name: String, buildFn: () -> AgentExecutor)` of `AgentExecutorManager`.
⚠️Note: Ensure executor registration occurs before invoking Agent instance methods.

**Example: Registering a Custom Executor**

```cangjie
@agent[executor: "newExecutor"]
class Foo { }

main() {
    AgentExecutorManager.register("newExecutor", { => NewExecutor() })
    let agent = Foo()
}
```

### Semantic Retrieval Functionality

Semantic retrieval functionality is divided into the following modules:

- Vector Model: Constructs semantic vectors `vector` for data structures' semantic information (`String` type)
- Vector Database: Builds vector indexes, maintaining `vector -> index` mappings; provides vector search
- Index Mapping Table: Maintains index-to-data mappings, i.e., `index -> data`
- Semantic Data Structures: Encapsulates the above modules with convenient interfaces

Except for vector models, all types in this section are defined in the `vdb` subpackage.

#### Vector Model

Vectors are defined as follows.

```cangjie
class Vector {
    public init(data: Array<Float32>)
}
```

Use `VectorBuilder` to construct vectors.

```cangjie
public class VectorBuilder {
    public VectorBuilder(model!: EmbeddingModel)

    public func createEmbeddingVector(content: String): Vector
}
```

Currently, the following two embedding model services are supported, located in the `model.openai/ollama` subpackage.

```cangjie
class OpenAIEmbeddingModel <: EmbeddingModel {
    ...
}

class OllamaEmbeddingModel <: EmbeddingModel {
    ...
}
```

Use `ModelManager.createEmbeddingModel` to conveniently construct model instances.

**Example: Building a Vector**

```cangjie
let model = ModelManager.createEmbeddingModel("openai:text-embedding-ada-002")
let vecBuilder = VectorBuilder(model: model)
let vector= vecBuilder.createEmbeddingVector("First vector")
```

#### Vector Database

The vector database is abstracted as the following interface.

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

Currently, `InMemoryVectorDatabase` and `FaissVectorDatabase` are supported.

```cangjie
class FaissVectorBase {
    public init(dimension: Int64)
}

class InMemoryVectorDatabase {
    public init()
}
```

Note: If using the faiss vector database, configure `faiss = "enable"` in `cfg.toml` and install third-party dependencies. See [third_party_libs.md](./third_party_libs.md) for details.

#### Index Mapping Table

The index mapping table maintains `index -> data` relationships and is abstracted as follows.

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

Currently, two types of index mapping tables are provided:

`SimpleIndexMap` supports saving data of type `String`, maintaining `index -> String` mappings. When persisting, it directly saves mappings as JSON files.
```cangjie
class SimpleIndexMap <: IndexMap<SimpleIndexMap, String> { ... }
```

`JsonlIndexMap` supports saving any data type satisfying `Jsonable`. When persisting, it saves data as JSONL files, with indexes corresponding to line numbers.

```cangjie
class JsonlIndexMap<T> <: IndexMap<JsonlIndexMap<T>, T> where T <: Jsonable<T> & ToString
```

#### Semantic Data Structures

Vector datasets are generally not used directly but are encapsulated in two data structures: `SemanticMap` and `SemanticSet`.

```cangjie
public class SemanticMap<VDB, IMAP, T> where VDB <: VectorDatabase<VDB>,
                                             IMAP <: IndexMap<IMAP, T>,
                                             T <: ToString {
    /**
     * Instantiate the object
     * @param vectorDB Vector database for similarity search
     * @param embeddingModel Embedding model for vectorization; defaults to OpenAI's text-embedding-ada-002
     */
    public init(vectorDB!: VDB,
                indexMap: IMAP,
                embeddingModel!: Option<EmbeddingModel> = None)

    /**
     * Primarily used to set the embedding model
     */
    public mut prop embeddingModel: EmbeddingModel

    /**
     * Insert new key-value pairs
     */
    public func put(key: String, value: T): Unit

    /**
     * Perform semantic search on the map based on key to find similar values;
     * number is the maximum number of results
     * minDistance is the minimum similarity distance
     */
    public func search(query: String,
                       number!: Int64 = 5,
                       minDistance!: Float64 = 0.3): Array<T>

    /**
     * Construct a Retriever object
     */
    public func asRetriever(): Retriever

    /**
     * Save to the specified directory
     */
    public func save(dirPath: String): Unit

    /**
     * Load data from the directory path
     */
    public static func load(dirPath: String): SemanticMap<VDB, IMAP, T>
}
```

The other data structure, `SemanticSet`, has similar APIs, with the difference being that the content it searches and retrieves is the value itself.

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
```
```markdown
    public func save(dirPath: String): Unit
    public static func load(dirPath: String): SemanticSet<VDB, IMAP, T>
}
```

#### Usage Example

```cangjie
import magic.vdb.*

main() {
    let smap = SemanticMap(vectorDB: InMemoryVectorDatabase())
    smap.put("Go to Shanghai", "Plan A")
    smap.put("Have a meal", "Plan B")
    smap.put("Go to Beijing", "Plan C")
    smap.put("Sleep", "Plan D")
    let c = smap.search("Go to Shanghai", number: 2)
    println(c)
}
```

Add the vector database as a retriever to the agent for use. Currently, the vector database can only be used in `Static` mode.

```cangjie
let agent = FooAgent()
agent.retriever = smap.asRetriever()
```

### Knowledge Graph
#### MiniRag
Creation and usage of knowledge graphs based on MiniRag, which utilizes vector, key-value, and graph storage. The current implementation supports local storage.
https://github.com/HKUDS/MiniRAG

#### `Instantiation`
Use `MiniRagBuilder` to instantiate a MiniRag object for subsequent knowledge graph construction and graph-based retrieval.
Instantiating MiniRag requires specifying the ChatModel, Tokenizer, and EmbeddingModel.
Based on the currently available tokenizers (see api_reference.md for details), the corresponding tokenizer configuration files need to be downloaded.
For example:
- [OpenAI CL100K](https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken) requires downloading the cl100k_base.tiktoken file.
- [DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3/tree/main) and other open-source models require downloading the corresponding tokenizer.json and tokenizer_config.json files.
For other configurations, refer to the `MiniRagBuilder` interface documentation.

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

#### `Knowledge Graph Construction`
```cangjie
func buildGraph(): Unit {
    let miniRag:MiniRag = instantiateMiniRag()
    let content:String = "<Text Read From File>"
    miniRag.insert(content)
    miniRag.commit()
}
```

#### `Knowledge Graph Retrieval`
```cangjie
func search(query:String): String {
    let miniRag = instantiateMiniRag()
    let retriever = miniRag.asRetriever()
    let response = retriever.search(query)
    response.toPrompt()
}
```

#### Usage Example
[Usage Example](../src/examples/mini_rag/main.cj)