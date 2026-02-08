/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

import magic.jsonable.ToJsonValue

import stdx.encoding.json.{JsonValue, JsonObject, JsonString, JsonInt}

public class ChatUsage <: ToString & ToJsonValue {
    public let promptTokens: Int64
    public let completionTokens: Int64
    public let totalTokens: Int64
    public let timeCost: Option<Duration>

    public init(promptTokens!: Int64,
                completionTokens!: Int64,
                // totalTokens!: Int64,
                timeCost!: Option<Duration>) {
        this.promptTokens = promptTokens
        this.completionTokens = completionTokens
        this.totalTokens = promptTokens + completionTokens
        this.timeCost = timeCost
    }

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        jo.put("promptTokens", JsonInt(promptTokens))
        jo.put("completionTokens", JsonInt(completionTokens))
        jo.put("totalTokens", JsonInt(totalTokens))
        if (let Some(tc) <- timeCost) {
            jo.put("timeTost", JsonString(tc.toString()))
        }
        return jo
    }

    override public func toString(): String {
        "ChatUsage[completionTokens ${completionTokens}, promptTokens ${promptTokens}, totalTokens ${totalTokens}, timeCost ${timeCost.toString()}]"
    }
}
