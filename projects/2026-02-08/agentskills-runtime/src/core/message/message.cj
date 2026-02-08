/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

import magic.jsonable.{FromJsonValue, ToJsonValue, JsonUtils}

import stdx.encoding.json.{JsonValue, JsonObject, JsonString}

public class Message <: ToString & FromJsonValue<Message> & ToJsonValue {
    /**
     * Name of the message sender
     */
    public let name: String

    /**
     * Role of the message sender
     */
    public let role: MessageRole

    /**
     * Content of the message
     */
    public let content: String

    /**
     * Optional image of the message
     */
    public let image: Option<String> // url or base64

    /**
     * The reasoning content
     * A reason model, like deepseek-r1, may generate reasoning content
     */
    public let reason: Option<String>

    public init(
        role: MessageRole,
        content: String,
        name!: String = "",
        image!: Option<String> = None,
        reason!: Option<String> = None) {
        this.name = name
        this.role = role
        this.content = content
        this.image = image
        this.reason = reason
    }

    override public func toString(): String {
        let reason = this.reason.map({ s => ">${s}<" }) ?? ""
        return "${role}: ${reason}${content}"
    }

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        jo.put("role", JsonString(role.toString()))
        jo.put("content", JsonString(content))
        if (this.name != "") {
            jo.put("name", JsonString(name))
        }
        if (let Some(img) <- this.image) {
            jo.put("image", JsonString(img))
        }
        if (let Some(r) <- this.reason) {
            jo.put("reason", JsonString(r))
        }
        return jo
    }

    redef public static func fromJsonValue(json: JsonValue): Message {
        return Message(
            MessageRole.fromStr(JsonUtils.getString(json, "role").getOrThrow()),
            JsonUtils.getString(json, "content") ?? "",
            name: JsonUtils.getString(json, "name") ?? "",
            image: JsonUtils.getString(json, "image"),
            reason: JsonUtils.getString(json, "reason"),
        )
    }

    //---------------------------------------------------------------------
    // Builder methods
    //---------------------------------------------------------------------
    public static func system(content: String): Message {
        Message(MessageRole.System, content, name: "System")
    }

    public static func assistant(content: String, name!: String = "Assistant"): Message {
        Message(MessageRole.Assistant, content, name: name)
    }

    public static func user(content: String, image!: Option<String> = None): Message {
        Message(MessageRole.User, content, name: "User", image: image)
    }
}