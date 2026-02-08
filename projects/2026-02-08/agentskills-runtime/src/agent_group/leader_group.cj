/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_group

import magic.tool.AgentAsTool

public class LeaderGroup <: AgentGroup {
    public LeaderGroup(private let leader: Agent,
                       private let members: Array<Agent>) {
        for (agent in members) {
            leader.toolManager.addTool(AgentAsTool(agent))
        }
    }

    override public func chat(request: AgentRequest): AgentResponse {
        return chat(request, maxRound: DISCUSSION_MAX_ROUND)
    }

    override public func chat(request: AgentRequest, maxRound!: Int64): AgentResponse {
        return leader.chat(request)
    }

    override public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        return leader.asyncChat(request)
    }

    override public operator func [](memberName: String): Agent {
        for (agent in members) {
            if (agent.name == memberName) {
                return agent
            }
        }
        throw Exception("Access unknown agent member")
    }
}