/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent

import magic.agent.base.BaseAgent
import magic.core.agent.{AgentGroup, AgentRequest, AgentResponse, AsyncAgentResponse}
import magic.core.model.ChatModel

import std.console.Console

/**
 * This agent dispatches the question to users and accepts user input as the answer.
 */
public class GroupAsAgent <: BaseAgent {
    private let group: AgentGroup

    public init(group: AgentGroup, description!: String) {
        super (
            model: unsafe { zeroValue<ChatModel>() }, // Model will not be accessed
            name: "GroupAsAgent",
            description: description
        )
        this.group = group
    }

    override public func chat(request: AgentRequest): AgentResponse {
        return this.group.chat(request)
    }

    override public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        return this.group.asyncChat(request)
    }
}