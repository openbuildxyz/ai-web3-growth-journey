/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.http

import magic.log.LogUtils

import std.collection.ArrayList
import stdx.encoding.json.{JsonValue, JsonException}

/**
 * SSEItem is a simple structure to represent an SSE item with a tag and content, like:
 * data: xxx
 * event: xxx
 */
protected struct SSEItem <: ToString {
    SSEItem(protected let tag: String,
            protected let content: String) { }

    override public func toString(): String {
        return "tag: ${content}"
    }
}

protected class SSEStream <: Iterator<SSEItem> {
    private static let TAGS = [ "data", "event" /* "retry" */ ]

    protected SSEStream(private let httpStream: HttpStream) { }

    private func read(): Option<SSEItem> {
        while (let Some(line) <- this.httpStream.next()) {
            if (line.trimAscii().isEmpty() ||
                line.startsWith(": ping") ||
                line.startsWith(": keep-alive")) {
                continue
            }

            for (tag in SSEStream.TAGS) {
                if (line.startsWith("${tag}:")) {
                    let content = line.removePrefix("${tag}:").trimAscii()
                    if (content.isEmpty()) {
                        throw HttpException("Invalid sse ${tag} with empty content")
                    }
                    return Some(SSEItem(tag, content))
                }
            }
            throw HttpException("Invalid sse line: `${line}`")
        }
        LogUtils.trace("SSE stream finished")
        return None
    }

    override public func next(): Option<SSEItem> {
        return this.read()
    }

    public func close(): Unit {
        this.httpStream.close()
    }
}

protected struct SSEvent <: ToString {
    SSEvent(protected let event: String,
            protected let data: String) { }

    override public func toString(): String {
        return "event: ${event}\ndata: ${data}"
    }
}

protected class SSEventStream <: Iterator<SSEvent> {
    private let sseStream: SSEStream

    protected init(httpStream: HttpStream) {
        this.sseStream = SSEStream(httpStream)
    }

    override public func next(): Option<SSEvent> {
        while (true) {
            // Receive the pair of event and data
            let event = if (let Some(sseItem) <- this.sseStream.next()) {
                if (sseItem.tag != "event") {
                    throw HttpException("Invalid SSE event: `${sseItem}`")
                }
                sseItem.content
            } else {
                LogUtils.trace("SSE stream finished")
                return None
            }
            LogUtils.trace("SSE stream read event: ${event}")

            let data = if (let Some(sseItem) <- this.sseStream.next()) {
                if (sseItem.tag != "data") {
                    throw HttpException("Invalid SSE data: `${sseItem}`")
                }
                sseItem.content
            } else {
                LogUtils.trace("SSE stream finished")
                return None
            }
            LogUtils.trace("SSE stream read data: ${data}")

            return SSEvent(event, data)
        }
        throw UnsupportedException("Unreachable")
    }

    public func close(): Unit {
        this.sseStream.close()
    }
}
