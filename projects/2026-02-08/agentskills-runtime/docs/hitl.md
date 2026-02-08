## Human-in-the-Loop (HITL) Tutorial

The Human-in-the-Loop (HITL) mechanism in Cangjie Magic provides a three-tiered event handling system that allows developers to intercept and interact with agent execution flow at different levels. This system consists of:

- **Interaction Events**: Event types that represent various stages of agent execution
- **Three-Level Handler Hierarchy**: Global, agent-local, and request-specific handlers
- **@handler/@interact/@asyncInteract DSL**: Declarative syntax for defining event handling logic
- **EventResponse**: Control flow mechanism to continue or terminate execution

## Core Concepts

### Event Handler Hierarchy

The framework supports three levels of event handlers with a specific execution order:

1. **Request-Level Handlers** (`@interact` / `@asyncInteract`)
   - Applied to specific agent requests
   - Shortest lifespan, highest priority
   - First to be called in the execution chain

2. **Agent-Level Handlers** (`@handler`)
   - Attached to specific agent instances
   - Shared across all requests for that agent
   - Second priority, called if request handlers don't intercept

3. **Global Handlers** (`EventHandlerManager.global`)
   - System-wide handlers for all agents and requests
   - Longest lifespan, lowest priority
   - Last resort, called if higher-level handlers don't intercept

### Execution Order

When an event is triggered, the framework follows this order:

```
Request Handlers (@interact) → Agent Handlers (@handler) → Global Handlers (EventHandlerManager.global)
```

If a handler at any level returns `EventResponse.Continue`, the execution continues to the next level. If it returns `EventResponse.Continue(value)` or `EventResponse.Terminate(value)`, the event is considered handled and lower-level handlers are not called.

### Event Types

The framework defines several event types that represent different stages in the agent execution lifecycle:

#### Agent Lifecycle Events
- **AgentStartEvent**: Triggered before an agent begins execution
- **AgentEndEvent**: Triggered after agent execution completes
- **AgentTimeoutEvent**: Triggered when execution exceeds time limits
- **SubAgentStartEvent**: Triggered before a sub-agent (AgentAsTool) starts
- **SubAgentEndEvent**: Triggered after a sub-agent completes

#### Model Interaction Events
- **ChatModelStartEvent**: Triggered before calling the LLM
- **ChatModelEndEvent**: Triggered after LLM response is received
- **ChatModelFailureEvent**: Triggered when LLM fails to generate a response

#### Tool Execution Events
- **ToolCallStartEvent**: Triggered before a tool is invoked
- **ToolCallEndEvent**: Triggered after tool execution completes
- **ToolCallRepeatEvent**: Triggered for repeated tool calls

#### User Interaction Events
- **UserInputEvent**: Triggered when agent requires human input
- **NotifyEvent**: Triggered for general notifications and status updates

### EventResponse Control Flow

Event handlers return an `EventResponse<T>` that controls execution flow:

```cangjie
public enum EventResponse<T> {
    | Continue                // Continue with normal execution
    | Continue(T)             // Continue with a specific result
    | Terminate(T)            // Abort execution with a result
}
```

## Basic Usage

### 1. Request-Level Handlers (@interact)

Request-level handlers are applied to specific agent requests and have the highest priority:

```cangjie
import magic.dsl.*
import magic.interaction.*
import magic.core.interaction.*

@agent
class Calculator {
    @tool[description: "Add two numbers"]
    func add(a: Int64, b: Int64): Int64 {
        return a + b
    }
}

@interact[
    agent: Calculator(),
    request: AgentRequest("What is 15 + 27?")
](
    case evt: ToolCallStartEvent =>
        // Intercept tool calls for this specific request only
        if (evt.toolRequest.name == "add") {
            println("Request handler: About to add numbers")
        }
        return EventResponse.Continue

    case evt: AgentEndEvent =>
        println("Request handler: Agent completed")
        return EventResponse.Continue
)
```

### 2. Agent-Level Handlers (@handler)

Agent-level handlers are attached to specific agents and apply to all their requests:

```cangjie
@agent
class DataProcessor {
    @handler  // Agent-level handler definition
    func defaultHandlers(): EventHandlerManager {
        let manager = EventHandlerManager()

        // Add handlers that apply to all requests for this agent
        manager.addHandler({ evt: ToolCallStartEvent =>
            if (evt.toolRequest.name == "delete_data") {
                // Require confirmation for all delete operations
                println("Agent handler: Intercepting delete operation")
                return EventResponse.Terminate(ToolResponse(
                    result: "Delete operations require explicit approval",
                    isError: true
                ))
            }
            return EventResponse.Continue
        })

        manager.addHandler({ evt: ChatModelStartEvent =>
            println("Agent handler: Starting LLM call")
            return EventResponse.Continue
        })

        return manager
    }

    @tool[description: "Process data"]
    func processData(data: String): String {
        return "Processed: ${data}"
    }

    @tool[description: "Delete data"]
    func deleteData(id: String): String {
        return "Deleted: ${id}"
    }
}
```

### 3. Global Handlers (EventHandlerManager.global)

Global handlers apply to all agents and requests in the system:

```cangjie
// Setup global handlers (typically done during application initialization)
func setupGlobalHandlers() {
    let globalManager = EventHandlerManager.global

    // Add system-wide logging for all tool calls
    globalManager.addHandler({ evt: ToolCallStartEvent =>
        println("Global: Tool ${evt.toolRequest.name} called by ${evt.agent}")
        return EventResponse.Continue
    })

    // Add system-wide error handling
    globalManager.addHandler({ evt: ChatModelFailureEvent =>
        println("Global: LLM failure - ${evt.error}")
        logToSystem("llm_errors.log", "LLM Error: ${evt.error}")
        return EventResponse.Continue
    })

    // Add system-wide notification handling
    globalManager.addHandler({ evt: NotifyEvent =>
        println("Global [${evt.tag}]: ${evt.content}")
        return ()
    })
}

// Initialize global handlers
setupGlobalHandlers()
```

### 4. Handler Execution Order Example

This example demonstrates the execution order and interaction between handler levels:

```cangjie
@agent
class TestAgent {
    @handler (
        case evt: ToolCallStartEvent =>
            println("Agent-level handler called")
            return EventResponse.Continue  // Pass to next level
    )

    @tool[description: "Test tool"]
    func testTool(input: String): String {
        return "Processed: ${input}"
    }
}

// Setup global handler
EventHandlerManager.global.addHandler({ evt: ToolCallStartEvent =>
    println("Global-level handler called")
    return EventResponse.Continue
})

// Request-level handler
@interact[
    agent: TestAgent(),
    request: AgentRequest("Use test tool with 'hello'")
](
    case evt: ToolCallStartEvent =>
        println("Request-level handler called")
        return EventResponse.Continue  // Pass to next level
)

// Output order when tool is called:
// 1. Request-level handler called
// 2. Agent-level handler called
// 3. Global-level handler called
```

### 5. Intercepting Execution at Different Levels

Handlers at different levels can choose to intercept execution:

```cangjie
@agent
class SecureAgent {
    @handler(
        case evt: ToolCallStartEvent =>
            if (evt.toolRequest.name == "sensitive_operation") {
                // Agent-level interception - blocks for all requests
                println("Agent handler: Blocking sensitive operation")
                return EventResponse.Terminate(ToolResponse(
                    result: "Operation blocked by agent policy",
                    isError: true
                ))
            }
            return EventResponse.Continue
    )

    @tool[description: "Sensitive operation"]
    func sensitiveOperation(): String {
        return "Sensitive data"
    }

    @tool[description: "Normal operation"]
    func normalOperation(): String {
        return "Normal data"
    }
}

// Request-level handler can override agent-level blocking
@interact[
    agent: SecureAgent(),
    request: AgentRequest("Perform sensitive operation with approval")
](
    case evt: ToolCallStartEvent =>
        if (evt.toolRequest.name == "sensitive_operation") {
            // Request-level handler allows this specific instance
            println("Request handler: Approving sensitive operation for this request")
            return EventResponse.Continue(ToolResponse(
                result: "Operation approved by request handler",
                isError: false
            ))
        }
        return EventResponse.Continue
)

// Global fallback handler
EventHandlerManager.global.addHandler({ evt: ToolCallStartEvent =>
    if (evt.toolRequest.name == "sensitive_operation") {
        println("Global handler: Sensitive operation reached global level")
        return EventResponse.Terminate(ToolResponse(
            result: "Globally blocked operation",
            isError: true
        ))
    }
    return EventResponse.Continue
})
```

## Handler Syntax Comparison

### @handler vs @interact Syntax

Both `@handler` and `@interact` use the same syntax pattern:

```cangjie
// @handler syntax (returns EventHandlerManager)
@handler
    case evt: SomeEvent =>
        // Handler logic
        return EventResponse.Continue
)

// @interact syntax (returns AgentResponse directly)
@interact[agent: MyAgent(), request: someRequest](
    case evt: SomeEvent =>
        // Handler logic
        return EventResponse.Continue
)
```

### @asyncInteract Syntax

For asynchronous operations:

```cangjie
@asyncInteract[agent: MyAsyncAgent(), request: asyncRequest](
    case evt: AsyncEvent =>
        // Async handler logic
        return EventResponse.Continue
)
```

## Best Practices

### 1. Handler Level Selection
- **Request handlers**: Use for request-specific logic, temporary overrides, one-time validations
- **Agent handlers**: Use for agent-specific policies, consistent behavior across requests
- **Global handlers**: Use for system-wide concerns, logging, security policies, cross-cutting concerns

### 2. Handler Design Principles
- **Single Responsibility**: Each handler should focus on one concern
- **Fail Fast**: Handle errors early in the chain
- **Minimal Interference**: Use Continue unless you need to intercept
- **Clear Documentation**: Document handler behavior and side effects

### 3. Performance Considerations
- **Handler Order**: Place expensive operations in lower-priority handlers
- **Early Termination**: Use Terminate to avoid unnecessary handler execution
- **Async Operations**: Use @asyncInteract for non-blocking operations

### 4. Security and Validation
- **Layered Security**: Implement validation at multiple levels
- **Privilege Escalation**: Require approval for sensitive operations
- **Audit Trail**: Log important security decisions

## Debugging and Monitoring

### Handler Chain Tracing

```cangjie
// Add tracing to understand handler execution
EventHandlerManager.global.addHandler({ evt: ToolCallStartEvent =>
    println("Global: Processing ${evt.toolRequest.name}")
    return EventResponse.Continue
})

@agent
class DebugAgent {
    @handler
        case evt: ToolCallStartEvent =>
            println("Agent: Processing ${evt.toolRequest.name}")
            return EventResponse.Continue
    )
}

@interact[
    agent: DebugAgent(),
    request: AgentRequest("Debug request")
](
    case evt: ToolCallStartEvent =>
        println("Request: Processing ${evt.toolRequest.name}")
        return EventResponse.Continue
)
```

## Summary

The three-tiered HITL system provides powerful capabilities for:

- **Hierarchical Control**: Different levels of control from request-specific to system-wide
- **Flexible Policies**: Agent-specific behaviors combined with global standards
- **Request Adaptation**: Temporary overrides for special cases
- **System Integration**: Seamless integration with existing framework features
- **Operational Safety**: Multiple validation layers for critical operations

By understanding and properly utilizing the handler hierarchy, developers can create sophisticated agent applications with appropriate levels of control, monitoring, and customization at each tier of the system.