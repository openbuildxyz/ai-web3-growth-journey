/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

public enum MessageRole <: ToString {
    | System
    | User
    | Assistant
    | Unknown

    public func toString(): String {
        match (this) {
            case MessageRole.System => "system"
            case MessageRole.User => "user"
            case MessageRole.Assistant => "assistant"
            case MessageRole.Unknown => "unknown"
        }
    }

    public static func fromStr(str: String): MessageRole {
        if (str == "system") {
            return MessageRole.System
        } else if (str == "user") {
            return MessageRole.User
        } else if (str == "assistant") {
            return MessageRole.Assistant
        } else {
            return MessageRole.Unknown
        }
    }

    public operator func ==(other: MessageRole): Bool {
        match ((this, other)) {
            case (MessageRole.System, MessageRole.System) => true
            case (MessageRole.User, MessageRole.User) => true
            case (MessageRole.Assistant, MessageRole.Assistant) => true
            case (MessageRole.Unknown, MessageRole.Unknown) => false
            case _ => false
        }
    }
    public operator func !=(other: MessageRole): Bool {
        return !(this == other)
    }
}
