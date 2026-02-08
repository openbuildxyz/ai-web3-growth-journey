## Package agent_executor.naive
- [Package agent_executor.naive](#package-agent_executor.naive)
  - [class NaiveExecutor](#class-naiveexecutor)
    - [func asyncRun](#func-asyncrun)
    - [prop name](#prop-name)
    - [func run](#func-run)

### class NaiveExecutor
#### func asyncRun
```
func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse
```
- Description: Executes the agent task asynchronously.
- Parameters:
  - `agent`: `Agent`, The agent to execute.
  - `request`: `AgentRequest`, The request to process.

#### prop name
```
prop name: String
```
- Description: Gets the name of the executor.

#### func run
```
func run(agent: Agent, request: AgentRequest): AgentResponse
```
- Description: Executes the agent task synchronously.
- Parameters:
  - `agent`: `Agent`, The agent to execute.
  - `request`: `AgentRequest`, The request to process.


