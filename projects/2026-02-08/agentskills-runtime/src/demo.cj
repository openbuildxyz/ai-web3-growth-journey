/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic

import magic.dsl.*
import magic.prelude.*
import magic.interaction.*

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

@agent[
    model: "ark:deepseek-v3-250324",
    // model: "ark:kimi-k2-250711",
    // executor: "tool-loop:100",
    executor: "react",
    tools: [
        httpMCP("https://mcp.amap.com/mcp?key=e52794430e9b4a2583dc3060236e2d37")
    ]
]
private class DemoAgent {
    @prompt(
        """
        ${PROMPT}
        """
    )
}

func demoIt(): Unit {
    let agent = DemoAgent()

    let q1 = "小明在上海青浦练秋湖华为研发中心，小红在上海东方明珠，两人想约会，找一个折中的位置，你能给推荐吗？"

    let asyncResp = agent.asyncChat(AgentRequest(q1, verbose: true))

    ConsolePrinter.print(asyncResp, verbose: true)
}
