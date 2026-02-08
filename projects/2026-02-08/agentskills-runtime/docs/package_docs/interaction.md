## Package interaction
- [Package interaction](#package-interaction)
  - [class AgentEndEvent](#class-agentendevent)
    - [func toString](#func-tostring)
  - [class AgentStartEvent](#class-agentstartevent)
    - [func toString](#func-tostring-1)
  - [class AgentTimeoutEvent](#class-agenttimeoutevent)
    - [func toString](#func-tostring-1)
  - [class ChatModelEndEvent](#class-chatmodelendevent)
    - [func toString](#func-tostring-1)
  - [class ChatModelFailureEvent](#class-chatmodelfailureevent)
    - [func toString](#func-tostring-1)
  - [class ChatModelStartEvent](#class-chatmodelstartevent)
    - [func toString](#func-tostring-1)
  - [class ConsolePrinter](#class-consoleprinter)
    - [func init](#func-init)
    - [func on](#func-on)
    - [func on](#func-on-1)
    - [func print](#func-print)
  - [class EventHandlerManager](#class-eventhandlermanager)
    - [func addHandler](#func-addhandler)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [func addHandler](#func-addhandler-1)
    - [prop global](#prop-global)
  - [enum EventResponse](#enum-eventresponse)
    - [enumeration Continue](#enumeration-continue)
    - [enumeration Continue](#enumeration-continue-1)
    - [enumeration Terminate](#enumeration-terminate)
  - [class NotifyEvent](#class-notifyevent)
    - [func toString](#func-tostring-1)
  - [class SubAgentEndEvent](#class-subagentendevent)
    - [func toString](#func-tostring-1)
  - [class SubAgentStartEvent](#class-subagentstartevent)
    - [func toString](#func-tostring-1)
  - [class ToolCallEndEvent](#class-toolcallendevent)
    - [func toString](#func-tostring-1)
  - [class ToolCallRepeatEvent](#class-toolcallrepeatevent)
    - [func toString](#func-tostring-1)
  - [class ToolCallStartEvent](#class-toolcallstartevent)
    - [func toString](#func-tostring-1)
  - [class UserInputEvent](#class-userinputevent)
    - [func toString](#func-tostring-1)

### class AgentEndEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class AgentStartEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class AgentTimeoutEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class ChatModelEndEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class ChatModelFailureEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class ChatModelStartEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class ConsolePrinter
#### func init
```
init(asyncResponse: AsyncAgentResponse)
```
- Description: Initializes the ConsolePrinter with an AsyncAgentResponse.
- Parameters:
  - `asyncResponse`: `AsyncAgentResponse`, The async response to be processed.

#### func on
```
on(event: NotifyEvent): Unit
```
- Description: Handles NotifyEvent by printing the event tag and content.
- Parameters:
  - `event`: `NotifyEvent`, The notification event to be processed.

#### func on
```
on(event: ToolCallStartEvent): Unit
```
- Description: Handles ToolCallStartEvent by printing the event tag and tool request.
- Parameters:
  - `event`: `ToolCallStartEvent`, The tool call start event to be processed.

#### func print
```
print(asyncResponse: AsyncAgentResponse, verbose: Bool = false): Unit
```
- Description: Prints the async response with optional verbose output.
- Parameters:
  - `asyncResponse`: `AsyncAgentResponse`, The async response to be printed.
  - `verbose`: `Bool`, If true, prints verbose output.


### class EventHandlerManager
#### func addHandler
```
public func addHandler(handler: ToolCallStartEventHandler): Unit
```
- Description: Adds a ToolCallStartEventHandler to the manager.
- Parameters:
  - `handler`: `ToolCallStartEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: ToolCallEndEventHandler): Unit
```
- Description: Adds a ToolCallEndEventHandler to the manager.
- Parameters:
  - `handler`: `ToolCallEndEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: ToolCallRepeatEventHandler): Unit
```
- Description: Adds a ToolCallRepeatEventHandler to the manager.
- Parameters:
  - `handler`: `ToolCallRepeatEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: ChatModelStartEventHandler): Unit
```
- Description: Adds a ChatModelStartEventHandler to the manager.
- Parameters:
  - `handler`: `ChatModelStartEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: ChatModelEndEventHandler): Unit
```
- Description: Adds a ChatModelEndEventHandler to the manager.
- Parameters:
  - `handler`: `ChatModelEndEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: ChatModelFailureEventHandler): Unit
```
- Description: Adds a ChatModelFailureEventHandler to the manager.
- Parameters:
  - `handler`: `ChatModelFailureEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: AgentStartEventHandler): Unit
```
- Description: Adds an AgentStartEventHandler to the manager.
- Parameters:
  - `handler`: `AgentStartEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: AgentEndEventHandler): Unit
```
- Description: Adds an AgentEndEventHandler to the manager.
- Parameters:
  - `handler`: `AgentEndEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: SubAgentStartEventHandler): Unit
```
- Description: Adds a SubAgentStartEventHandler to the manager.
- Parameters:
  - `handler`: `SubAgentStartEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: SubAgentEndEventHandler): Unit
```
- Description: Adds a SubAgentEndEventHandler to the manager.
- Parameters:
  - `handler`: `SubAgentEndEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: AgentTimeoutEventHandler): Unit
```
- Description: Adds an AgentTimeoutEventHandler to the manager.
- Parameters:
  - `handler`: `AgentTimeoutEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: UserInputEventHandler): Unit
```
- Description: Adds a UserInputEventHandler to the manager.
- Parameters:
  - `handler`: `UserInputEventHandler`, The handler to be added.

#### func addHandler
```
public func addHandler(handler: NotifyEventHandler): Unit
```
- Description: Adds a NotifyEventHandler to the manager.
- Parameters:
  - `handler`: `NotifyEventHandler`, The handler to be added.

#### prop global
```
public static prop global: EventHandlerManager
```
- Description: Gets the global instance of EventHandlerManager.


### enum EventResponse
####  Continue
```
Continue
```
- Description: Agent continues to work

####  Continue
```
Continue(T)
```
- Description: Continues with a specific result
- Parameters:
  - `T`: `T`, Specific result to continue with

####  Terminate
```
Terminate(T)
```
- Description: Abort execution with a result
- Parameters:
  - `T`: `T`, Result to terminate with


### class NotifyEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event including kind, tag, and content.


### class SubAgentEndEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class SubAgentStartEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class ToolCallEndEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class ToolCallRepeatEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class ToolCallStartEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


### class UserInputEvent
#### func toString
```
func toString(): String
```
- Description: Returns a string representation of the event.


