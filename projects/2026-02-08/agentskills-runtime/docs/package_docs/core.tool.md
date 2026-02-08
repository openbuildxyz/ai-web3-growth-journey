## Package core.tool
- [Package core.tool](#package-core.tool)
  - [interface Tool](#interface-tool)
    - [prop description](#prop-description)
    - [prop examples](#prop-examples)
    - [prop extra](#prop-extra)
    - [func invoke](#func-invoke)
    - [prop name](#prop-name)
    - [prop parameters](#prop-parameters)
    - [prop retType](#prop-rettype)
  - [interface ToolCompactor](#interface-toolcompactor)
    - [func compact](#func-compact)
  - [class ToolException](#class-toolexception)
    - [func init](#func-init)
    - [let reason](#let-reason)
  - [interface ToolFilter](#interface-toolfilter)
    - [func filter](#func-filter)
  - [interface ToolManager](#interface-toolmanager)
    - [func addTool](#func-addtool)
    - [func addTools](#func-addtools)
    - [func clear](#func-clear)
    - [func delTool](#func-deltool)
    - [prop enableFilter](#prop-enablefilter)
    - [func filterTool](#func-filtertool)
    - [func findTool](#func-findtool)
  - [struct ToolParameter](#struct-toolparameter)
    - [let description](#let-description)
    - [func init](#func-init-1)
    - [let name](#let-name)
    - [let typeSchema](#let-typeschema)
  - [struct ToolRequest](#struct-toolrequest)
    - [let args](#let-args)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
    - [let name](#let-name-1)
    - [func toJsonValue](#func-tojsonvalue)
    - [func toString](#func-tostring)
  - [struct ToolResponse](#struct-toolresponse)
    - [let content](#let-content)
    - [func init](#func-init-1)
    - [let isError](#let-iserror)
  - [interface Toolset](#interface-toolset)
    - [prop tools](#prop-tools)

### interface Tool
#### prop description
```
prop description: String
```
- Description: Description of the tool. LLM will choose the tool according to the description

#### prop examples
```
prop examples: Array<String>
```
- Description: Examples of how to call the tool. Optional

#### prop extra
```
prop extra: HashMap<String, String>
```
- Description: Extra customized attributes. Available attributes include 'filterable', 'terminal', and 'compactable'

#### func invoke
```
func invoke(args: HashMap<String, JsonValue>): ToolResponse
```
- Description: Arguments and their values are grouped in a hash map
- Parameters:
  - `args`: `HashMap<String, JsonValue>`, Arguments and their values grouped in a hash map

#### prop name
```
prop name: String
```
- Description: Unique id of a tool

#### prop parameters
```
prop parameters: Array<ToolParameter>
```
- Description: Type schema of tool inputs

#### prop retType
```
prop retType: TypeSchema
```
- Description: Return type of the tool. Not used currently


### interface ToolCompactor
#### func compact
```
func compact(toolRequest: ToolRequest, toolResponse: ToolResponse): String
```
- Description: Compact the tool invocation
- Parameters:
  - `toolRequest`: `ToolRequest`, The request to the tool
  - `toolResponse`: `ToolResponse`, The response from the tool


### class ToolException
#### func init
```
init(reason: String)
```
- Description: Initializes the ToolException with a reason
- Parameters:
  - `reason`: `String`, The reason for the exception

#### let reason
```
let reason: String
```
- Description: The reason for the exception


### interface ToolFilter
#### func filter
```
func filter(question: String, tools: Collection<Tool>): Array<Tool>
```
- Description: Filters a collection of tools based on a given question.
- Parameters:
  - `question`: `String`, The question used to filter the tools.
  - `tools`: `Collection<Tool>`, The collection of tools to be filtered.


### interface ToolManager
#### func addTool
```
func addTool(tool: Tool): Unit
```
- Description: Add a new tool
- Parameters:
  - `tool`: `Tool`, The tool to be added

#### func addTools
```
func addTools(tools: Collection<Tool>): Unit
```
- Description: Add new tools
- Parameters:
  - `tools`: `Collection<Tool>`, The collection of tools to be added

#### func clear
```
func clear(): Unit
```
- Description: Delete all tools

#### func delTool
```
func delTool(tool: Tool): Unit
```
- Description: Delete a tool if it exists
- Parameters:
  - `tool`: `Tool`, The tool to be deleted

#### prop enableFilter
```
prop enableFilter: Bool
```
- Description: Whether filtering tools is enabled

#### func filterTool
```
func filterTool(question: String, filter: ToolFilter): Array<Tool>
```
- Description: Filter related tools to the question
- Parameters:
  - `question`: `String`, The question to filter tools against
  - `filter`: `ToolFilter`, The filter to apply

#### func findTool
```
func findTool(name: String): Option<Tool>
```
- Description: Find a tool according to its name
- Parameters:
  - `name`: `String`, The name of the tool to find


### struct ToolParameter
#### let description
```
let description: String
```
- Description: The description of the tool parameter.

#### func init
```
init(name: String, description: String, typeSchema: TypeSchema)
```
- Description: Initializes a new ToolParameter with the specified name, description, and type schema.
- Parameters:
  - `name`: `String`, The name of the tool parameter.
  - `description`: `String`, The description of the tool parameter.
  - `typeSchema`: `TypeSchema`, The type schema of the tool parameter.

#### let name
```
let name: String
```
- Description: The name of the tool parameter.

#### let typeSchema
```
let typeSchema: TypeSchema
```
- Description: The type schema of the tool parameter.


### struct ToolRequest
#### let args
```
let args: HashMap<String, JsonValue>
```
- Description: Tool arguments

#### func init
```
init(name: String, args: HashMap<String, JsonValue>)
```
- Description: Constructor for ToolRequest
- Parameters:
  - `name`: `String`, Tool name
  - `args`: `HashMap<String, JsonValue>`, Tool arguments

#### func init
```
init(name: String, args: JsonObject)
```
- Description: Constructor for ToolRequest
- Parameters:
  - `name`: `String`, Tool name
  - `args`: `JsonObject`, Tool arguments

#### let name
```
let name: String
```
- Description: Tool name

#### func toJsonValue
```
func toJsonValue(): JsonValue
```
- Description: Converts the ToolRequest to a JsonValue

#### func toString
```
func toString(): String
```
- Description: Converts the ToolRequest to a string representation


### struct ToolResponse
#### let content
```
let content: String
```
- Description: Content of the tool response

#### func init
```
init(content: String, isError: Bool = false)
```
- Description: Initializes a ToolResponse with content and error status
- Parameters:
  - `content`: `String`, Content of the tool response
  - `isError`: `Bool`, Indicates if the tool response is an error

#### let isError
```
let isError: Bool
```
- Description: Indicates if the tool response is an error


### interface Toolset
#### prop tools
```
prop tools: Array<Tool>
```
- Description: Get all tools


