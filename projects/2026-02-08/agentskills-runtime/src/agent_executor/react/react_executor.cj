/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.react

import magic.agent_executor.common.*
import magic.core.agent.*
import magic.core.rag.RetrieverMode
import magic.core.message.WithTag
import magic.config.Config
import magic.log.LogUtils

public class ReactExecutor <: AgentExecutor {
    public ReactExecutor(private let loop!: Int64 = Config.maxReactNumber) {}

    override public prop name: String {
        get() { "react" }
    }

    override public func run(agent: Agent, request: AgentRequest): AgentResponse {
        let task = ReactTask(agent, request)
        try {
            task.begin()
            for (_ in 0..this.loop) {
                if (let Some(answer) <- task.runOnce()) {
                    return AgentResponse(AgentResponseStatus.Success, answer, execution: task.execution)
                } else if (let Some(stopInfo) <- task.stopInfo) {
                    LogUtils.info("Task stopped: ${stopInfo.reason}")
                    return AgentResponse(AgentResponseStatus.Success, stopInfo.result, execution: task.execution)
                }
                task.handleAgentStepEvent()
            }
            let answer = task.summarize()
            return AgentResponse(AgentResponseStatus.Success, answer, execution: task.execution)
        } finally {
            task.end()
        }
    }

    override public func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse {
        let task = ReactTask(agent, request)
        // Create a thread to execute the react task
        let fut: Future<Iterator<String>> = spawn {
            try {
                task.begin()
                for (_ in 0..this.loop) {
                    if (let Some(asyncAnswer) <- task.asyncRunOnce()) {
                        return asyncAnswer
                    }
                    if (let Some(stopInfo) <- task.stopInfo) {
                        LogUtils.info("Task stopped: ${stopInfo.reason}")
                        return AsyncAgentResponse([stopInfo.result].iterator(), execution: task.execution)
                    }
                    task.handleAgentStepEvent()
                }
                LogUtils.info("Exceed the max react loop")
                return task.asyncSummarize()
            } finally {
                task.end()
            }
        }
        return AsyncAgentResponse(FutureIteratorWrapper(task, fut), execution: task.execution)
    }
}
