/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
 */
package magic.agent_executor.plan_react

import magic.agent_executor.react.ReactPromptUtils
import magic.core.agent.*
import magic.core.message.{Message, MessageList, Tag}
import magic.jsonable.Jsonable
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.parser.ParserUtils
import magic.prompt.Template

// The following prompt modified from [XAgent](https://github.com/OpenBMB/XAgent/blob/main/XAgent/agent/plan_generate_agent/prompt.py)
private let PROBLEM_DECOMPOSE_SYSTEM_PROMPT = """
# Instruction
Given a uer question, your task is to decompose the question into several tasks.
Just generate tasks and **NEVER** answer the question.

A task-structure has the following json component:
{
    "name": string, name of the task
    "goal": string, the main purpose of the task, and what will you do to reach this goal?
    "criticism": string, what potential problems and constraints may the current task and goal have?
    "milestones": list[string]. what milestones should be achieved to ensure the task is done? Make it detailed and specific. List all necessary knowledge and constraints here.
}

The decomposition result is a list of tasks like

```json
[
    {
        "name": "subtasks1",
        "goal": "some goal",
        "criticism": "critic thought",
        "milestones": [...]
    }
]
```

# Constraints
- Always make feasible and efficient task decomposition that can lead to successful task solving.
- Each decomposed subtasks must be self-contained, meaning it includes all the necessary knowledge and constraints required to solve the task.
- You can plan multiple tasks if you want.
- Remember that just generate tasks and **NEVER** answer the question.
- The output must be a json object containing tasks.

# Extra Instruction
There are some extra instructions, which may help you decompose the tasks:
{systemPrompt}
------
NOTE: These extra instructions may contain some constraints or knowledge necessary for solving the subtasks,
and you need to incorporate this content into the subtasks to make them self-contained.
"""

private let PROBLEM_DECOMPOSE_USER_PROMPT = """
# Question
{question}

# Task
Now, decompose the question into tasks:
"""

protected func problemDecompose(planTask: PlanTask): Array<Subtask> {
    let sysPrompt = PROBLEM_DECOMPOSE_SYSTEM_PROMPT.format(
        ("systemPrompt", planTask.agent.systemPrompt)
    )
    let userPrompt = PROBLEM_DECOMPOSE_USER_PROMPT.format(
        ("question", planTask.request.question)
    )
    let messages = MessageList([
        Message.system(sysPrompt),
        Message.user(userPrompt)
    ])
    let msg = planTask.chatLLM(messages).message
    return ParserUtils.extractFirstValue<Array<Subtask>>(msg.content)
}
