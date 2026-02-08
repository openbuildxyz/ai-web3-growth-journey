/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

public class Interceptor {
    private let agent: Agent
    private let mode: InterceptorMode

    private var numOfBypass = 0

    public init(agent: Agent, mode!: InterceptorMode = InterceptorMode.Always) {
        this.agent = agent
        this.mode = mode
    }

    protected func shouldIntercept(request: AgentRequest): Bool {
        match (mode) {
            case InterceptorMode.Always => return true
            case InterceptorMode.Periodic(freq) => return numOfBypass >= freq
            case InterceptorMode.Conditional(fn) => return fn(request)
        }
    }

    protected func doIntercept(request: AgentRequest): AgentResponse {
        // Each time intercepting a request, the number of bypassed requests is reset
        numOfBypass = 0
        return agent.chat(request)
    }

    protected func doBypass(_request: AgentRequest) {
        numOfBypass += 1
    }
}
