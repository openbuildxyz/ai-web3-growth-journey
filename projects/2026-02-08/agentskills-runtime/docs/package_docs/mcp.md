## Package mcp
- [Package mcp](#package-mcp)
  - [class HttpMCPClient](#class-httpmcpclient)
    - [func close](#func-close)
    - [func init](#func-init)
    - [prop initParams](#prop-initparams)
  - [class HttpMCPClientUtils](#class-httpmcpclientutils)
    - [func createDefaultHeaders](#func-createdefaultheaders)
    - [func extractErrorMessage](#func-extracterrormessage)
    - [func generateSessionId](#func-generatesessionid)
    - [func isSessionError](#func-issessionerror)
    - [func validateEndpoint](#func-validateendpoint)
  - [interface MCPClient](#interface-mcpclient)
    - [func callTool](#func-calltool)
    - [func callTool](#func-calltool-1)
    - [prop initParams](#prop-initparams-1)
  - [class SseMCPClient](#class-ssemcpclient)
    - [func init](#func-init-1)
    - [prop initParams](#prop-initparams-1)
  - [class SseMCPServer](#class-ssemcpserver)
    - [func init](#func-init-1)
    - [func loop](#func-loop)
    - [func start](#func-start)
    - [func startWith](#func-startwith)
    - [func startWith](#func-startwith-1)
  - [class StdioMCPClient](#class-stdiomcpclient)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
    - [prop initParams](#prop-initparams-1)
  - [class StdioMCPServer](#class-stdiomcpserver)
    - [func init](#func-init-1)
    - [func loop](#func-loop-1)
    - [func start](#func-start-1)
    - [func startWith](#func-startwith-1)
    - [func startWith](#func-startwith-1)
  - [enum ToolCallContent](#enum-toolcallcontent)
    - [enumeration Image](#enumeration-image)
    - [enumeration Text](#enumeration-text)
    - [func fromJsonValue](#func-fromjsonvalue)
    - [func getTypeSchema](#func-gettypeschema)
    - [func getValue](#func-getvalue)
    - [func toJsonValue](#func-tojsonvalue)

### class HttpMCPClient
#### func close
```
func close(): Unit
```
- Description: Closes the HTTP MCP client session.

#### func init
```
init(endpoint: String, headers!: Array<(String, String)> = [])
```
- Description: Initializes the HTTP MCP client with the specified endpoint and headers.
- Parameters:
  - `endpoint`: `String`, The URL endpoint for the MCP client.
  - `headers`: `Array<(String, String)>`, An array of header key-value pairs.

#### prop initParams
```
prop initParams: JsonObject
```
- Description: Gets the initialization parameters as a JSON object.


### class HttpMCPClientUtils
#### func createDefaultHeaders
```
static func createDefaultHeaders(sessionId: Option<String>): HashMap<String, String>
```
- Description: Creates default headers for HTTP MCP requests.
- Parameters:
  - `sessionId`: `Option<String>`, An optional session ID to include in the headers.

#### func extractErrorMessage
```
static func extractErrorMessage(responseBody: String): String
```
- Description: Extracts the error message from an MCP response.
- Parameters:
  - `responseBody`: `String`, The response body to extract the error message from.

#### func generateSessionId
```
static func generateSessionId(): String
```
- Description: Generates a secure session ID for the HTTP MCP client.

#### func isSessionError
```
static func isSessionError(responseBody: String): Bool
```
- Description: Checks if the response indicates a session error.
- Parameters:
  - `responseBody`: `String`, The response body to check.

#### func validateEndpoint
```
static func validateEndpoint(url: String): Bool
```
- Description: Validates the MCP endpoint URL format.
- Parameters:
  - `url`: `String`, The URL to validate.


### interface MCPClient
#### func callTool
```
func callTool(name: String, args: Array<(String, ToJsonValue)>): ToolResponse
```
- Description: Call a specified tool from the MCP server.
- Parameters:
  - `name`: `String`, Name of the tool to call.
  - `args`: `Array<(String, ToJsonValue)>`, Arguments for the tool call.

#### func callTool
```
func callTool(name: String, args: Array<(String, JsonValue)>): ToolResponse
```
- Description: Call a specified tool from the MCP server.
- Parameters:
  - `name`: `String`, Name of the tool to call.
  - `args`: `Array<(String, JsonValue)>`, Arguments for the tool call.

#### prop initParams
```
prop initParams: JsonObject
```
- Description: Get the parameters used when starting the MCP server.


### class SseMCPClient
#### func init
```
init(url: String)
```
- Description: Initializes the SseMCPClient with the specified URL.
- Parameters:
  - `url`: `String`, The URL to initialize the client with.

#### prop initParams
```
prop initParams: JsonObject
```
- Description: Gets the initialization parameters as a JsonObject.


### class SseMCPServer
#### func init
```
init(tools: Array<Tool>)
```
- Description: Initializes the SseMCPServer with a list of tools.
- Parameters:
  - `tools`: `Array<Tool>`, A list of tools to initialize the server with.

#### func loop
```
func loop(msg: String, uuid: String): Unit
```
- Description: Processes a message and sends a response if applicable.
- Parameters:
  - `msg`: `String`, The message to process.
  - `uuid`: `String`, The unique identifier for the client session.

#### func start
```
func start(host: String, port: UInt16): Unit
```
- Description: Starts the server on the specified host and port.
- Parameters:
  - `host`: `String`, The host address to start the server on.
  - `port`: `UInt16`, The port number to start the server on.

#### func startWith
```
public static func startWith(agents: Array<Agent>, host: String, port: UInt16): Unit
```
- Description: Starts the server with a list of agents on the specified host and port.
- Parameters:
  - `agents`: `Array<Agent>`, A list of agents to initialize the server with.
  - `host`: `String`, The host address to start the server on.
  - `port`: `UInt16`, The port number to start the server on.

#### func startWith
```
public static func startWith(tools: Array<Tool>, host: String, port: UInt16): Unit
```
- Description: Starts the server with a list of tools on the specified host and port.
- Parameters:
  - `tools`: `Array<Tool>`, A list of tools to initialize the server with.
  - `host`: `String`, The host address to start the server on.
  - `port`: `UInt16`, The port number to start the server on.


### class StdioMCPClient
#### func init
```
init(commandLine: String, env: Array<(String, String)> = [])
```
- Description: Initializes the MCP client with a command line string and environment variables.
- Parameters:
  - `commandLine`: `String`, The command line string to start the MCP server.
  - `env`: `Array<(String, String)>`, Environment variables for the MCP server process.

#### func init
```
init(command: String, args: Array<String>, env: Array<(String, String)> = [])
```
- Description: Initializes the MCP client with a command, arguments, and environment variables.
- Parameters:
  - `command`: `String`, The command to start the MCP server.
  - `args`: `Array<String>`, Arguments for the MCP server process.
  - `env`: `Array<(String, String)>`, Environment variables for the MCP server process.

#### prop initParams
```
prop initParams: JsonObject
```
- Description: Gets the initialization parameters of the MCP client as a JSON object.


### class StdioMCPServer
#### func init
```
init(tools: Array<Tool>)
```
- Description: Initializes the StdioMCPServer with the provided tools.
- Parameters:
  - `tools`: `Array<Tool>`, An array of tools to be used by the server.

#### func loop
```
func loop(): Unit
```
- Description: The main loop of the server that continuously receives and handles messages.

#### func start
```
func start(): Unit
```
- Description: Starts the server by initializing it and entering the main loop.

#### func startWith
```
static func startWith(agents: Array<Agent>): Unit
```
- Description: Merges all tools from each agent and starts a MCP server for these tools.
- Parameters:
  - `agents`: `Array<Agent>`, An array of agents whose tools are to be merged.

#### func startWith
```
static func startWith(tools: Array<Tool>): Unit
```
- Description: Starts a MCP server for the provided tools.
- Parameters:
  - `tools`: `Array<Tool>`, An array of tools to be used by the server.


### enum ToolCallContent
####  Image
```
Image(ImageContent)
```
- Description: Represents an image content tool call.

####  Text
```
Text(TextContent)
```
- Description: Represents a text content tool call.

#### func fromJsonValue
```
public static func fromJsonValue(json: JsonValue): ToolCallContent
```
- Description: Converts a JsonValue to ToolCallContent based on the 'type' field.
- Parameters:
  - `json`: `JsonValue`, The JsonValue to convert.

#### func getTypeSchema
```
public static func getTypeSchema(): TypeSchema
```
- Description: Throws JsonableException with message 'Unsupported method'.

#### func getValue
```
public func getValue(): String
```
- Description: Gets the string value of the ToolCallContent.

#### func toJsonValue
```
public func toJsonValue(): JsonValue
```
- Description: Converts the ToolCallContent to a JsonValue.


