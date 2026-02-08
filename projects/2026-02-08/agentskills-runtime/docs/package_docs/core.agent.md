## Package core.agent
- [Package core.agent](#package-core.agent)
  - [interface Agent](#interface-agent)
    - [func asyncChat](#func-asyncchat)
    - [func chat](#func-chat)
    - [prop description](#prop-description)
    - [prop eventHandlerManager](#prop-eventhandlermanager)
    - [prop executor](#prop-executor)
    - [prop interceptor](#prop-interceptor)
    - [prop memory](#prop-memory)
    - [prop model](#prop-model)
    - [prop name](#prop-name)
    - [prop retriever](#prop-retriever)
    - [prop systemPrompt](#prop-systemprompt)
    - [prop temperature](#prop-temperature)
    - [prop toolManager](#prop-toolmanager)
  - [class AgentCancelException](#class-agentcancelexception)
    - [func init](#func-init)
  - [interface AgentExecution](#interface-agentexecution)
    - [prop chatRound](#prop-chatround)
    - [prop events](#prop-events)
    - [func markCancellation](#func-markcancellation)
    - [prop messages](#prop-messages)
    - [prop retrievalInfo](#prop-retrievalinfo)
    - [func setAnswer](#func-setanswer)
  - [class AgentExecutionException](#class-agentexecutionexception)
    - [func init](#func-init-1)
  - [interface AgentExecutor](#interface-agentexecutor)
    - [func asyncRun](#func-asyncrun)
    - [prop name](#prop-name-1)
    - [func run](#func-run)
  - [interface AgentGroup](#interface-agentgroup)
    - [func asyncChat](#func-asyncchat-1)
    - [func chat](#func-chat-1)
    - [func chat](#func-chat-1)
    - [func operator []](#func-operator-[])
  - [class AgentRequest](#class-agentrequest)
    - [let conversation](#let-conversation)
    - [let image](#let-image)
    - [func init](#func-init-1)
    - [let maxTool](#let-maxtool)
    - [let question](#let-question)
    - [let verbose](#let-verbose)
  - [class AgentResponse](#class-agentresponse)
    - [prop content](#prop-content)
    - [prop execution](#prop-execution)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
    - [func next](#func-next)
    - [prop status](#prop-status)
  - [class AsyncAgentResponse](#class-asyncagentresponse)
    - [func addFinishFn](#func-addfinishfn)
    - [func cancel](#func-cancel)
    - [prop content](#prop-content-1)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
    - [func next](#func-next-1)
    - [prop status](#prop-status-1)
  - [class Interceptor](#class-interceptor)
    - [func init](#func-init-1)
  - [enum InterceptorMode](#enum-interceptormode)
    - [enumeration Always](#enumeration-always)
    - [enumeration Conditional](#enumeration-conditional)
    - [enumeration Periodic](#enumeration-periodic)

### interface Agent
#### func asyncChat
```
func asyncChat(request: AgentRequest): AsyncAgentResponse
```
- Description: Query the agent and get the answer. It returns the agent reply in stream.
- Parameters:
  - `request`: `AgentRequest`, The request to the agent

#### func chat
```
func chat(request: AgentRequest): AgentResponse
```
- Description: Query the agent and get the answer. It may throw AgentExecutionException.
- Parameters:
  - `request`: `AgentRequest`, The request to the agent

#### prop description
```
prop description: String
```
- Description: Functionality description of the agent

#### prop eventHandlerManager
```
prop eventHandlerManager: Option<Object>
```
- Description: The agent event handler manager, since there is cycle dependency between agent and event handler manager, we use Object instead of EventHandlerManager.

#### prop executor
```
mut prop executor: AgentExecutor
```
- Description: The underlying agent executor

#### prop interceptor
```
mut prop interceptor: Option<Interceptor>
```
- Description: Set the agent interceptor

#### prop memory
```
mut prop memory: Option<Memory>
```
- Description: Memory the agent will use

#### prop model
```
mut prop model: ChatModel
```
- Description: Chat model the agent will use

#### prop name
```
prop name: String
```
- Description: Name of the agent

#### prop retriever
```
mut prop retriever: Option<Retriever>
```
- Description: Retriever the agent can use

#### prop systemPrompt
```
mut prop systemPrompt: String
```
- Description: System prompt of the agent

#### prop temperature
```
mut prop temperature: Option<Float64>
```
- Description: Temperature the agent will pass to the LLM

#### prop toolManager
```
prop toolManager: ToolManager
```
- Description: Tools the agent can use


### class AgentCancelException
#### func init
```
init(reason!: String = "Cancelled by user")
```
- Description: Initializes a new instance of AgentCancelException with the specified reason.
- Parameters:
  - `reason`: `String`, The reason for the cancellation, defaults to "Cancelled by user".


### interface AgentExecution
#### prop chatRound
```
prop chatRound: ChatRound
```
- Description: The current chat round, including the question, internal assistant execution messages, and the answer

#### prop events
```
prop events: EventStream
```
- Description: Only access this field when setting `verbose: true` in AgentRequest

#### func markCancellation
```
func markCancellation(): Unit
```
- Description: Set the cancellation mark

#### prop messages
```
prop messages: MessageList
```
- Description: Complete messages, including system prompts, user questions, internal assistant messages

#### prop retrievalInfo
```
prop retrievalInfo: ArrayList<RetrievalInfo>
```
- Description: RAG info when used

#### func setAnswer
```
func setAnswer(answer: String): Unit
```
- Description: Internally used thought it's public
- Parameters:
  - `answer`: `String`, The answer to set


### class AgentExecutionException
#### func init
```
init(msg: String)
```
- Description: Constructor for AgentExecutionException
- Parameters:
  - `msg`: `String`, Exception message


### interface AgentExecutor
#### func asyncRun
```
func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse
```
- Description: Executes the agent asynchronously with the given request.
- Parameters:
  - `agent`: `Agent`, The agent to be executed.
  - `request`: `AgentRequest`, The request to be processed by the agent.

#### prop name
```
prop name: String
```
- Description: The name of the agent executor.

#### func run
```
func run(agent: Agent, request: AgentRequest): AgentResponse
```
- Description: Executes the agent synchronously with the given request.
- Parameters:
  - `agent`: `Agent`, The agent to be executed.
  - `request`: `AgentRequest`, The request to be processed by the agent.


### interface AgentGroup
#### func asyncChat
```
func asyncChat(request: AgentRequest): AsyncAgentResponse
```
- Description: Processes a chat request asynchronously and returns an async agent response.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed asynchronously.

#### func chat
```
func chat(request: AgentRequest): AgentResponse
```
- Description: Processes a chat request and returns an agent response.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed.

#### func chat
```
func chat(request: AgentRequest, maxRound!: Int64): AgentResponse
```
- Description: Processes a chat request with a specified maximum number of rounds and returns an agent response.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed.
  - `maxRound!`: `Int64`, The maximum number of rounds for the chat.

#### func operator operator []
```
operator func [](memberName: String): Agent
```
- Description: Finds the agent according to its name.
- Parameters:
  - `memberName`: `String`, The name of the agent to find.


### class AgentRequest
#### let conversation
```
let conversation: Option<Conversation>
```
- Description: Conversation between the user and agent

#### let image
```
let image: Option<String>
```
- Description: The user input question for using VLM

#### func init
```
public init(question: String, image!: Option<String> = None, conversation!: Option<Conversation> = None, verbose!: Bool = false, maxTool!: Int64 = 10)
```
- Description: Constructor for AgentRequest
- Parameters:
  - `question`: `String`, The current user question
  - `image`: `Option<String>`, The user input question for using VLM
  - `conversation`: `Option<Conversation>`, Conversation between the user and agent
  - `verbose`: `Bool`, Dump internal execution information
  - `maxTool`: `Int64`, The maximum number of tools that can be used when enable tool filter

#### let maxTool
```
let maxTool: Int64
```
- Description: The maximum number of tools that can be used when enable tool filter

#### let question
```
let question: String
```
- Description: The current user question

#### let verbose
```
let verbose: Bool
```
- Description: Dump internal execution information


### class AgentResponse
#### prop content
```
open public prop content: String
```
- Description: The content of the agent response

#### prop execution
```
public prop execution: AgentExecution
```
- Description: The execution details of the agent

#### func init
```
public init(status: AgentResponseStatus, content: String)
```
- Description: Initializes the agent response with status and content
- Parameters:
  - `status`: `AgentResponseStatus`, The status of the agent response
  - `content`: `String`, The content of the agent response

#### func init
```
public init(status: AgentResponseStatus, content: String, execution: AgentExecution)
```
- Description: Initializes the agent response with status, content, and execution details
- Parameters:
  - `status`: `AgentResponseStatus`, The status of the agent response
  - `content`: `String`, The content of the agent response
  - `execution`: `AgentExecution`, The execution details of the agent

#### func next
```
open override public func next(): Option<String>
```
- Description: Returns the next item in the iterator, which is None by default

#### prop status
```
open public prop status: AgentResponseStatus
```
- Description: The status of the agent response


### class AsyncAgentResponse
#### func addFinishFn
```
public func addFinishFn(fn: (Bool) -> Unit)
```
- Description: Sets the callback function to be called when the execution is finished.
- Parameters:
  - `fn`: `(Bool) -> Unit`, A function that takes a boolean indicating whether the response succeeded.

#### func cancel
```
public func cancel(blocking: Bool): Unit
```
- Description: Cancels the agent execution. If blocking is true, waits until the execution is stopped.
- Parameters:
  - `blocking`: `Bool`, If true, waits until the execution is stopped.

#### prop content
```
override public prop content: String
```
- Description: The final result of the agent execution. This is a synchronous method that waits until the executor completes.

#### func init
```
init(chunks: Iterator<String>)
```
- Description: Initializes the AsyncAgentResponse with the given chunks.
- Parameters:
  - `chunks`: `Iterator<String>`, An iterator of strings representing the chunks of the response.

#### func init
```
init(chunks: Iterator<String>, execution: AgentExecution)
```
- Description: Initializes the AsyncAgentResponse with the given chunks and execution.
- Parameters:
  - `chunks`: `Iterator<String>`, An iterator of strings representing the chunks of the response.
  - `execution`: `AgentExecution`, The agent execution associated with the response.

#### func next
```
override public func next(): Option<String>
```
- Description: Retrieves the next chunk of the response. If the execution is finished, returns None.

#### prop status
```
override public prop status: AgentResponseStatus
```
- Description: The status of the response. This is a synchronous method that waits until the executor completes.


### class Interceptor
#### func init
```
init(agent: Agent, mode!: InterceptorMode = InterceptorMode.Always)
```
- Description: Initializes a new Interceptor instance with the specified agent and mode.
- Parameters:
  - `agent`: `Agent`, The agent to be intercepted.
  - `mode`: `InterceptorMode`, The interception mode, defaults to InterceptorMode.Always.


### enum InterceptorMode
####  Always
```
Always
```
- Description: Always intercept the request

####  Conditional
```
Conditional((AgentRequest) -> Bool)
```
- Description: Intercept the request when the condition is true
- Parameters:
  - `AgentRequest`: `AgentRequest`, Request to evaluate
  - `Bool`: `Bool`, Condition result

####  Periodic
```
Periodic(Int64)
```
- Description: Intercept the request periodically
- Parameters:
  - `Int64`: `Int64`, Period interval


