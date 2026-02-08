/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.plan_react

import magic.agent_executor.common.FutureIteratorWrapper
import magic.core.agent.*
import magic.core.message.{Message, MessageList, Tag, WithTag}
import magic.core.model.ChatRequest
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.prompt.Template
import magic.utils.*

protected class PlanReactExecutor <: AgentExecutor {
    protected PlanReactExecutor() { }

    override public prop name: String {
        get() { "plan-react" }
    }

    private func prepareBeforeRun(planTask: PlanTask): PlanTask {
        // Extract necessary knowledge
        planTask.knowledge = knowledgeExtract(planTask)
        // Decompose the problem
        planTask.subtasks = problemDecompose(planTask)
        if (planTask.request.verbose) {
            let strBuilder = StringBuilder()
            strBuilder.append("# The Plan\n")
            for (subtask in planTask.subtasks) {
                strBuilder.append(subtask.toMarkdown())
                strBuilder.append("\n")
            }
            planTask.notify(Tag.Plan, strBuilder.toString())
        }
        planTask.execution.addRequest(planTask.request)
        return planTask
    }

    private func solveSubtasks(planTask: PlanTask): Unit {
        // Solve each subtask
        for (subtask in planTask.subtasks) {
            planTask.notify(Tag.Plan, "Solve the subtask: ${subtask.name}")
            let worker = ReactWorker(planTask)
            let result = worker.solve(subtask)
            subtask.result = result
            if (planTask.request.verbose) {
                planTask.notify(Tag.Info, "# Subtask DONE!\n${subtask.toMarkdown()}")
            }
        }
    }

    override public func run(agent: Agent, request: AgentRequest): AgentResponse {
        let planTask = PlanTask(agent, request)
        try {
            planTask.begin()
            this.prepareBeforeRun(planTask)
            this.solveSubtasks(planTask)
            // Summarize the result
            let result = resultSummarize(planTask)
            LogUtils.info(agent.name, "Summarized answer: ${result}")
            return AgentResponse(AgentResponseStatus.Success, result, execution: planTask.execution)
        } finally {
            planTask.end()
        }
    }

    override public func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse {
        let planTask = PlanTask(agent, request)
        // Create the worker thread
        let fut: Future<Iterator<String>> = spawn {
            try {
                planTask.begin()
                this.prepareBeforeRun(planTask)
                this.solveSubtasks(planTask)
                // Summarize the result
                return asyncResultSummarize(planTask)
            } finally {
                planTask.end()
            }
        }
        return AsyncAgentResponse(
            FutureIteratorWrapper(planTask, fut), execution: planTask.execution
        )
    }
}
