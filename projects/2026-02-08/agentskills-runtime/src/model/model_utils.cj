/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model

import magic.core.agent.Agent
import magic.core.message.*
import magic.core.model.*
import magic.core.tool.Tool
import magic.log.LogUtils
import magic.config.Config
import magic.utils.{getEnv, sleep2}
import magic.core.interaction.*
import magic.interaction.*

import std.collection.{filter, collectArray}

//====================================================================================

public struct ModelUtils {
    private static func parseChatResponse(response: ChatResponse): Option<ChatResponse> {
        let message = response.message
        if (message.role != MessageRole.Assistant) {
            LogUtils.error("The chat model did not reply an assistant message")
            return None
        }
        if (message.content.isEmpty() && message.reason.isNone() && response.toolRequests.isEmpty()) {
            LogUtils.error("The chat model replied an empty message")
            return None
        }
        return response
    }

    private static func makeChatImpl(model: ChatModel, request: ChatRequest): Option<ChatResponse> {
        LogUtils.trace('--------------- Begin of chat model request ------------')
        try {
            LogUtils.trace('  --------------- [Request Messages] ------------')
            LogUtils.trace(request.messageList)
            LogUtils.trace('  --------------- [End of Request Messages] ------------')
            // The LLM may return an empty reply?
            for (_ in 0..Config.modelRetryNumber) {
                let response = model.create(request)
                if (let Some(msg) <- ModelUtils.parseChatResponse(response)) {
                    return msg
                }
                // Backoff
                sleep2(500)
            }
            return None
        } finally {
            LogUtils.trace('--------------- End of chat model request ------------')
        }
    }

    public static func makeChat(model: ChatModel,
                                messageList: MessageList,
                                temperature!: Option<Float64> = None,
                                stop!: Option<Array<String>> = None): Option<ChatResponse> {
        let request = ChatRequest(messageList, temperature: temperature, stop: stop)
        return ModelUtils.makeChatImpl(model, request)
    }

    public static func makeChat(name: String,
                                model: ChatModel,
                                messageList: MessageList,
                                temperature!: Option<Float64> = None,
                                stop!: Option<Array<String>> = None): Option<ChatResponse> {
        let request = ChatRequest(messageList, temperature: temperature, stop: stop)
        return ModelUtils.makeChatImpl(model, request)
    }

    public static func agentMakeChat(agent: Agent,
                                     request: ChatRequest): Option<ChatResponse> {
        return ModelUtils.makeChatImpl(agent.model, request)
    }
}
