/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

import magic.core.message.Message
import magic.core.tokenizer.Tokenizer

public interface ChatModel <: Model {
    /**
     * The context length of the chat model
     */
    prop contextLength: Int64

    /**
     * Control the max output tokens of the chat model
     */
    mut prop maxTokens: Option<Int64>

    /**
     * Synchronous API of the chat model
     */
    func create(request: ChatRequest): ChatResponse

    /**
     * Quick usage of the create method
     * Since there is a bug in cjc 0.53.x, we cannot add this method.
     * Fix it later.
     */
    // func create(messages: Array<Message>): ChatResponse {
    //     return create(ChatRequest(messages))
    // }

    /**
     * Asynchronous API of the chat model
     */
    func asyncCreate(request: ChatRequest): AsyncChatResponse
}
