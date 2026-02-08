/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.naive

import magic.core.agent.*
import magic.utils.*
import magic.agent_executor.common.AgentTask
import magic.agent_executor.react.ReactPromptUtils
import magic.log.LogUtils
import magic.core.message.{Message, MessageList, Conversation}
import magic.core.model.ChatRequest
import magic.model.ModelUtils
import magic.prompt.Template
import magic.agent_executor.common.*
import magic.jsonable.TypeSchema

import std.collection.collectArray
import stdx.encoding.json.JsonObject

private let NAIVE_SYSTEM_PROMPT_WITH_STRUCTURE_OUTPUT = """
{system_prompt}

You MUST output a JSON value obey the schema as the answer. The schema to follow:
{output_schema}

Examples:
Output:
```json 1 ```
```json "result" ```
```json [1, 2, 3] ```
```json ["abc", "opq", "xyz"] ```
"""

public class NaiveExecutor <: AgentExecutor {
    override public prop name: String {
        get() { "naive" }
    }

    private func buildNaiveSystemPrompt(task: AgentTask): String {
        // The system prompt of a naive agent may be empty
        let sysPrompt = if (task.agent.systemPrompt.isEmpty()) {
            "Answer user question"
        } else {
            task.agent.systemPrompt
        }
        return task.request.outputSchema
            .map { schema =>
                NAIVE_SYSTEM_PROMPT_WITH_STRUCTURE_OUTPUT.format([
                    ("system_prompt", sysPrompt),
                    ("output_schema", (schema as TypeSchema).getOrThrow())
                ])
            }
            .getOrDefault({ => sysPrompt })
    }

    private func buildAgentTask(agent: Agent, request: AgentRequest): AgentTask {
        let task = AgentTask(agent, request)
        PromptBuilder()
            .system(this.buildNaiveSystemPrompt(task))
            .retrieval(PromptBuilder.buildAgentRetrievalPrompt(task))
            .memory(PromptBuilder.buildAgentMemoryPrompt(task))
            .conversation(task.request.conversation, withStepMessage: false)
            .request(request)
            .fillTo(task)
        return task
    }

    public override func run(agent: Agent, request: AgentRequest): AgentResponse {
        let task = this.buildAgentTask(agent, request)
        try {
            task.begin()
            let msg = task.chatLLM(task.execution.messages).message
            LogUtils.info(agent.name, msg)
            return AgentResponse(AgentResponseStatus.Success, msg.content, execution: task.execution)
        } finally {
            task.end()
        }
    }

    public override func asyncRun(agent: Agent, request: AgentRequest): AsyncAgentResponse {
        let task = this.buildAgentTask(agent, request)
        try {
            task.begin()
            LogUtils.info(agent.name, task.execution.messages)
            let asyncChatResp = agent.model.asyncCreate(
                ChatRequest(task.execution.messages, temperature: agent.temperature)
            )
            return AsyncAgentResponse(asyncChatResp.iter(), execution: task.execution)
        } finally {
            task.end()
        }
    }
}
