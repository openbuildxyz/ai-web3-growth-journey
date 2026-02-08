/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

import magic.core.message.{ChatRound, Message, MessageList}
import magic.core.rag.RetrievalInfo
import magic.core.interaction.EventStream

import std.collection.ArrayList

/**
 * Provide APIs to access the agent execution information
 */
public interface AgentExecution {
    /**
     * Complete messages, including system prompts, user questions, internal assistant messages
     * Internally used thought it's public
     */
    prop messages: MessageList

    /**
     * Step messages, including user questions, internal assistant messages
     */
    prop steps: MessageList

    /**
     * Only access this field when setting `verbose: true` in AgentRequest
     */
    prop events: EventStream

    /**
     * RAG info when used
     */
    prop retrievalInfo: ArrayList<RetrievalInfo>

    /**
     * The current chat round, including the question, internal assistant execution messages, and the answer
     */
    prop chatRound: ChatRound

    /**
     * Internally used thought it's public
     */
    func setAnswer(answer: String): Unit

    /**
     * Set the cancellation mark
     * Internally used.
     */
    func markCancellation(): Unit
}

