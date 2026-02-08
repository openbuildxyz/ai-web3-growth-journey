/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights resvered.
 */
package magic.agent_executor.plan_react

import magic.core.agent.*
import magic.core.message.{Message, MessageList}
import magic.core.model.ChatRequest
import magic.prompt.Template
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.jsonable.TypeSchema

import stdx.encoding.json.JsonObject

private let RESULT_SUMMARIZE_PREFIX = """
# Instruction
A question is decomposed as multiple tasks.
Given these tasks and their results, you should summarize an answer for questions.
Directly generate the answer, do not generate irrelevant content.

# Question
The question you should answer.
{question}
-----

# Subtasks
The question is decomposed as multiple tasks. Here are their results.
{progress}
-----
"""

private let RESULT_SUMMARIZE_PROMPT = """
${RESULT_SUMMARIZE_PREFIX}
Now, summarize the answer:
"""

private let RESULT_SUMMARIZE_PROMPT_WITH_OUTPUT_SCHEMA = """
${RESULT_SUMMARIZE_PREFIX}
You MUST output a JSON value obey the schema as the answer. The schema to follow:
{output_schema}

Examples:
Output:
```json 1 ```
```json "result" ```
```json [1, 2, 3] ```
```json ["abc", "opq", "xyz"] ```
"""

private func buildSummarizePrompt(planTask: PlanTask): String {
    if (let Some(schema) <- planTask.request.outputSchema) {
        return RESULT_SUMMARIZE_PROMPT_WITH_OUTPUT_SCHEMA.format([
            ("question", planTask.request.question),
            ("progress", planTask.progress),
            ("output_schema", (schema as TypeSchema).getOrThrow())
        ])
    } else {
        return RESULT_SUMMARIZE_PROMPT.format([
            ("question", planTask.request.question),
            ("progress", planTask.progress)
        ])
    }
}

func resultSummarize(planTask: PlanTask): String {
    let messages = MessageList([
        Message.user(buildSummarizePrompt(planTask))
    ])
    return planTask.chatLLM(messages).message.content
}

func asyncResultSummarize(planTask: PlanTask): Iterator<String> {
    let messages = [
        Message.user(buildSummarizePrompt(planTask))
    ]
    LogUtils.info(planTask.agent.name, messages)
    return planTask.agent.model.asyncCreate(ChatRequest(messages)).iter()
}