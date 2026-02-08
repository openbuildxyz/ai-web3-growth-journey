/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_group

import magic.core.agent.*
import magic.agent.base.BaseAgent

class GroupAsAgent <: BaseAgent {
    private let group: AgentGroup

    init(g: AgentGroup, description: String) {
        super(
            name: "GroupAsAgent",
            model: unsafe { zeroValue<ChatModel>() },
            description: description
        )
        group = g
    }

    override public func chat(request: AgentRequest): AgentResponse {
        return group.chat(request)
    }

    override public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        return group.asyncChat(request)
    }
}
