/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.mcp_server

import magic.dsl.*
import magic.prelude.*
import magic.config.Config
import magic.mcp.StdioMCPServer

@tool[description: "Add two numbers"]
func add(a: Int64, b: Int64): Int64 {
    return a + b
}

@tool[description: "Multiply two numbers"]
func multiply(a: Int64, b: Int64): Int64 {
    return a * b
}

@agent[
    model: "deepseek:deepseek-chat",
    description: "小学算术计算器",
    tools: [add, multiply]
]
class Calculator {
    @prompt(
        "精通小学课本上的算术计算"
        "对于加减乘除运算得心应手"
    )
}

main() {
    Config.logLevel = "INFO"
    Config.logFile = "./logs/mcp-server.log"

    let agent = Calculator()
    StdioMCPServer.startWith([agent])
}