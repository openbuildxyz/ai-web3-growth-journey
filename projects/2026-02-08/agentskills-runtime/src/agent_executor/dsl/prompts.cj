/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.dsl

import magic.core.message.{Tag, WithTag}
import magic.config.Config

let EXECUTION_DEFINITION = """
The execution is a chronological event stream containing the different types of events, wrapped by xml tags, like ${Tag.Observation}, ${Tag.Plan}, etc.
"""
    //-----------------------------------------------------------------
    // The thought message is not described in the execution definition
    //-----------------------------------------------------------------
    // - ${Tag.THOUGHT} a wait moment that contains reflection on execution and thoughts on subsequent execution ${Tag.THOUGHT.close}

let PLAN_PROMPT = """
${EXECUTION_DEFINITION}
Based on the execution, make a plan about how to solve the user question next.
Wrap your output by ${Tag.Plan} and ${Tag.Plan.close}.
"""

// Prompts of parallel tool call is copied from https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use
func getActionPrompt(): String {
    if (Config.enableParallelToolCall) {
"""
Decide which tools to use next based on the current execution state.
For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
"""
    } else {
"""
Decide which tool to use next based on the current execution state. ONLY one tool can be used.
NEVER output raw string, you MUST select a tool as JSON string.
"""
    }
}

private func getToolCallExample(): String {
    if (Config.enableParallelToolCall) {
"""
You MUST output a JSON array with the following schema:
```json
[
    {
        "name": string, name of the tool, it must refer to one of available tools
        "arguments": { [key: string]: unknown }, arguments for the tool, each argument must be a valid json value required by the tool; it can be omitted, if the tool does not accept parameters
    }
]
```
For example,
```json
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
          "arg": "http://example.com",
      }
  }
]
```
"""
    } else {
"""
You MUST output a JSON object with the following schema:
```json
{
    "name": string, name of the tool, it must refer to one of available tools
    "arguments": { [key: string]: unknown }, arguments for the tool, each argument must be a valid json value required by the tool; it can be omitted, if the tool does not accept parameters
}
```
For example,
```json
{
    "name": "foo"
    "arguments": {
        "url": "http://example.com",
        "count": 3,
        "items": ["abc", "xyz"]
    }
}
```
"""
    }
}

func getActionPromptWithTools(): String {
"""
${getActionPrompt()}
${EXECUTION_DEFINITION}

All available tools are listed:
{tools}

${getToolCallExample()}
Now, make the tool decision and output the result with required format.
"""
}

let ANSWER_PROMPT = """
${EXECUTION_DEFINITION}
Based on the execution, answer the user question now.

Wrap your output by ${Tag.Answer} and ${Tag.Answer.close}.
"""

let ANSWER_WITH_STRUCTURE_OUTPUT_PROMPT = """
Based on the execution, answer the user question now.
${EXECUTION_DEFINITION}

Wrap the output by ${Tag.Answer} and ${Tag.Answer.close}.

You MUST output a JSON value obey the schema as the answer. The schema to follow:
{output_schema}

Examples:
Output:
${Tag.Answer} ```json 1 ``` ${Tag.Answer.close}
${Tag.Answer} ```json "result" ``` ${Tag.Answer.close}
${Tag.Answer} ```json ["abc", "xyz"] ``` ${Tag.Answer.close}
"""

let THINK_PROMPT = """
${EXECUTION_DEFINITION}
Based on the execution, make a reflection on the previous execution and think about the next steps you should do.
Just make high-level thoughts, NEVER use tools.
Wrap your output by ${Tag.Thought} and ${Tag.Thought.close}.
"""

let TOOL_PROMPT = """
Given the description of a tool and past execution history, you are required to generate appropriate arguments for the next execution of the tool.
"""

let TOOL_PROMPT_WITH_TOOLS = """
Given the description of a tool and past execution history, you are required to generate appropriate arguments for the next execution of the tool.
${EXECUTION_DEFINITION}

# Example
Input:
```json
{
    "name": "foo",
    "description": "tool description...",
    "inputSchema": {
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "description": "The specified URL"
            },
            "count": {
                "type": "integer",
                "description": "Number of items to fetch"
            }
        }
    }
}
```
Output:
```json
{
    "name": "foo"
    "arguments": {
        "url": "http://example.com",
        "count": 3
    }
}
```

You have to generate arguments for the following tool:
```json
{tool}
```

Note: You must generate parameters only for the specified tool. Using other tools will cause severe errors. This is a critical constraint, and you must comply with it.
Now, generate the arguments for {tool_name}:
"""

let CHECK_CONDITION_PROMPT = """
${EXECUTION_DEFINITION}
You are required to evaluate whether a current condition is valid based on the user question and historical execution data.

Follow these steps:

- Review History: Examine the chronological sequence of past events provided in the historical records.
- Assess Condition: Determine if the current condition logically follows from trends, patterns, or explicit evidence in the history.
- Justify Conclusion: Clearly state whether the condition holds (True/False) and explain your reasoning with references to specific historical data.

Format your response as:
${Tag.Answer}
- Conclusion: [True/False]
- Reasoning: [Concise explanation to the condition]
${Tag.Answer.close}

Example Output:
${Tag.Answer}
- Conclusion: True
- Reasoning: Q2 had the highest sales ($120K) in the recorded history, confirming the peak.
${Tag.Answer.close}

Now, check whether the condition "{condition}":
"""

let DIVIDE_PROMPT = """
You are required to divide the user question into multiple **independent, self-contained sub-tasks** based on past execution events.
${EXECUTION_DEFINITION}

Each sub-task must be **solvable without dependencies** and include:

- `id`: Unique identifier.
- `title`: Short descriptive name.
- `description`: Clear problem statement.
- `background`: Necessary context/knowledge.
- `guidelines`: Step-by-step instructions or constraints.

**Rules**:
1. Use only the JSON format below.
2. Sub-tasks must **not** rely on each other.
3. If past events exist, use them to avoid redundancy or invalid approaches.

**Output Format**:
```json
{
  "subtasks": [
    {
      "id": "unique_id_1",
      "title": "Descriptive title",
      "description": "Specific goal of this sub-task",
      "background": "Context or prerequisites",
      "guidelines": ["Step 1", "Step 2", "..."],
      "dependencies": null
    },
    {
      "id": "unique_id_2",
      ...
    }
  ]
}
```

---

### **Example**:
**Output**:
```json
{
  "subtasks": [
    {
      "id": "debug_1",
      "title": "Isolate crashing row",
      "description": "Identify the exact CSV row causing the script to crash",
      "background": "Script fails on large files; memory tweaks did not resolve the issue",
      "guidelines": [
        "Add a try-catch block to log row numbers during processing",
        "Test with a subset of the CSV to pinpoint the failing row"
      ]
    },
    {
      "id": "debug_2",
      "title": "Review parsing logic",
      "description": "Analyze CSV parsing for edge cases (e.g., malformed data)",
      "background": "Error suggests issues in parsing logic, not memory",
      "guidelines": [
        "Check for NaN values, mismatched quotes, or irregular delimiters",
        "Validate each field type (e.g., ensure numeric columns contain numbers)"
      ]
    }
  ]
}
```

Now, make the task division based on the current execution state:
"""

let SUMMARY_PROMPT = """
You are required to generate a clear and concise summary of multiple subtasks. For each subtask, provide the following sections in a structured format:

1. Task Description: Briefly state the objective or purpose of the subtask.
2. Execution Process: Describe the steps or methods used to accomplish the subtask.
3. Result: Summarize the outcome or findings of the subtask.

After detailing each subtask individually, synthesize a Final Summary that:

- Highlights key achievements or insights across all subtasks.
- Identifies patterns, dependencies, or overarching conclusions.
- Keeps the summary compact (e.g., 3–5 sentences) while retaining critical information.*

Input Structure Example:
```
Subtasks: [
  {
    "description": "Subtask 1 description",
    "process": "Steps/methods used",
    "result": "Outcome/findings"
  },
  ... (repeat for other subtasks)
]
```

Output Requirements:
- Use bullet points or numbered lists for clarity.
- Avoid jargon unless it's defined earlier.
- Prioritize accuracy and brevity.

Wrap your output with ${Tag.Summary} and ${Tag.Summary.close} tags.
Now, generate the summary of the following subtasks:

```
{subtasks}
```
"""