/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.file_assistant

import magic.dsl.*
import magic.prelude.*
import magic.config.Config
import magic.interaction.ConsolePrinter

const MARKDOWNIFY_DIR = "<path-to-markdownify-mcp>"
const MOUNT_DIR = "<path-to-mount>"
const DEEPSEEK_API_KEY = "<your api key>"

@agent[
    model: "deepseek:deepseek-chat",
    executor: "react",
    tools: [
        { command: "node", args: ["${MARKDOWNIFY_DIR}/dist/index.js"] },
        { command: "docker", args: [
            "run",
            "-i",
            "--rm",
            "--mount", "type=bind,src=${MOUNT_DIR},dst=/projects,ro",
            "mcp/filesystem",
            "/projects"
        ]}
    ]
]
class FileAssistant {
    @prompt[pattern: ERA] (
        expectation: "遵从指导逐步完成任务",
        role: "你是文件助手，帮助用户管理文件",
        action: """
        针对需求，逐步规划，你可以使用工具。
        但使用工具时，你需要注意：当你把文件路径传入 markdown 转换工具时，你需要修改文件路径：将文件路径中的 `/projects` 替换为 `${MOUNT_DIR}`，例如 /projects/a/b.pdf -> ${MOUNT_DIR}/a/b.pdf"""
    )
}

main() {
    Config.env["DEEPSEEK_API_KEY"] = DEEPSEEK_API_KEY

    let agent = FileAssistant()
    // println(agent.chat("帮我把所有 pdf 转换为 markdown 格式"))

    // 采用异步调用并打印中间信息
    let asyncResp = agent.asyncChat(
        AgentRequest("帮我把所有 pdf 转换为 markdown 格式", verbose: true)
    )

    // 打印中间信息
    let dumper = ConsolePrinter(asyncResp)
    dumper.start()

    // 打印结果
    for (data in asyncResp) {
        print(data)
    }
    println()
}