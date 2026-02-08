/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

import magic.jsonable.{Jsonable, FromJsonValue, ToJsonValue, JsonUtils}

import std.collection.{ArrayList}
import stdx.encoding.json.*

/**
 * A single chat round in a conversation, consisting of a question and an answer
 * along with the optional execution step messages.
 */
public class ChatRound <: ToString & FromJsonValue<ChatRound> & ToJsonValue {
    public ChatRound(
        public let question: Message, // The question message from the user
        public let answer: Message, // The answer message from the assistant
        public let steps: MessageList) {// Optional execution step messages, if any
    }

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        jo.put("question", this.question.toJsonValue())
        jo.put("answer", this.answer.toJsonValue())
        jo.put("steps", this.steps.toJsonValue())
        return jo
    }

    redef static public func fromJsonValue(json: JsonValue): ChatRound {
        return ChatRound(
            Message.fromJsonValue(JsonUtils.getJsonValue(json, "question").getOrThrow()),
            Message.fromJsonValue(JsonUtils.getJsonValue(json, "answer").getOrThrow()),
            MessageList.fromJsonValue(JsonUtils.getJsonValue(json, "steps").getOrThrow())
        )
    }

    override public func toString(): String {
        let strBuilder = StringBuilder("")
        strBuilder.append("Question: ${question}\n")
        strBuilder.append("Steps:\n")
        for (step in steps) {
            strBuilder.append("${step}\n")
        }
        strBuilder.append("Answer: ${answer}")
        return strBuilder.toString()
    }
}