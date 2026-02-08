/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

import magic.core.message.MessageList

import std.deriving.Derive

/**
 * The status of the agent response
 */
@Derive[ToString, Equatable]
public enum AgentResponseStatus {
    | Success // The execution is successful
    | Cancelled  // The execution is canceled by user
    | Failed // The execution is failed
}

/**
 The execution response from an agent executor
 */
open public class AgentResponse <: Iterator<String> {
    /**
     * The status of the agent response
     */
    protected var _status: AgentResponseStatus

    /**
     * The agent result
     */
    protected var _content: String

    /**
     * Internal information during the execution
     */
    protected var _execution: Option<AgentExecution> = None

    open public prop status: AgentResponseStatus {
        get() { this._status }
    }

    public prop execution: AgentExecution {
        get() { this._execution.getOrThrow() }
    }

    open public prop content: String {
        get() { this._content }
    }

    public init(status: AgentResponseStatus, content: String) {
        this._status = status
        this._content = content
    }

    public init(status: AgentResponseStatus, content: String, execution!: AgentExecution) {
        this._status = status
        this._content = content
        this._execution = execution
        execution.setAnswer(content)
    }

    /**
     * Since AsyncAgentResponse cannot inherit from both Iterator<String> and AgentResponse,
     * we need to override the next() method to return None.
     */
    open override public func next(): Option<String> {
        return None
    }
}