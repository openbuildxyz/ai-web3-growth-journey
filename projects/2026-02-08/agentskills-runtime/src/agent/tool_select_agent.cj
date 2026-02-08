/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent

import magic.agent.base.BaseAgent
import magic.agent_executor.AgentExecutorManager
import magic.core.agent.{AgentRequest, AgentResponse}
import magic.core.model.ChatModel
import magic.core.message.{Message, MessageList}
import magic.core.tool.{Tool, ToolRequest}
import magic.model.ModelUtils
import magic.parser.{ParserUtils, ParserException}
import magic.jsonable.Jsonable
import magic.prompt.Template
import magic.log.LogUtils

import std.collection.{map, collectArray}

protected let TOOL_SELECT_SYSTEM_PROMPT = """
# Instruction
Given a user question and a list of tools, select an available tool to solve it.
Remember that you are required only to select one tools from the available tools, and you should NEVER answer the question directly.

Note that each tool has a unique name and its description, you should choose one according to their descriptions to help solve the question.
If the question requires multiple tools to be solved, you should select the first tool to be used.
The output should be a JSON object, obeying the following schema:
```json
{
    "name": string, name of the tool, it must refer to one of available tools
    "arguments": { [key: string]: unknown }, arguments for the tool, each argument must be a valid json value required by the tool; it can be omitted, if the tool does not accept parameters
}
```

Output example:

```json
{
    "name": "foo"
    "arguments": {
        "url": "http://example.com",
        "count": 3,
        "items": ["abc", "xyz"]
    }
}
```

If there is no suitable tool to select, return an empty JSON object ```json {} ```.

{tools}
"""

/**
 * This agent attempts to select a proper tool for the question.
 **/
public class ToolSelectAgent <: BaseAgent {
    private let tools: Array<Tool>

    public init(model: ChatModel, tools: Array<Tool>) {
        super(
            model: model,
            name: "Tool Select Agent",
            description: "This agent is capable of selecting a tool to use to solving the question. It just select the proper tool but not calling the tool."
        )
        this.tools = tools
        this.systemPrompt = TOOL_SELECT_SYSTEM_PROMPT.format(
            // ("messageList", this.buildDialogPrompt(request.messageList ?? MessageList())),
            ("tools", this.buildToolsPrompt())
        )
        this.executor = AgentExecutorManager.create("naive")
    }

    public func select(question: String): Option<ToolRequest> {
        let result = this.chat("Now, select the tool for the question: ${question}.")
        try {
            let toolRequest = ParserUtils.extractToolRequest(result)
            LogUtils.info(this.name, "Select Tool: ${toolRequest.toString()}")
            return toolRequest
        } catch (_: ParserException) {
            return None
        }
    }

    private func buildToolsPrompt(): String {
        let strBuilder = StringBuilder()
        strBuilder.append("# Available Tools\n")
        strBuilder.append("[\n")
        strBuilder.append(
            String.join(
                this.tools |> map { t: Tool => t.toJsonValue().toJsonString() } |> collectArray,
                delimiter: ",\n"
            )
        )
        strBuilder.append("\n]\n")
        strBuilder.append("---end of tools---")
        return strBuilder.toString()
    }

    private func buildConversationPrompt(messageList: MessageList): String {
        if (messageList.isEmpty()) {
            return ""
        }
        let strBuilder = StringBuilder()
        strBuilder.append("# Previous conversation (with the user)\n")
        for (msg in messageList) {
            strBuilder.append("${msg}\n")
        }
        strBuilder.append("---end of conversation---")
        return strBuilder.toString()
    }
}