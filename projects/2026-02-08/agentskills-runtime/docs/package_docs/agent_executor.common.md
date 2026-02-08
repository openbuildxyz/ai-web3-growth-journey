## Package agent_executor.common
- [Package agent_executor.common](#package-agent_executor.common)
  - [class AgentExecutionInfo](#class-agentexecutioninfo)
    - [func addMessage](#func-addmessage)
    - [func addMessages](#func-addmessages)
    - [func addRequest](#func-addrequest)
    - [func addStepMessage](#func-addstepmessage)
    - [prop chatRound](#prop-chatround)
    - [prop events](#prop-events)
    - [func init](#func-init)
    - [func markCancellation](#func-markcancellation)
    - [prop messages](#prop-messages)
    - [func removeLastMessage](#func-removelastmessage)
    - [prop retrievalInfo](#prop-retrievalinfo)
    - [func setAnswer](#func-setanswer)

### class AgentExecutionInfo
#### func addMessage
```
func addMessage(msg: Message): Unit
```
- Description: Adds a single message to the execution.
- Parameters:
  - `msg`: `Message`, The message to be added.

#### func addMessages
```
func addMessages(msgs: Array<Message>): Unit
```
- Description: Adds multiple messages to the execution.
- Parameters:
  - `msgs`: `Array<Message>`, The messages to be added.

#### func addRequest
```
func addRequest(request: AgentRequest): Unit
```
- Description: Adds a new request to the execution and processes it.
- Parameters:
  - `request`: `AgentRequest`, The request to be added.

#### func addStepMessage
```
func addStepMessage(msg: Message): Unit
```
- Description: Adds a step message to the execution.
- Parameters:
  - `msg`: `Message`, The step message to be added.

#### prop chatRound
```
prop chatRound: ChatRound
```
- Description: Gets the chat round information for this execution.

#### prop events
```
prop events: EventStream
```
- Description: Gets the event stream associated with this execution.

#### func init
```
init(agent: Agent, request: AgentRequest)
```
- Description: Initializes the AgentExecutionInfo with the given agent and request.
- Parameters:
  - `agent`: `Agent`, The agent associated with this execution.
  - `request`: `AgentRequest`, The request associated with this execution.

#### func markCancellation
```
func markCancellation(): Unit
```
- Description: Marks the execution as cancelled.

#### prop messages
```
prop messages: MessageList
```
- Description: Gets the list of messages associated with this execution.

#### func removeLastMessage
```
func removeLastMessage(): Unit
```
- Description: Removes the last message from the execution.

#### prop retrievalInfo
```
prop retrievalInfo: ArrayList<RetrievalInfo>
```
- Description: Gets the retrieval information associated with this execution.

#### func setAnswer
```
func setAnswer(answer: String): Unit
```
- Description: Sets the answer for the execution.
- Parameters:
  - `answer`: `String`, The answer to be set.


