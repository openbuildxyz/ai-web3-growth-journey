/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tool

import magic.core.tool.*
import magic.core.model.*
import magic.core.message.*
import magic.jsonable.TypeSchema

import std.collection.HashMap
import stdx.encoding.json.JsonValue

protected class ChatModelTool <: AbsTool {
    private let model: ChatModel

    public init(model: ChatModel) {
        this.model = model
    }

    public prop name: String {
        get() { "chat_model" }
    }

    public prop description: String {
        get() { "This tool uses LLMs to answer questions. Any general and commonsense questions can be answered by this tool." }
    }

    public prop parameters: Array<ToolParameter> {
        get() {
            [
                ToolParameter(
                    "question",
                    "The question to answer, which should be clear and described in detail.",
                    TypeSchema.Str)
            ]
        }
    }

    public prop retType: TypeSchema {
        get() { TypeSchema.Str }
    }

    public prop examples: Array<String> {
        get() { [] }
    }

    override public func invoke(args: HashMap<String, JsonValue>): ToolResponse {
        // The chat model tool must accept a string
        let question = args["question"].asString().getValue()
        let messages = [
            Message.system("Answer user questions in brief."),
            Message.user(question)
        ]
        try {
            let resp = model.create(ChatRequest(messages))
            return ToolResponse(resp.message.content)
        } catch (ex: ModelException) {
            throw ToolException("Fail to get chat model response")
        }
    }
}