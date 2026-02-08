/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

import magic.core.message.{Message, MessageList}
import magic.core.tool.Tool
import magic.jsonable.{ToJsonValue, JsonUtils}

import std.collection.{map, collectArray}
import stdx.encoding.json.*

public class ChatRequest <: ToString & ToJsonValue {
    public let messageList: MessageList
    public let stop: Option<Array<String>>
    public let temperature: Option<Float64>
    public let tools: Array<Tool>

    public init(
        message: String,
        temperature!: Option<Float64> = None,
        stop!: Option<Array<String>> = None,
        tools!: Array<Tool> = []
    ) {
        this.messageList = MessageList([Message.user(message)])
        this.temperature = temperature
        this.stop = stop
        this.tools = tools
    }

    public init(
        message: Message,
        temperature!: Option<Float64> = None,
        stop!: Option<Array<String>> = None,
        tools!: Array<Tool> = []
    ) {
        this.messageList = MessageList([message])
        this.temperature = temperature
        this.stop = stop
        this.tools = tools
    }

    public init(
        messages: Array<Message>,
        temperature!: Option<Float64> = None,
        stop!: Option<Array<String>> = None,
        tools!: Array<Tool> = []
    ) {
        this.messageList = MessageList(messages)
        this.stop = stop
        this.temperature = temperature
        this.tools = tools
    }

    public init(
        messageList: MessageList,
        temperature!: Option<Float64> = None,
        stop!: Option<Array<String>> = None,
        tools!: Array<Tool> = []
    ) {
        this.messageList = messageList
        this.stop = stop
        this.temperature = temperature
        this.tools = tools
    }

    override public func toString(): String {
        this.toJsonValue().toJsonString()
    }

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        jo.put(
            "messages",
            JsonArray(messageList |> map { m => m.toJsonValue() } |> collectArray)
        )
        if (let Some(temp) <- temperature) {
            jo.put("temperature", JsonFloat(temp))
        }
        if (let Some(stopArr) <- stop) {
            jo.put("stop", JsonUtils.buildJsonArray(stopArr))
        }
        if (!tools.isEmpty()) {
            jo.put("tools", JsonArray(tools |> map { t => t.toJsonValue() } |> collectArray))
        }
        return jo
    }
}
