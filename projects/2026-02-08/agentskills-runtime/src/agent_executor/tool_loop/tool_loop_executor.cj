/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.tool_loop

import magic.core.agent.*
import magic.core.message.{Message, MessageList, Tag, WithTag}
import magic.core.model.{ChatRequest}
import magic.config.Config
import magic.agent.base.AgentOp
import magic.agent_executor.common.{AgentTask, PromptBuilder, FutureIteratorWrapper}
import magic.agent_executor.dsl.{ExecutionOpSet, ExecutionState}
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.prompt.Template
import magic.tool.NativeFuncTool
import magic.interaction.{AgentStartEvent, AgentEndEvent}
import magic.utils.*

/*
 * This executor loops to select tools and execute it.
 * Different from the react executor, it does not produce thoughts.
 */
public class ToolLoopExecutor <: AgentExecutor {
    public ToolLoopExecutor(
        private let loop!: Int64 = Config.maxReactNumber
    ) { }

     override public prop name: String {
        get() { "tool-loop" }
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
        var state = ExecutionState(task)
        try {
            task.begin()
            for (_ in 0..this.loop) {
                state = ExecutionOpSet.action(state)
                if (state.done) {
                    return state.answer
                }
                if (let Some(stopInfo) <- state.task.stopInfo) {
                    LogUtils.info("Task stopped: ${stopInfo.reason}")
                    return stopInfo.result
                }
                task.handleAgentStepEvent()
            }
            LogUtils.info("Exceed the max loop")
            state = ExecutionOpSet.answer(state)
            return state.answer
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
