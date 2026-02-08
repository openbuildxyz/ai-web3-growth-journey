/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.mcp_client

import magic.dsl.*
import magic.prelude.*
import magic.config.Config

@agent[
    model: "deepseek:deepseek-chat",
    tools: [
        // The following two lines are examples of how to use MCP servers.
        stdioMCP("cjpm run --skip-build --name magic.examples.mcp_server")
        // { command: "cjpm", args: ["run", "--skip-build", "--name", "magic.examples.mcp_server"] }
    ]
]
class HomeworkAssistant {
    @prompt(
        "你能够协助小学生们完成家庭作业，让他们在各个学科均衡发展"
    )
}

//------------------------------------------------------------------------
@agent[
    model: "deepseek:deepseek-chat",
    executor: "react",
    tools: [
        // The following lines are examples of how to use MCP servers.
        httpMCP("https://mcp.amap.com/sse?key=<your key>")
        // { url: "https://mcp.amap.com/sse?key=<your key>" }
    ]
]
class TravelAgent {
    @prompt(
        "你是超级旅行助手，快帮用户解决他们的问题吧"
    )
}

main() {
    Config.logLevel = "INFO"
    Config.logFile = "./logs/mcp-client.log"
    Config.env["DEEPSEEK_API_KEY"] = "<your api key>"
    let agent = HomeworkAssistant()
    let result = agent.chat("23 + 24 等于多少")
    println(result)
}