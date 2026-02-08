/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.interaction

import std.deriving.*

/**
 * Kinds of interaction events
 */
@Derive[Equatable, ToString]
protected enum EventKind {
    | ToolCallStart
    | ToolCallEnd
    | ToolCallRepeat

    | AgentStart
    | AgentStep
    | AgentEnd
    | AgentTimeout

    | SubAgentStart
    | SubAgentEnd

    | ChatModelStart
    | ChatModelEnd
    | ChatModelFailure

    | UserInput
    | Notify

    | Sentinel
}

/**
 * The base type of events
 */
public open class InteractionEvent <: ToString {
    protected InteractionEvent(
        protected let kind: EventKind
    ) { }

    open override public func toString(): String {
        return this.kind.toString()
    }
}
