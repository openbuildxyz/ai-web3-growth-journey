/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.http

import magic.log.LogUtils
import magic.dsl.prompt

import std.collection.concurrent.LinkedBlockingQueue
import std.collection.{HashMap, ArrayList}
import std.io.{InputStream, StringReader}

import stdx.encoding.json.JsonObject

private enum Item {
    | Bytes(Array<Byte>)
    | EOF
    | Error
}

/**
 * A http stream is an iterator of strings
 * Wrap of a blocking queue to support streaming.
 */
public class HttpStream <: Iterator<String> & InputStream {
    private let queue = LinkedBlockingQueue<Item>()
    private let byteBuffer = ArrayList<Byte>()
    private let closeFn: Option<() -> Unit>
    // Set when all data is consumed
    private var finished = false

    protected init(closeFn!: Option<() -> Unit> = None) {
        this.closeFn = closeFn
    }

    private func readBytes(): Option<Array<Byte>> {
        if (this.finished) {
            return None
        }
        match (this.queue.remove()) {
            case Error =>
                throw HttpException("Http byte stream error")
            case EOF =>
                finished = true
                LogUtils.debug("Http byte stream finished")
                return None
            case Bytes(bytes) =>
                return bytes
        }
    }

    override public func read(buffer: Array<Byte>): Int64 {
        if (this.byteBuffer.isEmpty()) {
            if (let Some(bytes) <- this.readBytes()) {
                // If the bytes read are less than or equal to the buffer size,
                // copy them directly to the buffer and return the size.
                // Otherwise, add them to the byte buffer for later reading.
                if (bytes.size <= buffer.size) {
                    bytes.copyTo(buffer, 0, 0, bytes.size)
                    return bytes.size
                } else {
                    this.byteBuffer.add(all: bytes)
                }
            } else {
                // No more data to read
                return 0
            }
        }
        // Copy the data from the byte buffer to the provided buffer
        let len = min(this.byteBuffer.size, buffer.size)
        unsafe {
            let bytes = this.byteBuffer.getRawArray()
            bytes.copyTo(buffer, 0, 0, len)
        }
        // If the full byte buffer is copied, clear it
        // Otherwise, remove the copied bytes from the front
        if (this.byteBuffer.size == len) {
            this.byteBuffer.clear()
        } else {
            this.byteBuffer.remove(0..len)
        }
        return len
    }

    var _reader: Option<StringReader<HttpStream>> = None
    private prop reader: StringReader<HttpStream> {
        get() {
            if (let Some(r) <- this._reader) {
                return r
            } else {
                let r = StringReader(this)
                this._reader = r
                return r
            }
        }
    }

    override public func next(): Option<String> {
        let line = this.reader.readln()
        LogUtils.trace("[Http Stream]", "Read line: `${line}`")
        return line
    }

    protected func put(data: Array<Byte>): Unit {
        // LogUtils.debug("put data: `${data}`")
        queue.add(Item.Bytes(data))
    }

    protected func markEOF(): Unit {
        queue.add(Item.EOF)
    }

    protected func markError(): Unit {
        queue.add(Item.Error)
    }

    protected func close(): Unit {
        this.markEOF()
        if (let Some(fn) <- this.closeFn) {
            fn()
        }
    }
}
