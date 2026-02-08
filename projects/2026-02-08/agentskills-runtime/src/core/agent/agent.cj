/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

import magic.core.model.ChatModel
import magic.core.rag.Retriever
import magic.core.memory.Memory
import magic.core.tool.{Tool, ToolManager}

public interface Agent {
    /**
     * Name of the agent
     */
    mut prop name: String

    /**
     * Functionality description of the agent
     */
    prop description: String

    /**
     * Temperature the agent will pass to the LLM
     */
    mut prop temperature: Option<Float64>

    /**
     * System prompt of the agent
     */
    mut prop systemPrompt: String

    /**
     * Tools the agent can use
     */
    prop toolManager: ToolManager

    /**
     * Chat model the agent will use
     */
    mut prop model: ChatModel

    /**
     * The underlying agent executor
     */
    mut prop executor: AgentExecutor

    /**
     * Retriever the agent can use
     */
    mut prop retriever: Option<Retriever>

    /**
     * Memory the agent will use
     */
    mut prop memory: Option<Memory>

    /**
     * Set the agent interceptor
     */
    mut prop interceptor: Option<Interceptor>

    /**
     * The agent event handler manager, since there is cycle dependency between agent and event handler manager,
     * we use Object instead of EventHandlerManager.
     */
    prop eventHandlerManager: Option<Object>

    /**
     * Query the agent and get the answer
     * It may throw AgentExecutionException
     */
    func chat(request: AgentRequest): AgentResponse

    /**
     * Quick usage of the chat method
     * Since there is a bug in cjc 0.53.x, we cannot add this method.
     * Fix it later.
     */
    // func chat(question: String): String {
    //     return chat(AgentRequest(question)).content
    // }

    /**
     * Query the agent and get the answer
     * It returns the agent reply in stream
     */
    func asyncChat(request: AgentRequest): AsyncAgentResponse
}
