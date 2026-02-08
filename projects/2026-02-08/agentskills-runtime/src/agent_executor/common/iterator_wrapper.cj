/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

import magic.core.agent.Agent
import magic.core.message.{Tag, WithTag}
import magic.log.LogUtils

protected class FutureIteratorWrapper <: Iterator<String> {
    protected FutureIteratorWrapper(
        private let task: AgentTask,
        private let fut: Future<Iterator<String>>
    ) { }

    /**
     * Concatenate all response content and log it finally
     */
    private let buffer = StringBuilder()

    override public func next(): Option<String> {
        let iterator = fut.get() // The exception will be thrown here if any
        let data = iterator.next()
        match (data) {
            case Some(v) => buffer.append(v)
            case None =>
                let answer = buffer.toString()
                LogUtils.info(task.agent.name, answer.withTag(Tag.Answer))
        }
        return data
    }
}