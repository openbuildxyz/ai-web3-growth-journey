## Package agent.base
- [Package agent.base](#package-agent.base)
  - [struct AgentOp](#struct-agentop)
    - [func chatLLM](#func-chatllm)
    - [func handle](#func-handle)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func handle](#func-handle-1)
    - [func parseToolRequests](#func-parsetoolrequests)
    - [func preprocessRequest](#func-preprocessrequest)
  - [class BaseAgent](#class-baseagent)
    - [prop description](#prop-description)
    - [prop eventHandlerManager](#prop-eventhandlermanager)
    - [prop executor](#prop-executor)
    - [func init](#func-init)
    - [prop interceptor](#prop-interceptor)
    - [prop memory](#prop-memory)
    - [prop model](#prop-model)
    - [prop name](#prop-name)
    - [prop retriever](#prop-retriever)
    - [prop systemPrompt](#prop-systemprompt)
    - [prop temperature](#prop-temperature)
    - [prop toolManager](#prop-toolmanager)

### struct AgentOp
#### func chatLLM
```
public static func chatLLM(agent: Agent, messages: MessageList, stop!: Option<Array<String>> = None, tools!: Array<Tool> = [], forRequest!: AgentRequest): Option<ChatResponse>
```
- Description: Handles chat with LLM model
- Parameters:
  - `agent`: `Agent`, The agent initiating the chat
  - `messages`: `MessageList`, List of messages for the chat
  - `stop`: `Option<Array<String>>`, Optional stop conditions for the chat
  - `tools`: `Array<Tool>`, Optional tools to be used in the chat
  - `forRequest`: `AgentRequest`, The request associated with the chat

#### func handle
```
static public func handle(event!: ToolCallStartEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ToolResponse>
```
- Description: Handles ToolCallStartEvent
- Parameters:
  - `event`: `ToolCallStartEvent`, The ToolCallStartEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: ToolCallEndEvent, forRequest!: Option<AgentRequest> = None): Unit
```
- Description: Handles ToolCallEndEvent
- Parameters:
  - `event`: `ToolCallEndEvent`, The ToolCallEndEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: ToolCallRepeatEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ToolResponse>
```
- Description: Handles ToolCallRepeatEvent
- Parameters:
  - `event`: `ToolCallRepeatEvent`, The ToolCallRepeatEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: ChatModelStartEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ChatResponse>
```
- Description: Handles ChatModelStartEvent
- Parameters:
  - `event`: `ChatModelStartEvent`, The ChatModelStartEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: ChatModelEndEvent, forRequest!: Option<AgentRequest> = None): Unit
```
- Description: Handles ChatModelEndEvent
- Parameters:
  - `event`: `ChatModelEndEvent`, The ChatModelEndEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: ChatModelFailureEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ChatResponse>
```
- Description: Handles ChatModelFailureEvent
- Parameters:
  - `event`: `ChatModelFailureEvent`, The ChatModelFailureEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: AgentStartEvent): EventResponse<AgentResponse>
```
- Description: Handles AgentStartEvent
- Parameters:
  - `event`: `AgentStartEvent`, The AgentStartEvent to handle

#### func handle
```
static public func handle(event!: AgentEndEvent): Unit
```
- Description: Handles AgentEndEvent
- Parameters:
  - `event`: `AgentEndEvent`, The AgentEndEvent to handle

#### func handle
```
static public func handle(event!: SubAgentStartEvent): EventResponse<AgentResponse>
```
- Description: Handles SubAgentStartEvent
- Parameters:
  - `event`: `SubAgentStartEvent`, The SubAgentStartEvent to handle

#### func handle
```
static public func handle(event!: SubAgentEndEvent): Unit
```
- Description: Handles SubAgentEndEvent
- Parameters:
  - `event`: `SubAgentEndEvent`, The SubAgentEndEvent to handle

#### func handle
```
static public func handle(event!: AgentTimeoutEvent, forRequest!: Option<AgentRequest> = None): Unit
```
- Description: Handles AgentTimeoutEvent
- Parameters:
  - `event`: `AgentTimeoutEvent`, The AgentTimeoutEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: UserInputEvent, forRequest!: Option<AgentRequest> = None): EventResponse<String>
```
- Description: Handles UserInputEvent
- Parameters:
  - `event`: `UserInputEvent`, The UserInputEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func handle
```
static public func handle(event!: NotifyEvent, forRequest!: Option<AgentRequest> = None): Unit
```
- Description: Handles NotifyEvent
- Parameters:
  - `event`: `NotifyEvent`, The NotifyEvent to handle
  - `forRequest`: `Option<AgentRequest>`, Optional request associated with the event

#### func parseToolRequests
```
public static func parseToolRequests(agent: Agent, chatResp: ChatResponse, forRequest!: AgentRequest): Array<ToolRequest>
```
- Description: Parse the tool request from the chat response
- Parameters:
  - `agent`: `Agent`, The agent initiating the tool request
  - `chatResp`: `ChatResponse`, The chat response containing tool requests
  - `forRequest`: `AgentRequest`, The request associated with the tool requests

#### func preprocessRequest
```
public static func preprocessRequest(request: AgentRequest): AgentRequest
```
- Description: Preprocess AgentRequest to resolve file imports
- Parameters:
  - `request`: `AgentRequest`, The AgentRequest to be preprocessed


### class BaseAgent
#### prop description
```
override public prop description: String
```
- Description: Gets the description of the agent.

#### prop eventHandlerManager
```
override public prop eventHandlerManager: Option<Object>
```
- Description: Gets the event handler manager of the agent.

#### prop executor
```
override public mut prop executor: AgentExecutor
```
- Description: Gets or sets the executor of the agent.

#### func init
```
public init(model!: ChatModel, name!: String = "Base Agent", description!: String = "", temperature!: Option<Float64> = None, systemPrompt!: String = "", toolManager!: ToolManager = SimpleToolManager(), executor!: Option<AgentExecutor> = None, retriever!: Option<Retriever> = None, memory!: Option<Memory> = None, interceptor!: Option<Interceptor> = None, eventHandlerManager!: Option<EventHandlerManager> = None)
```
- Description: Constructor for BaseAgent class.
- Parameters:
  - `model`: `ChatModel`, The chat model to be used by the agent.
  - `name`: `String`, The name of the agent, defaults to "Base Agent".
  - `description`: `String`, A description of the agent, defaults to an empty string.
  - `temperature`: `Option<Float64>`, The temperature setting for the agent, defaults to None.
  - `systemPrompt`: `String`, The system prompt for the agent, defaults to an empty string.
  - `toolManager`: `ToolManager`, The tool manager for the agent, defaults to SimpleToolManager.
  - `executor`: `Option<AgentExecutor>`, The executor for the agent, defaults to None.
  - `retriever`: `Option<Retriever>`, The retriever for the agent, defaults to None.
  - `memory`: `Option<Memory>`, The memory for the agent, defaults to None.
  - `interceptor`: `Option<Interceptor>`, The interceptor for the agent, defaults to None.
  - `eventHandlerManager`: `Option<EventHandlerManager>`, The event handler manager for the agent, defaults to None.

#### prop interceptor
```
override public mut prop interceptor: Option<Interceptor>
```
- Description: Gets or sets the interceptor of the agent.

#### prop memory
```
override public mut prop memory: Option<Memory>
```
- Description: Gets or sets the memory of the agent.

#### prop model
```
override public mut prop model: ChatModel
```
- Description: Gets or sets the chat model of the agent.

#### prop name
```
override public prop name: String
```
- Description: Gets the name of the agent.

#### prop retriever
```
override public mut prop retriever: Option<Retriever>
```
- Description: Gets or sets the retriever of the agent.

#### prop systemPrompt
```
override public mut prop systemPrompt: String
```
- Description: Gets or sets the system prompt of the agent.

#### prop temperature
```
override public mut prop temperature: Option<Float64>
```
- Description: Gets or sets the temperature setting of the agent.

#### prop toolManager
```
override public prop toolManager: ToolManager
```
- Description: Gets the tool manager of the agent.


