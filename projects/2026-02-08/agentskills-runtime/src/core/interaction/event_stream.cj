/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.interaction

import magic.log.LogUtils

import std.collection.concurrent.LinkedBlockingQueue
import std.sync.AtomicBool

/**
 * A simple channel to transfer tagged content between threads
 */
public class EventStream <: Iterator<InteractionEvent> {
    private var finished = AtomicBool(false)

    private let queue = LinkedBlockingQueue<InteractionEvent>()

    public func next(): Option<InteractionEvent> {
        if (finished.load()) {
            return None
        }
        // If multiple threads reach here, threads may stall
        let event = this.queue.remove()
        if (event.kind == EventKind.Sentinel) {
            finished.store(true)
            return None
        } else {
            LogUtils.trace("[Event Stream]", "Get: ${event}")
            return event
        }
    }

    protected func put(event: InteractionEvent): Unit {
        LogUtils.trace("[Event Stream]", "Put: ${event}")
        this.queue.add(event)
    }

    protected func close(): Unit {
        this.queue.add(InteractionEvent(EventKind.Sentinel))
    }
}

