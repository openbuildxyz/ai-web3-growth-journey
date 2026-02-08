/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_group

import std.collection.ArrayList

public class LinearGroup <: AgentGroup {
    private let members = ArrayList<Agent>()

    init(prev: Agent, next: Agent) {
        this.members.add(prev)
        this.members.add(next)
    }

    func addNext(next: Agent): LinearGroup {
        this.members.add(next)
        return this
    }

    override public func chat(request: AgentRequest): AgentResponse {
        return chat(request, maxRound: DISCUSSION_MAX_ROUND)
    }

    override public func chat(request: AgentRequest, maxRound!: Int64): AgentResponse {
        var currReq = request
        var currResp: Option<AgentResponse> = None
        for (agent in this.members) {
            currResp = agent.chat(currReq)
            currReq = AgentRequest(currResp.getOrThrow().content, conversation: currReq.conversation)
        }
        return currResp.getOrThrow()
    }

    override public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        var currReq = request
        for (i in 0..this.members.size-1) {
            let agent = this.members[i]
            let currResp = agent.chat(currReq)
            currReq = AgentRequest(currResp.content, conversation: currReq.conversation)
        }
        let lastAgent = this.members[this.members.size - 1]
        return lastAgent.asyncChat(currReq)
    }

    override public operator func [](memberName: String): Agent {
        throw UnsupportedException()
    }
}
