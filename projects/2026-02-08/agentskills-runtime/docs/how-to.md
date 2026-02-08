# How to use Cangjie Magic


<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [How to use Cangjie Magic](#how-to-use-cangjie-magic)
  - [How to define an Agent?](#how-to-define-an-agent)
  - [How to configure Agent properties?](#how-to-configure-agent-properties)
  - [How to write system prompts?](#how-to-write-system-prompts)
  - [How to use prompt patterns?](#how-to-use-prompt-patterns)
  - [How to create custom prompt patterns?](#how-to-create-custom-prompt-patterns)
  - [How to implement tool functions?](#how-to-implement-tool-functions)
  - [How to configure MCP servers?](#how-to-configure-mcp-servers)
  - [How to use RAG for knowledge enhancement?](#how-to-use-rag-for-knowledge-enhancement)
  - [How to implement multi-Agent collaboration?](#how-to-implement-multi-agent-collaboration)
  - [How to control the loop number of React execution?](#how-to-control-the-loop-number-of-react-execution)
  - [How to create AI functions?](#how-to-create-ai-functions)
  - [How to use semantic search?](#how-to-use-semantic-search)
  - [How to build a knowledge graph?](#how-to-build-a-knowledge-graph)
  - [How to handle agent conversation?](#how-to-handle-agent-conversation)
  - [How to print internal execution](#how-to-print-internal-execution)

<!-- /code_chunk_output -->



## How to define an Agent?

To create a basic Agent in Magic, use the `@agent` macro to decorate a class. The simplest Agent has no functionality but provides the base structure.

```cangjie
@agent
class MyFirstAgent { }
```

## How to configure Agent properties?

Agents support various configuration properties through the `@agent` macro attributes. Here's how to set common properties:

```cangjie
@agent[
    description: "A helpful assistant for weather information",
    model: "deepseek:deepseek-chat",
    temperature: 0.7,
    memory: true,
    executor: "react"
]
class WeatherAgent { }
```

## How to write system prompts?

System prompts define the Agent's behavior and role. Use the `@prompt` macro with string literals that will be concatenated:

```cangjie
@agent
class Calculator {
    @prompt(
        "You are a professional calculator assistant."
        "You can perform basic arithmetic operations."
        "Always show your working process step by step."
    )
}
```

## How to use prompt patterns?

Magic provides structured prompt patterns like APE and BROKE. Here's an example using the APE pattern:

```cangjie
@agent
class TravelPlanner {
    @prompt[pattern: APE] (
        action: "Plan travel itineraries",
        purpose: "Help users optimize their travel experience",
        expectation: "Detailed daily schedules with activities and transportation"
    )
}
```

## How to create custom prompt patterns?

Define new prompt patterns using `@promptPattern`:

```cangjie
@promptPattern
class STAR {
    @element[description: "Describe the situation"]
    let situation: String

    @element[description: "Define the task"]
    let task: String

    @element[description: "Specify the action"]
    let action: String

    @element[description: "Explain the result"]
    let result: String

    public func toString(): String {
        return """
        Situation: ${situation}
        Task: ${task}
        Action: ${action}
        Result: ${result}
        """
    }
}
```

## How to implement tool functions?

Create tools using the `@tool` macro to enhance Agent capabilities:

```cangjie
@tool[
    description: "Converts temperatures between Celsius and Fahrenheit",
    parameters: {
        value: "The temperature value to convert",
        from: "Source unit (C or F)",
        to: "Target unit (C or F)"
    }
]
func convertTemp(value: Int64, from: String, to: String): Int64 {
    if from == "C" && to == "F" {
        return value * 9/5 + 32
    } else if from == "F" && to == "C" {
        return (value - 32) * 5/9
    }
    return value
}
```

## How to configure MCP servers?

Connect to external tool servers via MCP protocol:

```cangjie
@agent[
    mcp: [
        stdio("python tool_server.py", API_KEY: "xyz123"),
        http("https://api.weather-service.com/mcp")
    ]
]
class EnhancedAgent { }
```

## How to use RAG for knowledge enhancement?

Configure external knowledge sources for your Agent:

```cangjie
@agent[
    rag: {
        source: "knowledge/solar_system.md",
        mode: "dynamic",
        description: "Contains facts about planets and celestial bodies"
    }
]
class AstronomyAgent { }
```

## How to implement multi-Agent collaboration?

Create different collaboration patterns between Agents:

```cangjie
// Linear collaboration
let researchFlow = DataGatherer() |> Analyzer() |> Reporter()

// Leader-follower collaboration
let team = Manager() <= [Researcher(), Developer(), Designer()]

// Free collaboration
let brainstormGroup = Artist() | Writer() | Musician()
```

## How to control the loop number of React execution?

When using the `react` executor, you can control the maximum number of reasoning-action loops to prevent infinite iterations or limit computational costs. There are two approaches to set this limit:

**Method 1: Through Agent configuration**

Specify the maximum loop count directly in the Agent's executor property using `react:<number>` syntax:

```cangjie
@agent[executor: "react:5"] // Limits to 5 loops maximum
class LimitedIterationAgent {
    @prompt(
        "You are an agent that performs multi-step calculations."
        "Show your reasoning process for each step."
    )

    @tool[description: "Performs basic addition"]
    func add(a: Int64, b: Int64): Int64 {
        return a + b
    }
}
```

**Method 2: Through global configuration**

Set the default maximum React iterations for all Agents:

```cangjie
import magic.config.Config

// Set global maximum React iterations to 8
Config.maxReactNumber = 8

@agent[executor: "react"] // Will use the global limit of 8
class GlobalLimitedAgent {
    // ... agent implementation ...
}
```

## How to create AI functions?

Use the `@ai` macro to create quick AI-powered functions:

```cangjie
@ai[model: "deepseek:deepseek-chat"]
func generatePoem(topic: String, style: String): String {
    "Generate a ${style}-style poem about ${topic}"
    "The poem should be 4 stanzas with rhythmic patterns"
}
```

## How to use semantic search?

Implement semantic retrieval with vector databases:

```cangjie
let vectorDB = FaissVectorDatabase()
let indexMap = SimpleIndexMap()
let smap = SemanticMap(vectorDB: vectorDB, indexMap: indexMap)

smap.put("apple fruit", "A sweet pomaceous fruit")
smap.put("apple company", "Technology company founded by Steve Jobs")
let results = smap.search("fruit similar to apple", number: 2)
```

## How to build a knowledge graph?

Create and use knowledge graphs with MiniRag:

```cangjie
let model = ModelManager.createChatModel("deepseek:deepseek-chat")
let embed = OllamaEmbeddingModel("nomic-embed-text")
let tokenizer = Cl100kTokenizer("./cl100k_base.tiktoken")

let miniRag = MiniRagBuilder(
    MiniRagConfig(model, embed, tokenizer)
).build()

miniRag.insert("The Earth orbits the Sun in 365.25 days")
miniRag.commit()
```

## How to handle agent conversation?

**Method 1: Manage conversation context with `Conversation`**

```cangjie
let agent = CustomerSupportAgent()
let conversation = Conversation()

// First interaction
let response1 = agent.chat(
    AgentRequest("Hello, I need help", conversation: conversation)
)
conversation.addChatRound(response1.execution.chatRound)

// Follow-up maintains context
let response2 = agent.chat(
    AgentRequest("What about my previous issue?", conversation: conversation)
)
```

**Method 2: Use `@conversation` macro and conversation DSL**

```cangjie
let agent = CustomerSupportAgent()

@conversation[agent: agent] (
    // First interaction
    "Hello, I need help" -> response1
    println(response1)
    // Follow-up maintains context
    "What about my previous issue?" -> response2
    println(response2)
)
```

## How to print internal execution

Use `ConsolePrinter` to log agent execution details.

Note: It must be used with agent asynchronous execution.

```cangjie
import magic.interaction.ConsolePrinter

let agent = FooAgent()

let asyncResp = agent.asyncChat(AgentRequest("questions", verbose: true))
ConsolePrinter.print(asyncResp, verbose: true)
```

You can also implement customized printers via `EventStream`

```cangjie
import magic.parser.*

class MyPrinter <: EventStreamVisitor {
    public init(events: EventStream) {
        super(events)
    }

    override public func on(event: NotifyEvent): Unit {
        println(event.content.trimAscii())
    }
    ...
}

let asyncResp = agent.asyncChat(AgentRequest("question", verbose: true))
let printer = MyPrinter(asyncResp.execution.events)
printer.start()
```