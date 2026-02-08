/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent

import magic.agent.base.{AgentOp, BaseAgent}
import magic.core.agent.{Agent, AgentRequest, AgentResponse, AsyncAgentResponse}
import magic.core.model.ChatModel
import magic.core.message.{MessageList, Message, Conversation}
import magic.log.LogUtils

/**
 * Wrap an agent as a conversation agent that is able to save chat messages.
 */
public class ConversationAgent <: BaseAgent {
    private let agent: Agent

    public let conversation: Conversation

    public init(agent: Agent, conversation!: Option<Conversation> = None) {
        super (
            model: agent.model,
            name: agent.name,
            description: "An proxy agent that saves chat messages.",
            temperature: agent.temperature,
            systemPrompt: agent.systemPrompt,
            toolManager: agent.toolManager,
            executor: agent.executor,
            retriever: agent.retriever,
            memory: agent.memory,
            interceptor: agent.interceptor
        )
        this.agent = agent
        this.conversation = conversation ?? Conversation()
    }

    private func buildFullRequest(request: AgentRequest): AgentRequest {
        if (request.conversation.isSome()) {
            LogUtils.error("The request of ConversationAgent should have no conversation, which will be omitted.")
        }
        // Clone the request and set the conversation
        return request.clone(conversation: this.conversation)
    }

    override public func chat(request: AgentRequest): AgentResponse {
        let resp = this.agent.chat(this.buildFullRequest(request))
        this.conversation.addChatRound(resp.execution.chatRound)
        return resp
    }

    override public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        let asyncResp = this.agent.asyncChat(this.buildFullRequest(request))
        return AsyncAgentResponse( // Wrap the iterator as the AsyncAgentResponse
            IteratorWrapper(this, request, asyncResp), // Wrap the original AsyncAgentResponse as an iterator
            execution: asyncResp.execution
        )
    }
}

/**
 * Wrap the AsyncAgentResponse,
 * merge the full response content and add to the messageList
 */
private class IteratorWrapper <: Iterator<String> {
    protected IteratorWrapper(
        private let agent: ConversationAgent,
        private let request: AgentRequest,
        private let asyncAgentResp: AsyncAgentResponse
    ) { }

    /**
     * To merge all response content
     */
    private let buffer = StringBuilder()

    override public func next(): Option<String> {
        let data = this.asyncAgentResp.next()
        match (data) {
            case Some(v) => buffer.append(v)
            case None =>
                this.agent.conversation.addChatRound(
                    Message.user(this.request.question, image: this.request.image),
                    Message.assistant(this.buffer.toString())
                )
        }
        return data
    }
}

