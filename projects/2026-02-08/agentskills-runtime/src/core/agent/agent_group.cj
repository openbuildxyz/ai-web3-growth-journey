/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

public interface AgentGroup {
    /**
     * Since there is a bug in cjc 0.53.x, we cannot add these methods.
     * Fix it later.
     */
    func chat(request: AgentRequest): AgentResponse // {
    //     return chat(request, maxRound: DISCUSSION_MAX_ROUND)
    // }
    // func chat(question: String): String {
    //     return this.chat(AgentRequest(question)).content
    // }

    func chat(request: AgentRequest, maxRound!: Int64): AgentResponse

    func asyncChat(request: AgentRequest): AsyncAgentResponse

    /**
     * Find the agent according to its name
     */
    operator func [](memberName: String): Agent
}