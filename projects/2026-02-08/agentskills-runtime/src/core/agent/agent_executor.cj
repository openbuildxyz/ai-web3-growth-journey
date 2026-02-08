/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

/**
 * Agent executors.
 * Each executor has its own plan approach, like react.
 */
public interface AgentExecutor {
    prop name: String

    func run(agent: Agent, request: AgentRequest): AgentResponse

    func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse
}
