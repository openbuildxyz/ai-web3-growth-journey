/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.compactor

import magic.core.model.{ChatModel, ChatRequest}
import magic.core.message.{Message, MessageList, Conversation, ConversationCompactor}
import magic.prompt.Template
import magic.log.LogUtils

/**
 * Compact the tool invocation
 */
public class SimpleConversationCompactor <: ConversationCompactor {
    private let name = "Simple Conversation Compactor"

    public SimpleConversationCompactor(
        private let model: ChatModel
    ) { }

    /**
    * This agent attempts to summarize the tool execution results into concise and structured summaries.
    **/
    override public func compact(conversation: Conversation): String {
        LogUtils.info(this.name, "Start to summarize conversation")
        let messages = MessageList([
            Message.system(CONVERSATION_SUMMARY_SYSTEM_PROMPT)
        ])
        // Compose messages of all chat rounds
        for (chatRound in conversation) {
            messages.add(chatRound.question)
            for (step in chatRound.steps) {
                messages.add(step)
            }
            messages.add(chatRound.answer)
        }
        messages.add(
            Message.system("Now, summarize the conversation.")
        )
        let summary = this.model.create(ChatRequest(messages)).message.content
        LogUtils.debug(
            this.name,
            String.join(
                [
                    "Conversation Summary:",
                    "--------------------------------------",
                    summary
                ],
                delimiter: "\n"
            )
        )
        return summary
    }
}