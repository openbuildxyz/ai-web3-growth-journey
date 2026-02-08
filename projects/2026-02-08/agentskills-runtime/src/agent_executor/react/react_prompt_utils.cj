/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.react

import magic.core.*
import magic.agent_executor.common.AgentTask
import magic.core.message.{Message, Conversation, Tag, WithTag, OPEN_TAG_SYMBOL}
import magic.agent_executor.common.PromptBuilder
import magic.log.LogUtils
import magic.config.Config
import magic.prompt.Template
import magic.jsonable.TypeSchema

import stdx.encoding.json.JsonObject

//-----------------------------------------------------
// Define common snippets for system prompts
//-----------------------------------------------------
private func getToolCallExample(): String {
    if (Config.enableParallelToolCall) {
"""
[
  {
      "name": "foo"
      "arguments": {
          "url": "http://example.com",
          "count": 3,
          "items": ["abc", "xyz"]
      }
  },
  {
      "name": "bar"
      "arguments": {
          "arg": "something",
      }
  }
]
"""
    } else {
"""
{
    "name": "foo"
    "arguments": {
        "url": "http://example.com",
        "count": 3,
        "items": ["abc", "xyz"]
    }
}
"""
    }
}

private func getActionDescription(): String {
    if (Config.enableParallelToolCall) {
"""
use tools, the action must be a Json array:
    [
        {
            "name": string, name of the tool, it must refer to one of available tools
            "arguments": { [key: string]: unknown }, arguments for the tool, each argument must be a valid json value required by the tool; it can be omitted, if the tool does not accept parameters
        }
    ]
    For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
"""
    } else {
"""
use tools, the action must be a Json object:
    {
        "name": string, name of the tool, it must refer to one of available tools
        "arguments": { [key: string]: unknown }, arguments for the tool, each argument must be a valid json value required by the tool; it can be omitted, if the tool does not accept parameters
    }
"""
    }
}

// Modified from https://smith.langchain.com/hub/hwchase17/react
// Prompts of parallel tool call is copied from https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use
private func getReactSystemPromptPrefix(): String {
"""
# Guidelines
Use the following format to accomplish user's request:
${Tag.Thought} think about what to do next to solve the question ${Tag.Thought.close}
${Tag.Action} ${getActionDescription()}
${Tag.Action.close}
${Tag.Observation} the result of the action ${Tag.Observation.close}
... (Thought/Action/Observation may repeat N times to accomplish user's request)
${Tag.Answer} the final answer to the original input question ${Tag.Answer.close}

NEVER generate ${Tag.Observation} yourself. This is an important requirement.
If there are no available tools, generate final answer directly.

You must generate either a pair of ${Tag.Thought} and ${Tag.Action} or a single ${Tag.Answer}.
"""
}

private func getActionExample() {
"""
${Tag.Thought} I need to search the web to get related knowledge ${Tag.Thought.close}
${Tag.Action}
${getToolCallExample()}
${Tag.Action.close}
"""
}

//----------------------------------------------------
// Construct the complete system prompt
//----------------------------------------------------

private func getReactSystemPrompt(): String {
"""
${getReactSystemPromptPrefix()}
**Output Examples:**

Output-1:
${getActionExample()}
Output-2:
${Tag.Answer} the final answer you generate ${Tag.Answer.close}
"""
}

protected func getReactSystemPromptWithStructureOutput(): String {
"""
${getReactSystemPromptPrefix()}

You MUST output a JSON value obey the schema as the answer.
The schema to follow:
{output_schema}

**Output Examples:**
Output-1:
${getActionExample()}
Output-2:
${Tag.Answer} ```json <output a JSON value here as the answer> ``` ${Tag.Answer.close}
"""
}

private let REACT_SUMMARIZE_SYSTEM_PROMPT = """
# Instruction
Given a question and a solving procedure for it, you should summarize an answer from them.
The solving procedure consists of:
  - ${Tag.Thought} think about what to do next to solve the task ${Tag.Thought.close}
  - ${Tag.Action} use a tool, which is a function call ${Tag.Action.close}
  - ${Tag.Observation} the result of the action ${Tag.Observation.close}
  - ... (Thought/Action/Observation may repeat N times)

The answer should be wrapped by ${Tag.Answer} and ${Tag.Answer.close} like
${Tag.Answer}
Cat is the answer, and ...
${Tag.Answer.close}

# Question
{question}
-----

# Solving Procedure
{procedure}
-----

# Some extra context to help answer the question
{systemPrompt}

{retrieval}

{memory}
"""

private let REACT_SUMMARIZE_USER_PROMPT = """
Now, summarize the answer. Remember you should wrap the output by ${Tag.Answer} and ${Tag.Answer.close}
"""

let REACT_STEP_PROMPT = """
Decide what to do next.
Output either a pair of ${Tag.Thought} and ${Tag.Action}, or a single ${Tag.Answer}.
"""

protected struct ReactPromptUtils {
    static func buildReactSystemPrompt(task: AgentTask): String {
        return task.request.outputSchema
            .map { schema =>
                getReactSystemPromptWithStructureOutput().format([
                    ("output_schema", (schema as TypeSchema).getOrThrow())
                ])
            }
            .getOrDefault({ => getReactSystemPrompt().trimAscii() })
    }

    static func buildReactSummarizePrompt(task: AgentTask): Array<Message> {
        let strBuilder = StringBuilder()
        for (msg in task.execution.steps) {
            // Only add messages with tags, like [Action]
            if (msg.content.startsWith(OPEN_TAG_SYMBOL)) {
                strBuilder.append("${msg.content}\n")
            }
        }
        let sys = REACT_SUMMARIZE_SYSTEM_PROMPT.format(
            ("question", task.request.question),
            ("procedure", strBuilder.toString()),
            ("retrieval", PromptBuilder.buildAgentRetrievalPrompt(task)),
            ("systemPrompt", task.agent.systemPrompt),
            ("memory", PromptBuilder.buildAgentMemoryPrompt(task))
        ).trimAscii()
        return [
            Message.system(sys),
            Message.user(REACT_SUMMARIZE_USER_PROMPT.trimAscii())
        ]
    }
}
