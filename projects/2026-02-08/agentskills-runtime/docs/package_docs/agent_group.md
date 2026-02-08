## Package agent_group
- [Package agent_group](#package-agent_group)
  - [interface AgentCollaboration](#interface-agentcollaboration)
    - [func ()](#func-())
    - [func ()](#func-()-1)
    - [func <=](#func-<=)
    - [func |](#func-|)
  - [class FreeGroup](#class-freegroup)
    - [func asyncChat](#func-asyncchat)
    - [func chat](#func-chat)
    - [func chat](#func-chat-1)
    - [func discuss](#func-discuss)
    - [func init](#func-init)
    - [func operator []](#func-operator-[])
    - [func operator |](#func-operator-|)
  - [enum FreeGroupMode](#enum-freegroupmode)
    - [enumeration Auto](#enumeration-auto)
    - [enumeration RoundRobin](#enumeration-roundrobin)
  - [class LeaderGroup](#class-leadergroup)
    - [func asyncChat](#func-asyncchat-1)
    - [func chat](#func-chat-1)
    - [func chat](#func-chat-1)
    - [func operator[]](#func-operator[])
  - [class LinearGroup](#class-lineargroup)
    - [func []](#func-[])
    - [func asyncChat](#func-asyncchat-1)
    - [func chat](#func-chat-1)
    - [func chat](#func-chat-1)

### interface AgentCollaboration
#### func operator ()
```
operator func ()(prev: Agent): LinearGroup
```
- Description: Creates a LinearGroup starting with the given agent.
- Parameters:
  - `prev`: `Agent`, The agent to start the linear group with.

#### func operator ()
```
operator func ()(prev: LinearGroup): LinearGroup
```
- Description: Extends a LinearGroup with another LinearGroup.
- Parameters:
  - `prev`: `LinearGroup`, The existing LinearGroup to extend.

#### func operator <=
```
operator func <=(members: Array<Agent>): LeaderGroup
```
- Description: Creates a LeaderGroup from an array of agents.
- Parameters:
  - `members`: `Array<Agent>`, An array of agents to form the group.

#### func operator |
```
operator func |(member: Agent): FreeGroup
```
- Description: Creates a FreeGroup with the given agent.
- Parameters:
  - `member`: `Agent`, The agent to include in the FreeGroup.


### class FreeGroup
#### func asyncChat
```
asyncChat(request: AgentRequest): AsyncAgentResponse
```
- Description: Asynchronously processes a chat request (not supported)
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed

#### func chat
```
chat(request: AgentRequest): AgentResponse
```
- Description: Processes a chat request with default maximum rounds
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed

#### func chat
```
chat(request: AgentRequest, maxRound: Int64): AgentResponse
```
- Description: Processes a chat request with specified maximum rounds
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed
  - `maxRound`: `Int64`, Maximum number of discussion rounds

#### func discuss
```
discuss(topic: String, initiator: String, speech: String, mode: FreeGroupMode = FreeGroupMode.Auto, maxRound: Int64 = DISCUSSION_MAX_ROUND): String
```
- Description: Initiates a discussion on a topic with specified parameters
- Parameters:
  - `topic`: `String`, The topic of discussion
  - `initiator`: `String`, The initiator of the discussion
  - `speech`: `String`, The initial speech for the discussion
  - `mode`: `FreeGroupMode`, The mode of discussion (Auto or RoundRobin)
  - `maxRound`: `Int64`, Maximum number of discussion rounds

#### func init
```
init(a: Agent, b: Agent)
```
- Description: Initializes a FreeGroup with two agents
- Parameters:
  - `a`: `Agent`, First agent to be added to the group
  - `b`: `Agent`, Second agent to be added to the group

#### func operator operator []
```
operator [](memberName: String): Agent
```
- Description: Retrieves an agent member by name
- Parameters:
  - `memberName`: `String`, Name of the agent member to retrieve

#### func operator operator |
```
operator |(member: Agent): FreeGroup
```
- Description: Adds a new agent member to the group
- Parameters:
  - `member`: `Agent`, Agent to be added to the group


### enum FreeGroupMode
####  Auto
```
Auto
```
- Description: The speaker will be selected by LLM automatically

####  RoundRobin
```
RoundRobin
```
- Description: RoundRobin mode for speaker selection


### class LeaderGroup
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
func chat(request: AgentRequest, maxRound: Int64): AgentResponse
```
- Description: Processes a chat request with a specified maximum number of rounds and returns an agent response.
- Parameters:
  - `request`: `AgentRequest`, The chat request to be processed.
  - `maxRound`: `Int64`, The maximum number of rounds for the chat.

#### func operator operator[]
```
operator func [](memberName: String): Agent
```
- Description: Retrieves an agent member by name.
- Parameters:
  - `memberName`: `String`, The name of the agent member to retrieve.


### class LinearGroup
#### func operator []
```
operator func [](memberName: String): Agent
```
- Description: Throws an UnsupportedException when attempting to access a group member by name.
- Parameters:
  - `memberName`: `String`, The name of the member to access.

#### func asyncChat
```
func asyncChat(request: AgentRequest): AsyncAgentResponse
```
- Description: Processes a chat request asynchronously through all agents in the group, with the last agent processing asynchronously.
- Parameters:
  - `request`: `AgentRequest`, The initial request to be processed by the agent group.

#### func chat
```
func chat(request: AgentRequest): AgentResponse
```
- Description: Processes a chat request sequentially through all agents in the group.
- Parameters:
  - `request`: `AgentRequest`, The initial request to be processed by the agent group.

#### func chat
```
func chat(request: AgentRequest, maxRound: Int64): AgentResponse
```
- Description: Processes a chat request sequentially through all agents in the group with a specified maximum number of rounds.
- Parameters:
  - `request`: `AgentRequest`, The initial request to be processed by the agent group.
  - `maxRound`: `Int64`, The maximum number of rounds for processing the request.


