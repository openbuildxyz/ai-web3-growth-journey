/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

import magic.core.message.{Message, MessageRole, MessageList}

import std.sync.AtomicBool

public struct AsyncChatChunk <: ToString {
    protected AsyncChatChunk(
        public let message!: Message,
        public let done!: Bool = false,
        public let usage!: Option<ChatUsage> = None
    ) { }

    override public func toString(): String {
        let strBuilder = StringBuilder()
        strBuilder.append("AsyncChatChunk: Usage[${usage.toString()}]\n")
        strBuilder.append("${this.message}")
        strBuilder.toString()
    }
}

/**
 * Wrap the async chat response as a string iterator
 */
private class AsyncChatResponseIterator <: Iterator<String> {
    AsyncChatResponseIterator(
        private let asyncChatResp: AsyncChatResponse,
        private let withReason: Bool
    ) { }

    override public func next(): Option<String> {
        return match (this.asyncChatResp.next()) {
            case Some(chunk) =>
                if (withReason) {
                    chunk.message.reason ?? chunk.message.content
                } else {
                    chunk.message.content
                }
            case None => None
        }
    }
}

public class AsyncChatResponse <: ChatResponse {
    public let chunks: Iterator<AsyncChatChunk>
    // The following fields will be update during receiving chunks
    private var role = MessageRole.Assistant
    private let content = StringBuilder()
    // The following fields will be set when the response stream is finished
    private var _usage: Option<ChatUsage> = None
    private var _message = Message.assistant("")
    private let finished = AtomicBool(false)

    protected init(model: String, chunks: Iterator<AsyncChatChunk>) {
        super(model)
        this.chunks = chunks
    }

    override public prop usage: Option<ChatUsage> {
        get() {
            if (!finished.load()) {
                return None
            } else {
                _usage
            }
        }
    }

    /**
     * This method is synchronous, it will wait until the chat response completes.
     */
    override public prop message: Message {
        get() {
            if (!finished.load()) {
                // Consume all chunks
                while (let Some(_) <- this.next()) { }
            }
            this._message
        }
    }

    /**
     * Used by AsyncChatResponseIterator
     */
    func next(): Option<AsyncChatChunk> {
        if (finished.load()) {
            return None
        }
        while (let Some(chunk) <- chunks.next()) {
            if (chunk.message.role != this.role) {
                throw ModelException("Inconsistent message role")
            }
            content.append(chunk.message.content)
            if (chunk.done) {
                this._message = Message(this.role, content.toString())
                this._usage = chunk.usage
                finished.store(true)
                return None
            } else {
                return chunk
            }
        }
        throw UnsupportedException("Unreachable")
    }

    public func iter(withReason!: Bool = true): Iterator<String> {
        AsyncChatResponseIterator(this, withReason)
    }
}