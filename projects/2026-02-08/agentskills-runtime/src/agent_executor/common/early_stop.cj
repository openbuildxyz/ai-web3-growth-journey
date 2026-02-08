/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

protected enum EarlyStopReason <: ToString {
    | ToolTerminated // The task is terminated by a terminal tool
    | EventHandlerTerminated // The task is terminated by an event handler

    override public func toString(): String {
        match(this) {
            case ToolTerminated => "ToolTerminated"
            case EventHandlerTerminated => "EventHandlerTerminated"
        }
    }
}

/**
 * Early stop information for the agent task.
 * It contains the reason for stopping and the result of the task.
 */
protected struct EarlyStopInfo {
    EarlyStopInfo(
        protected let reason: EarlyStopReason,
        protected let result!: String
    ) { }
}