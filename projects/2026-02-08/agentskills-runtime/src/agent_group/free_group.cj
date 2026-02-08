/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_group

import magic.core.agent.*
import std.collection.ArrayList

public enum FreeGroupMode {
    | Auto // The speaker will be selected by LLM automatically
    | RoundRobin
}

public class FreeGroup <: AgentGroup {
    private let members = ArrayList<Agent>()

    public init(a: Agent, b: Agent) {
        members.add(a)
        members.add(b)
    }

    override public func chat(request: AgentRequest): AgentResponse {
        return chat(request, maxRound: DISCUSSION_MAX_ROUND)
    }

    override public func chat(request: AgentRequest, maxRound!: Int64): AgentResponse {
        let dGroup = AutoDiscussGroup(request: request, members: members)
        return dGroup.discuss(maxRound: maxRound)
    }

    override public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        throw UnsupportedException()
    }

    public func discuss(topic!: String, initiator!: String, speech!: String,
                        mode!: FreeGroupMode = FreeGroupMode.Auto,
                        maxRound!: Int64 = DISCUSSION_MAX_ROUND): String {
        let dGroup = match (mode) {
            case FreeGroupMode.Auto => AutoDiscussGroup(request: AgentRequest(topic), members: members)
            case FreeGroupMode.RoundRobin => RoundRobinDiscussGroup(request: AgentRequest(topic), members: members)
        }
        let resp = dGroup.discuss(initiator, speech, maxRound: maxRound)
        return resp.content
    }

    override public operator func [](memberName: String): Agent {
        for (agent in members) {
            if (agent.name == memberName) {
                return agent
            }
        }
        throw Exception("Access unknown agent member")
    }

    public operator func |(member: Agent): FreeGroup {
        members.add(member)
        return this
    }
}

