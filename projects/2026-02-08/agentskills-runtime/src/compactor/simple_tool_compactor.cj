/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.compactor

import magic.core.tool.{ToolRequest, ToolResponse, ToolCompactor}
import magic.core.model.{ChatModel, ChatRequest}
import magic.core.message.{Message, MessageList}
import magic.prompt.Template
import magic.log.LogUtils

/**
 * Compact the tool invocation
 */
public class SimpleToolCompactor <: ToolCompactor {
    private let name = "Simple Tool Compactor"

    public SimpleToolCompactor(
        private let model: ChatModel
    ) { }

    /**
    * This agent attempts to summarize the tool execution results into concise and structured summaries.
    **/
    override public func compact(toolRequest: ToolRequest, toolResponse: ToolResponse): String {
        LogUtils.info(this.name, "Start to summarize tool result")
        let summary = this.model.create(
            ChatRequest([
                Message.system(TOOL_SUMMARIZE_SYSTEM_PROMPT),
                Message.user(TOOL_SUMMARIZE_USER_PROMPT.format([
                    ("tool_call", toolRequest.toJsonValue().toJsonString()),
                    ("tool_result", toolResponse.content)
                ]))
            ])
        ).message.content
        LogUtils.debug(
            this.name,
            String.join(
                [
                    "#Bytes of tool result: ${toolResponse.content.size} => ${summary.size}",
                    "--------------------------------------",
                    "Summary:", summary
                ],
                delimiter: "\n"
            )
        )
        return summary
    }
}