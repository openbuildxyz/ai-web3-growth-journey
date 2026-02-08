## Package agent
- [Package agent](#package-agent)
  - [class AiFuncAgent](#class-aifuncagent)
    - [func run](#func-run)
  - [class ConversationAgent](#class-conversationagent)
    - [func asyncChat](#func-asyncchat)
    - [func chat](#func-chat)
    - [let conversation](#let-conversation)
    - [func init](#func-init)
  - [class DispatchAgent](#class-dispatchagent)
    - [func asyncChat](#func-asyncchat-1)
    - [func chat](#func-chat-1)
    - [func init](#func-init-1)
  - [class GroupAsAgent](#class-groupasagent)
    - [func asyncChat](#func-asyncchat-1)
    - [func chat](#func-chat-1)
    - [func init](#func-init-1)
  - [class HumanAgent](#class-humanagent)
    - [func chat](#func-chat-1)
    - [func init](#func-init-1)
  - [class ToolAgent<T>](#class-toolagent<t>)
    - [func chat](#func-chat-1)
    - [func init](#func-init-1)
  - [class ToolSelectAgent](#class-toolselectagent)
    - [func init](#func-init-1)
    - [func select](#func-select)

### class AiFuncAgent
#### func run
```
func run<T>(args: Array<JsonValue>): T where T <: Jsonable<T>
```
- Description: Executes the AI function with the provided arguments and returns the result in the specified type.
- Parameters:
  - `args`: `Array<JsonValue>`, An array of JSON values representing the arguments to the AI function.


### class ConversationAgent
#### func asyncChat
```
override public func asyncChat(request: AgentRequest): AsyncAgentResponse
```
- Description: Processes a chat request asynchronously and saves the chat round to the conversation.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed asynchronously.

#### func chat
```
override public func chat(request: AgentRequest): AgentResponse
```
- Description: Processes a chat request and saves the chat round to the conversation.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed.

#### let conversation
```
public let conversation: Conversation
```
- Description: A conversation instance that saves chat messages.

#### func init
```
public init(agent: Agent, conversation!: Option<Conversation> = None)
```
- Description: Initializes the ConversationAgent with an existing agent and an optional conversation.
- Parameters:
  - `agent`: `Agent`, The agent to be wrapped.
  - `conversation`: `Option<Conversation>`, An optional conversation instance. If not provided, a new conversation is created.


### class DispatchAgent
#### func asyncChat
```
func asyncChat(request: AgentRequest): AsyncAgentResponse
```
- Description: Asynchronously processes the chat request by dispatching it to the appropriate agent.
- Parameters:
  - `request`: `AgentRequest`, The request containing the user's question and other relevant data.

#### func chat
```
func chat(request: AgentRequest): AgentResponse
```
- Description: Processes the chat request by dispatching it to the appropriate agent.
- Parameters:
  - `request`: `AgentRequest`, The request containing the user's question and other relevant data.

#### func init
```
init(model: String)
```
- Description: Initialize the DispatchAgent with a specified model.
- Parameters:
  - `model`: `String`, The model identifier used to create the chat model.


### class GroupAsAgent
#### func asyncChat
```
func asyncChat(request: AgentRequest): AsyncAgentResponse
```
- Description: Processes the chat request asynchronously by dispatching it to the group and returns the response.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed asynchronously.

#### func chat
```
func chat(request: AgentRequest): AgentResponse
```
- Description: Processes the chat request by dispatching it to the group and returns the response.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed.

#### func init
```
init(group: AgentGroup, description!: String)
```
- Description: Initializes the GroupAsAgent with a group and a description.
- Parameters:
  - `group`: `AgentGroup`, The agent group to which the question will be dispatched.
  - `description`: `String`, The description of the agent.


### class HumanAgent
#### func chat
```
func chat(request: AgentRequest): AgentResponse
```
- Description: Processes a chat request by using the provided question-answering function to generate a response.
- Parameters:
  - `request`: `AgentRequest`, The request containing the question to be answered.

#### func init
```
init(qaFunc!: Option<(String) -> String> = None)
```
- Description: Initializes the HumanAgent with an optional question-answering function. If no function is provided, it defaults to a console UI.
- Parameters:
  - `qaFunc`: `Option<(String) -> String>`, An optional function that takes a String and returns a String, used for answering questions.


### class ToolAgent<T>
#### func chat
```
override public func chat(request: AgentRequest): AgentResponse
```
- Description: Processes the incoming AgentRequest by executing the provided function and returns an AgentResponse.
- Parameters:
  - `request`: `AgentRequest`, The request containing the question to be processed by the function.

#### func init
```
public init(fn!: (String) -> T)
```
- Description: Initializes the ToolAgent with a function that processes a String input and returns a generic type T.
- Parameters:
  - `fn`: `(String) -> T`, A function that takes a String input and returns a generic type T.


### class ToolSelectAgent
#### func init
```
init(model: ChatModel, tools: Array<Tool>)
```
- Description: Initializes the ToolSelectAgent with a chat model and a list of tools.
- Parameters:
  - `model`: `ChatModel`, The chat model used by the agent.
  - `tools`: `Array<Tool>`, The list of tools available for selection.

#### func select
```
func select(question: String): Option<ToolRequest>
```
- Description: Selects a tool to use for the given question.
- Parameters:
  - `question`: `String`, The question for which a tool needs to be selected.


