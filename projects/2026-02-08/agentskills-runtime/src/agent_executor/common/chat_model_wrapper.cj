/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

import magic.core.*

/**
 * Each agent task must use LLM via the method chatLLM,
 * so, we wrap the agent task as a chat model wrapper,
 * allowing seamless LLM access (via chatLLM) for other components.
 */
class ChatModelWrapper <: ChatModel {
    ChatModelWrapper(
        private let task: AgentTask
    ) { }

    public prop provider: String {
        get() { task.agent.model.provider }
    }

    public prop name: String {
        get() { task.agent.model.name}
    }

    public prop contextLength: Int64 {
        get() {
            task.agent.model.contextLength
        }
    }

    public mut prop maxTokens: Option<Int64> {
        get() {
            task.agent.model.maxTokens
        }
        set(v) {
            task.agent.model.maxTokens = v
        }
    }

    public func create(request: ChatRequest): ChatResponse {
        return task.chatLLM(
            request.messageList,
            stop: request.stop,
            tools: request.tools
        )
    }

    public func asyncCreate(request: ChatRequest): AsyncChatResponse {
        throw UnsupportedException()
    }
}

