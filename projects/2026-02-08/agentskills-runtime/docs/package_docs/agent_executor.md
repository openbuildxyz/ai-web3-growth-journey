## Package agent_executor
- [Package agent_executor](#package-agent_executor)
  - [struct AgentExecutorManager](#struct-agentexecutormanager)
    - [func create](#func-create)
    - [func register](#func-register)
    - [func register](#func-register-1)

### struct AgentExecutorManager
#### func create
```
public static func create(name: String): AgentExecutor
```
- Description: Creates an AgentExecutor based on the provided name.
- Parameters:
  - `name`: `String`, The name of the executor to create.

#### func register
```
public static func register(name: String, buildFn: () -> AgentExecutor): Unit
```
- Description: Registers a new AgentExecutor builder with a specific name and a build function.
- Parameters:
  - `name`: `String`, The name of the executor to register.
  - `buildFn`: `() -> AgentExecutor`, A function that builds the AgentExecutor.

#### func register
```
public static func register(checkFn: (String) -> Bool, buildFn: (String) -> AgentExecutor): Unit
```
- Description: Registers a new AgentExecutor builder with a check function and a build function.
- Parameters:
  - `checkFn`: `(String) -> Bool`, A function that checks if the executor name matches.
  - `buildFn`: `(String) -> AgentExecutor`, A function that builds the AgentExecutor.


