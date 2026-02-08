/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

import magic.jsonable.{FromJsonValue, ToJsonValue, JsonUtils}

import std.collection.{ArrayList, LinkedList, map, collectArray}
import stdx.encoding.json.*

/**
 * A collection of chat messages
 */
public open class MessageList <: ToString & Iterable<Message> &
                                 FromJsonValue<MessageList> & ToJsonValue {
    private let messages: ArrayList<Message>

    public init() {
        this.messages = ArrayList<Message>()
    }

    public init(messages: Collection<Message>) {
        this.messages = ArrayList<Message>(messages)
    }

    public func clone(): MessageList {
        MessageList(this.messages.clone())
    }

    public open func add(msg: Message): Unit {
        messages.add(msg)
    }

    public open func removeLast(): Message {
        if (messages.isEmpty()) {
            throw Exception("Remove the last message from an empty list")
        }
        return messages.remove(at: messages.size - 1)
    }

    public func remove(at!: Int64): Message {
        if (messages.isEmpty()) {
            throw Exception("Remove message at index $at from an empty list")
        }
        return messages.remove(at: at)
    }

    public func add(messages!: Array<Message>): Unit {
        for (msg in messages) {
            this.add(msg)
        }
    }

    public func clear(): Unit {
        messages.clear()
    }

    public func iterator(): Iterator<Message> {
        return messages.iterator()
    }

    public operator func [](index: Int64): Message {
        return messages[index]
    }

    public prop size: Int64 {
        get() { messages.size }
    }

    public func isEmpty(): Bool {
        messages.isEmpty()
    }

    public func toString(): String {
        let strBuilder = StringBuilder()
        for (msg in messages) {
            strBuilder.append(msg.toString())
            strBuilder.append("\n")
        }
        return strBuilder.toString()
    }

    public func toArray(): Array<Message> {
        return messages.toArray()
    }

    override public func toJsonValue(): JsonValue {
        JsonUtils.buildJsonArray(
            this.messages |>
                map { m => m.toJsonValue() } |>
                collectArray
        )
    }

    redef public static func fromJsonValue(json: JsonValue): MessageList {
        return MessageList(
            json.asArray().getItems() |>
                map { jv => Message.fromJsonValue(jv) } |>
                collectArray
        )
    }
}
