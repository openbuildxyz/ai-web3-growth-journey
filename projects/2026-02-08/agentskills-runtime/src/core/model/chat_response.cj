/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

import magic.core.message.{Message, MessageList}
import magic.core.tool.ToolRequest
import magic.jsonable.{ToJsonValue, Jsonable}

import stdx.encoding.json.{JsonValue, JsonObject, JsonString}

open public class ChatResponse <: ToString & ToJsonValue {
    private let _model: String
    private let _message: Message
    private let _toolRequests: Array<ToolRequest>
    private let _usage: Option<ChatUsage>

    public init(
        model: String,
        message: Message,
        toolRequests!: Array<ToolRequest> = [],
        usage!: Option<ChatUsage> = None
    ) {
        this._model = model
        this._message = message
        this._toolRequests = toolRequests
        this._usage = usage
    }

    protected init(model: String) {
        this(model, Message.user(""))
    }

    public prop model: String {
        get() { this._model }
    }

    open public prop message: Message {
        get() { this._message }
    }

    open public prop toolRequests: Array<ToolRequest> {
        get() { this._toolRequests }
    }

    open public prop usage: Option<ChatUsage> {
        get() { this._usage }
    }

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        jo.put("model", JsonString(model))
        jo.put("message", message.toJsonValue())
        if (!this.toolRequests.isEmpty()) {
            jo.put("toolRequests", this.toolRequests.toJsonValue())
        }
        if (let Some(usage) <- usage) {
            jo.put("usage", usage.toJsonValue())
        }
        return jo
    }

    override public func toString(): String {
        this.toJsonValue().toJsonString()
    }
}
