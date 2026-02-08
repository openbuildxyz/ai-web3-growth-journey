/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

import magic.core.message.{Message, Tag, WithTag}
import magic.log.LogUtils

import std.collection.ArrayList

/**
 * The asynchronous execution response from an agent executor
 */
public class AsyncAgentResponse <: AgentResponse {
    /**
     * Data chunks of the final result
     */
    private let chunks: Iterator<String>

    /**
     * Merge all chunk content
     */
    private let buffer = StringBuilder()

    /**
     * Whether the execution is finished
     * If not finished, the content is still being generated
     * If finished, the content is complete
     */
    private var finished = false

    /**
     * Callback functions when the execution is finished
     * The first parameter is the whether the response is okay
     */
    private let finishFnList = ArrayList<(Bool) -> Unit>()

    public init(chunks: Iterator<String>) {
        super(AgentResponseStatus.Success, "")
        this.chunks = chunks
    }

    public init(chunks: Iterator<String>, execution!: AgentExecution) {
        super(AgentResponseStatus.Success, "", execution: execution)
        this.chunks = chunks
    }

    /**
     * The final result
     * This is a synchronous method, which will wait until the executor completes
     */
    override public prop content: String {
        get() {
            if (!this.finished) {
                this.waitUntilFinished()
            }
            return buffer.toString()
        }
    }

    /**
     * The status of the response
     * This is a synchronous method, which will wait until the executor completes
     */
    override public prop status: AgentResponseStatus {
        get() {
            if (!this.finished) {
                this.waitUntilFinished()
            }
            return this._status
        }
    }

    /**
     * Set the callback function when the execution is finished
     * The first parameter is the whether the response succeeded
     */
    public func addFinishFn(fn: (Bool) -> Unit) {
        this.finishFnList.add(fn)
    }

    /**
     * Wait until the response is finished
     */
    private func waitUntilFinished() {
        if (!this.finished) {
            // Consume all chunks
            for (_ in this) { }
        }
    }

    override public func next(): Option<String> {
        if (this.finished) {
            return None
        }

        try {
            match (this.chunks.next()) { // The exception will be thrown here if any
                case Some(data) =>
                    buffer.append(data)
                    return data
                case None =>
                    let answer = buffer.toString()
                    if (let Some(execution) <- this._execution) {
                        execution.setAnswer(answer)
                    }
                    this._status = AgentResponseStatus.Success
                    this.finished = true
                    for (fn in this.finishFnList) {
                        fn(true)
                    }
                    return None
            }
        } catch (ex: AgentCancelException) {
            LogUtils.info("Agent execution cancelled by user")
            // Clear the result buffer
            this.buffer.reset()
            // Set the status to canceled
            this._status = AgentResponseStatus.Cancelled
            this.buffer.append(ex.reason)
            this.finished = true
            for (fn in this.finishFnList) {
                fn(true)
            }
            return None
        } catch (ex: Exception) {
            // Clear the result buffer
            this.buffer.reset()
            // Set the status to failed
            this._status = AgentResponseStatus.Failed
            this.buffer.append(ex.message)
            this.finished = true
            for (fn in this.finishFnList) {
                fn(false)
            }
            throw ex
        }
    }

    /**
     * Cancelled the agent execution
     * Wait until the execution is stopped.
     */
    public func cancel(blocking!: Bool): Unit {
        this.execution.markCancellation()
        if (blocking) {
            // Consume all chunks
            for (_ in this) { }
        }
    }
}
