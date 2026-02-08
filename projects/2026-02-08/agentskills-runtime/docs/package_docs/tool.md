## Package tool
- [Package tool](#package-tool)
  - [class AgentAsTool](#class-agentastool)
    - [prop description](#prop-description)
    - [prop examples](#prop-examples)
    - [func init](#func-init)
    - [func invoke](#func-invoke)
    - [prop name](#prop-name)
    - [prop parameters](#prop-parameters)
    - [prop retType](#prop-rettype)
  - [class NativeFuncTool](#class-nativefunctool)
    - [prop description](#prop-description-1)
    - [prop examples](#prop-examples-1)
    - [func init](#func-init-1)
    - [func invoke](#func-invoke-1)
    - [prop name](#prop-name-1)
    - [prop parameters](#prop-parameters-1)
    - [prop retType](#prop-rettype-1)
  - [class SimpleToolManager](#class-simpletoolmanager)
    - [func addTool](#func-addtool)
    - [func addTools](#func-addtools)
    - [func clear](#func-clear)
    - [func delTool](#func-deltool)
    - [prop enableFilter](#prop-enablefilter)
    - [func filterTool](#func-filtertool)
    - [func findTool](#func-findtool)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
    - [prop tools](#prop-tools)
  - [enum SubAgentMode](#enum-subagentmode)
    - [enumeration Isolated](#enumeration-isolated)
    - [enumeration WithContext](#enumeration-withcontext)

### class AgentAsTool
#### prop description
```
prop description: String
```
- Description: Gets the description of the agent, defaults to the agent's name if description is empty

#### prop examples
```
prop examples: Array<String>
```
- Description: Gets the examples for the tool, returns an empty array

#### func init
```
init(agent: Agent, mode!: SubAgentMode = SubAgentMode.Isolated)
```
- Description: Initializes the AgentAsTool with an agent and a mode
- Parameters:
  - `agent`: `Agent`, The agent to be used as a tool
  - `mode!`: `SubAgentMode`, The execution mode for the sub-agent, defaults to Isolated

#### func invoke
```
func invoke(args: HashMap<String, JsonValue>): ToolResponse
```
- Description: Invokes the tool with the provided arguments
- Parameters:
  - `args`: `HashMap<String, JsonValue>`, The arguments for the tool invocation

#### prop name
```
prop name: String
```
- Description: Gets the name of the agent

#### prop parameters
```
prop parameters: Array<ToolParameter>
```
- Description: Gets the parameters required by the tool based on the sub-agent mode

#### prop retType
```
prop retType: TypeSchema
```
- Description: Gets the return type schema of the tool


### class NativeFuncTool
#### prop description
```
prop description: String
```
- Description: Gets the description of the tool.

#### prop examples
```
prop examples: Array<String>
```
- Description: Gets the examples of the tool.

#### func init
```
init(name: String, description: String, parameters: Array<(String, String, TypeSchema)>, retType: TypeSchema, examples: Array<String>, extra: HashMap<String, String>, execFn: Option<ExecFn>)
```
- Description: Constructor for NativeFuncTool class.
- Parameters:
  - `name`: `String`, Name of the tool.
  - `description`: `String`, Description of the tool.
  - `parameters`: `Array<(String, String, TypeSchema)>`, List of parameters for the tool.
  - `retType`: `TypeSchema`, Return type schema of the tool.
  - `examples`: `Array<String>`, List of examples for the tool.
  - `extra`: `HashMap<String, String>`, Extra information for the tool.
  - `execFn`: `Option<ExecFn>`, Optional execution function for the tool.

#### func invoke
```
func invoke(args: HashMap<String, JsonValue>): ToolResponse
```
- Description: Invokes the tool with the given arguments.
- Parameters:
  - `args`: `HashMap<String, JsonValue>`, Arguments for the tool invocation.

#### prop name
```
prop name: String
```
- Description: Gets the name of the tool.

#### prop parameters
```
prop parameters: Array<ToolParameter>
```
- Description: Gets the parameters of the tool.

#### prop retType
```
prop retType: TypeSchema
```
- Description: Gets the return type schema of the tool.


### class SimpleToolManager
#### func addTool
```
override public func addTool(tool: Tool): Unit
```
- Description: Adds a tool to the manager.
- Parameters:
  - `tool`: `Tool`, The tool to be added.

#### func addTools
```
override public func addTools(tools: Collection<Tool>): Unit
```
- Description: Adds multiple tools to the manager.
- Parameters:
  - `tools`: `Collection<Tool>`, A collection of tools to be added.

#### func clear
```
override public func clear(): Unit
```
- Description: Removes all tools from the manager.

#### func delTool
```
override public func delTool(tool: Tool): Unit
```
- Description: Removes a tool from the manager.
- Parameters:
  - `tool`: `Tool`, The tool to be removed.

#### prop enableFilter
```
override public prop enableFilter: Bool
```
- Description: Gets a value indicating whether tool filtering is enabled.

#### func filterTool
```
override public func filterTool(question: String, filter: ToolFilter): Array<Tool>
```
- Description: Filters tools based on a question and a filter.
- Parameters:
  - `question`: `String`, The question used for filtering.
  - `filter`: `ToolFilter`, The filter to apply to the tools.

#### func findTool
```
override public func findTool(name: String): Option<Tool>
```
- Description: Finds a tool by its name.
- Parameters:
  - `name`: `String`, The name of the tool to find.

#### func init
```
public init()
```
- Description: Initializes a SimpleToolManager with default settings.

#### func init
```
public init(tools: Collection<Tool>, enableFilter: Bool = false)
```
- Description: Initializes a SimpleToolManager with a collection of tools and an optional filter setting.
- Parameters:
  - `tools`: `Collection<Tool>`, A collection of tools to be managed.
  - `enableFilter`: `Bool`, A flag to enable or disable tool filtering. Defaults to false.

#### prop tools
```
override public prop tools: Array<Tool>
```
- Description: Gets an array of all tools managed by this SimpleToolManager.


### enum SubAgentMode
####  Isolated
```
Isolated
```
- Description: Sub-agent executes independently without any context from the main agent

####  WithContext
```
WithContext
```
- Description: Sub-agent inherits the full context (state, history, data, etc.) from the main agent


