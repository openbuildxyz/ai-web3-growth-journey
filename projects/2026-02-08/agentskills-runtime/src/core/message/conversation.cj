/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

import magic.jsonable.{Jsonable, FromJsonValue, ToJsonValue, JsonUtils}

import std.collection.{ArrayList}
import std.fs.{Path, File}
import stdx.encoding.json.*

public class CompactedConversation <: FromJsonValue<CompactedConversation> & ToJsonValue {
    public CompactedConversation(
        /**
         * Chat rounds of the conversation
         */
        public let chatRounds: Option<Array<ChatRound>>,

        /**
         * Summary of the conversation
         */
        public let summary: String
    ) { }

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        if (let Some(chatRounds) <- this.chatRounds) {
            jo.put("chatRounds", chatRounds.toJsonValue())
        }
        jo.put("summary", JsonString(summary))
        return jo
    }

    redef static public func fromJsonValue(json: JsonValue): CompactedConversation {
        return CompactedConversation(
            JsonUtils.getJsonValue(json, "chatRounds").map { jv => Array<ChatRound>.fromJsonValue(jv) },
            JsonUtils.getString(json, "summary").getOrThrow()
        )
    }
}

/**
 * A conversation is a collection of QA chat rounds.
 */
public class Conversation <: Iterable<ChatRound> & FromJsonValue<Conversation> & ToJsonValue  {
    /**
     * Chat round of the current conversation
     */
    private let chatRounds = ArrayList<ChatRound>()

    /**
     * Previous compacted conversations and their summary
     */
    private let compactedConversations = ArrayList<CompactedConversation>()

    public init() { }

    public init(round: ChatRound) {
        this.addChatRound(round)
    }

    public func addChatRound(round: ChatRound): Unit {
        this.chatRounds.add(round)
    }

    public func addChatRound(question: Message, answer: Message, steps!: MessageList = MessageList()): Unit {
        this.addChatRound(ChatRound(question, answer, steps))
    }

    override public func iterator(): Iterator<ChatRound> {
        return this.chatRounds.iterator()
    }

    public prop compacts: Array<CompactedConversation> {
        get() {
            return this.compactedConversations.toArray()
        }
    }

    public operator func [](index: Int64): ChatRound {
        return this.chatRounds[index]
    }

    /**
     * Slice the conversation, used by compactBy
     */
    private operator func [](range: Range<Int64>): Conversation {
        let result = Conversation()
        for (chatRound in this.chatRounds[range]) {
            result.chatRounds.add(chatRound)
        }
        return result
    }

    public func clone(): Conversation {
        let result = Conversation()
        result.chatRounds.add(all: this.chatRounds.toArray().clone())
        result.compactedConversations.add(all: this.compactedConversations.toArray().clone())
        result
    }

    public prop size: Int64 {
        get() { this.chatRounds.size }
    }

    public func isEmpty(): Bool {
        return this.chatRounds.isEmpty()
    }

    public func clear(): Unit {
        this.chatRounds.clear()
    }

    /**
     * Compact the current conversation and save the summary
     * `firstN` means first first N chat rounds to be compact
     * `keepOrigin` means whether save the original conversation messages
     */
    public func compactBy(compactor: ConversationCompactor,
                          firstN!: Option<Int64> = None,
                          keepOrigin!: Bool = true): String {
        let end = min(firstN ?? this.chatRounds.size, this.chatRounds.size)
        // Whether the full conversation is to be compact
        // If so, there is no need to create a new conversation
        let conversation2Compact = if (end == this.chatRounds.size) {
            this
        } else {
            this[0..end]
        }
        let summary = compactor.compact(conversation2Compact)
        this.compactedConversations.add(
            CompactedConversation(
                if (keepOrigin) { conversation2Compact.chatRounds.toArray() } else { None },
                summary
            )
        )
        // Reset the current conversation
        if (end == this.chatRounds.size) {
            this.chatRounds.clear()
        } else {
            this.chatRounds.remove(0..end)
        }
        return summary
    }

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        jo.put("chatRounds", this.chatRounds.toArray().toJsonValue())
        jo.put("compactedConversations", this.compactedConversations.toArray().toJsonValue())
        return jo
    }

    redef static public func fromJsonValue(json: JsonValue): Conversation {
        let conversation = Conversation()
        conversation.chatRounds.add(all: Array<ChatRound>.fromJsonValue(
            JsonUtils.getJsonValue(json, "chatRounds").getOrThrow()
        ))
        if (let Some(jv) <- JsonUtils.getJsonValue(json, "compactedConversations")) {
            conversation.compactedConversations.add(all: Array<CompactedConversation>.fromJsonValue(jv))
        }
        return conversation
    }

    /**
     * Save the conversation to a file
     */
    public func save(path: Path): Unit {
        File.writeTo(path, this.toJsonValue().toJsonString().toArray())
    }

    /**
     * Load a conversation from a file
     */
    public static func load(path: Path): Conversation {
        return File.readFrom(path) |>
            String.fromUtf8 |>
            JsonValue.fromStr |>
            Conversation.fromJsonValue
    }
}