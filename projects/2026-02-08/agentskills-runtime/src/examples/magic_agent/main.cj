/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.magic_agent

import magic.dsl.*
import magic.prelude.*
import magic.config.Config
import magic.interaction.ConsolePrinter

import std.console.Console

// Modified from: https://gist.github.com/jlia0/db0a9695b3ca7609c9b1a08dcbf872c9
private let PROMPT = """
You are Magic, an AI agent created by the Cangjie Magic team.

You excel at the following tasks:
1. Information gathering, fact-checking, and documentation
2. Writing multi-chapter articles and in-depth research reports
3. Various tasks that can be accomplished using tools and the internet

You operate in an agent loop, iteratively completing tasks through these steps:

1. Analyze Events: Understand user needs and current state through event stream, focusing on latest user messages and execution.
2. Select Tools: Choose next tool call based on current state, task planning, relevant knowledge
3. Wait for Execution: Selected tool action will be executed with new observations added to the event stream
4. Iterate: Choose only one tool call per iteration, patiently repeat above steps until task completion
5. Submit Results: If the task completes, send results to user via message tools
6. Enter Standby: Enter idle state when all tasks are completed or user explicitly requests to stop, and wait for new tasks
"""

// Modified from https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking/index.ts
const THINKING_TOOL_DESC = """
A detailed tool for dynamic and reflective problem-solving through thoughts.
This tool helps analyze problems through a flexible thinking process that can adapt and evolve.
Each thought can build on, question, or revise previous insights as understanding deepens.

When to use this tool:
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Problems that require a multi-step solution
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

Parameters explained:
- thought: Your current thinking step, which can include:
* Regular analytical steps
* Revisions of previous thoughts
* Questions about previous decisions
* Realizations about needing more analysis
* Changes in approach
* Hypothesis generation
* Hypothesis verification
"""

@agent[
    model: "ark:deepseek-v3-250324",
    executor: "tool-loop",
    // executor: "react",
    enableToolFilter: true,
    tools: [
        // ...your mcp servers...
        httpMCP("https://mcp.amap.com...")
    ]
]
class MagicAgent {
    @prompt("""
        ${PROMPT}
    """
    )

    @tool[
        description: "${THINKING_TOOL_DESC}",
        parameters: {
            thought: "Your current thinking content"
        },
        filterable: false
    ]
    func thinking(thought: String): String {
        return "Good job! Continue to work"
    }
}

main() {
    Config.logLevel = "INFO"
    Config.logFile = "./logs/abc.log"
    Config.enableAgentLog = true
    // Config.env["DEEPSEEK_API_KEY"] = "<your api key>"
    let agent = MagicAgent()
    let q = "..."
    let asyncResp = agent.asyncChat(AgentRequest(q, verbose: true))
    ConsolePrinter.print(asyncResp, verbose: true)
}