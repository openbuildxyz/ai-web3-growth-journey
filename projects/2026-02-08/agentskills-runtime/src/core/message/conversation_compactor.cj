/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

/**
 * Compact the conversation
 */
public interface ConversationCompactor {
    /**
     * Compact the conversation a list of messages
     */
    func compact(conversation: Conversation): String
}