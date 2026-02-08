/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.core.message

import std.collection.*

/**
 * A message list that limits the total length of messages to a specified context length.
 */
protected class BoundedMessageList <: MessageList {
    private let contextLength: Int64
    private var currTotalLength: Int64 = 0
    // Length of each message in the messageList, used to calculate the total size
    private let messageLengthMap = ArrayList<Int64>()
    // Record the position of the system message, if exists
    private var posOfSystemMessage: Option<Int64> = None
    private let computeFn: (String) -> Int64

    public init(contextLength: Int64, computeFn!: (String) -> Int64) {
        this.contextLength = contextLength
        this.computeFn = computeFn
    }

    public override func add(msg: Message): Unit {
        if (posOfSystemMessage.isNone() && msg.role == MessageRole.System) {
            if (!this.isEmpty()) {
                eprintln("System message should be the first message in the messageList.")
            }
            posOfSystemMessage = super.size
        }
        super.add(msg)
        let msgLen = this.computeFn(msg.content)
        this.currTotalLength += msgLen
        this.messageLengthMap.add(msgLen)
        // If the total length exceeds the context length, remove messages
        if (this.currTotalLength > this.contextLength) {
            this.removeExcessMessages()
        }
    }

    /**
     * Remove excess messages from the messageList to keep the total length within the context length.
     * It will remove the oldest message after the system message iteratively, if exists
     * This is a heuristic that messageList messages are after the system message.
     */
    private func removeExcessMessages(): Unit {
        let posToRemove = (this.posOfSystemMessage ?? -1) + 1
        while (this.currTotalLength > this.contextLength &&
               super.size > posToRemove) {
            super.remove(at: posToRemove)
            this.currTotalLength -= messageLengthMap.remove(at: posToRemove)
        }
    }

    public override func removeLast(): Message {
        let msg = super.removeLast()
        this.currTotalLength -= messageLengthMap.remove(at: messageLengthMap.size - 1)
        msg
    }
}
