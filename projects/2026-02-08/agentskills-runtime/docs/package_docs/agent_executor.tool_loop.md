## Package agent_executor.tool_loop
- [Package agent_executor.tool_loop](#package-agent_executor.tool_loop)
  - [class ToolLoopExecutor](#class-toolloopexecutor)
    - [func asyncRun](#func-asyncrun)
    - [prop name](#prop-name)
    - [func run](#func-run)

### class ToolLoopExecutor
#### func asyncRun
```
override public func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse
```
- Description: Executes the agent task asynchronously and returns a future iterator of the response.
- Parameters:
  - `agent`: `Agent`, The agent to be executed asynchronously.
  - `request`: `AgentRequest`, The request containing the details for the agent execution.

#### prop name
```
override public prop name: String
```
- Description: Returns the name of the executor as 'tool-loop'.

#### func run
```
override public func run(agent: Agent, request: AgentRequest): AgentResponse
```
- Description: Executes the agent task synchronously and returns the response.
- Parameters:
  - `agent`: `Agent`, The agent to be executed.
  - `request`: `AgentRequest`, The request containing the details for the agent execution.


