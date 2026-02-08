/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.plan_react

import magic.core.agent.*
import magic.agent.base.BaseAgent
import magic.core.message.{Message, MessageList}
import magic.core.model.ChatRequest
import magic.agent_executor.react.{ReactPromptUtils, ReactExecutor}
import magic.interaction.EventHandlerManager
import magic.utils.*
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.prompt.Template

import std.sync.AtomicBool

private let REACT_WORKER_SYSTEM_PROMPT = """
# Instruction
An original question is decomposed as tasks, and each of them has the following component:
- Task-Name: name of the task
- Task-Goal: the main purpose of the task, and what will you do to reach this goal?
- Task-Milestones: the milestones should be achieved to ensure the task is done
-----

# Original Question
This is the original question, but you should not answer it:
{original_question}
-----

# Knowledge
{knowledge}
-----

# Previous Tasks And Results
There are some previous tasks and their results:
{progress}
-----
"""

private let REACT_WORKER_USER_PROMPT = """
# The Current Task

This is the task you are required to solve:
{task}
-----

You can take the Task-Milestones as a reference of solution steps.
Now, solve the task (NOT answer the original question):
"""

class ReactWorker <: BaseAgent {
    private let planTask: PlanTask

    init(planTask: PlanTask) {
        super(
            model: planTask.agent.model,
            name: "React Worker Agent"
        )
        this.planTask = planTask
        this.toolManager.addTools(planTask.agent.toolManager.tools)
        this.executor = ReactExecutor()
    }

    private func buildSystemPrompt(): String {
        return REACT_WORKER_SYSTEM_PROMPT.format(
            ("original_question", this.planTask.request.question),
            ("knowledge", this.planTask.knowledge),
            ("progress", this.planTask.progress)
        ).trimAscii()
    }

    private func prepareBeforeSolve(subtask: Subtask): AgentRequest {
        // The progress will be updated, so we build the system prompt each time
        this.systemPrompt = this.buildSystemPrompt()
        // React worker inherit the same verbose setting and event handler managers
        let request = AgentRequest(
            REACT_WORKER_USER_PROMPT.format(("task", subtask.complexDescription)),
            verbose: this.planTask.request.verbose
        )
        // Inherit the event handlers
        request.eventHandlerManager = this.planTask.request.eventHandlerManager
        // Mark the request as dispatched to a subagent
        request.dispatchToSubagent = true
        return request
    }

    func solve(subtask: Subtask): String {
        let request = this.prepareBeforeSolve(subtask)
        return this.chat(request).content
    }
}
