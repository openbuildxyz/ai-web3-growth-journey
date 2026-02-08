## Package agent_executor.react
- [Package agent_executor.react](#package-agent_executor.react)
  - [class ReactExecutor](#class-reactexecutor)
    - [func asyncRun](#func-asyncrun)
    - [prop name](#prop-name)
    - [func run](#func-run)

### class ReactExecutor
#### func asyncRun
```
override public func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse
```
- Description: Executes the agent's task asynchronously.
- Parameters:
  - `agent`: `Agent`, The agent to execute.
  - `request`: `AgentRequest`, The request to process.

#### prop name
```
override public prop name: String
```
- Description: Gets the name of the executor.

#### func run
```
override public func run(agent: Agent, request: AgentRequest): AgentResponse
```
- Description: Executes the agent's task synchronously.
- Parameters:
  - `agent`: `Agent`, The agent to execute.
  - `request`: `AgentRequest`, The request to process.


