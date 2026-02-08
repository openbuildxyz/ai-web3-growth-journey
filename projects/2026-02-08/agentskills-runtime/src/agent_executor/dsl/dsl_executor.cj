/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.dsl

import magic.core.agent.*
import magic.agent.base.{AgentOp, UserDefinedAgent}
import magic.agent_executor.common.{AgentTask, PromptBuilder, FutureIteratorWrapper}
import magic.log.LogUtils
import magic.interaction.{AgentStartEvent, AgentEndEvent}

public class DslExecutor <: AgentExecutor {
    override public prop name: String {
        get() { "dsl" }
    }

    private func buildAgentTask(agent: Agent, request: AgentRequest): AgentTask {
       let task = AgentTask(agent, request)
       PromptBuilder()
            .system(agent.systemPrompt)
            .retrieval(PromptBuilder.buildAgentRetrievalPrompt(task))
            .memory(PromptBuilder.buildAgentMemoryPrompt(task))
            .conversation(request.conversation, withStepMessage: true)
            .request(request)
            .fillTo(task)
        return task
    }

    private func doRun(task: AgentTask): String {
        let ag = (task.agent as UserDefinedAgent).getOrThrow({ =>
            AgentExecutionException("Only agents defined by @agent can use the dsl executor")
        })
        let initState = ExecutionState(task)
        try {
            task.begin()
            let object = ag.__customized_execution_func__(initState).getOrThrow({ =>
                throw AgentExecutionException("Agent failed to execute __customized_execution_func__")
            })
            let finalState = (object as ExecutionState).getOrThrow()
            if (!finalState.done) {
                throw AgentExecutionException("Agent has not solved the question")
            }
            return finalState.answer
        } finally {
            task.end()
        }
    }

    override public func run(agent: Agent, request: AgentRequest): AgentResponse {
        let task = this.buildAgentTask(agent, request)
        try {
            let answer = this.doRun(task)
            return AgentResponse(AgentResponseStatus.Success, answer, execution: task.execution)
        } catch (ex: AgentCancelException) {
            LogUtils.info("Task cancelled by user")
            return AgentResponse(AgentResponseStatus.Cancelled, ex.reason, execution: task.execution)
        }
    }

    override public func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse {
        let task = this.buildAgentTask(agent, request)
        let fut: Future<Iterator<String>> = spawn {
            let answer = this.doRun(task)
            return [answer].iterator()
        } // Cancelled exception will be handled in AsyncAgentResponse
        return AsyncAgentResponse(FutureIteratorWrapper(task, fut), execution: task.execution)
    }
}
