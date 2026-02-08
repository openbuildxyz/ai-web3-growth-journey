/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.dsl

import magic.agent_executor.common.{AgentTask, PromptBuilder, AnswerTool, BuiltinToolUtils}
import magic.agent.base.AgentOp
import magic.core.agent.*
import magic.core.tool.{Tool, ToolRequest}
import magic.core.message.{Message, MessageList, MessageRole, Tag, WithTag}
import magic.core.model.ChatResponse
import magic.config.Config
import magic.model.ModelUtils
import magic.prompt.Template
import magic.parser.{ParserUtils, ParserException}
import magic.log.LogUtils
import magic.jsonable.{Jsonable, TypeSchema, JsonUtils, FromJsonValue, ToJsonValue}

import std.collection.{ArrayList, HashMap, map, collectArray}
import stdx.encoding.json.*

public type ExecutionOp = (ExecutionState) -> ExecutionState

public struct OnCase {
    let condition: String
    let op: ExecutionOp
    let default: Bool

    public init(condition: String, op: ExecutionOp) {
        this.condition = condition
        this.op = op
        this.default = false
    }

    public init(op: ExecutionOp) {
        this.condition = ""
        this.op = op
        this.default = true
    }
}

/**
 * ExecutionOpSet provides a set of operations for executing in the DslExecutor.
 * It includes operations like planning, thinking, invoking tools, and handling subtasks.
 */
public struct ExecutionOpSet {
    private static func chatWithOperation(state: ExecutionState,
                                          operationPrompt: String,
                                          tools!: Array<Tool>,
                                          stop!: Option<Array<String>>): ChatResponse {
        let agent = state.task.agent
        // Prepare input messages
        LogUtils.debug(agent.name, operationPrompt)
        state.execution.addMessage(Message.system(operationPrompt))
        // Call the LLM
        try {
            return state.task.chatLLM(
                state.execution.messages, stop: stop, tools: tools
            )
        } finally {
            state.execution.removeLastMessage()
        }
    }

    private static func chatWithOperation(state: ExecutionState,
                                          operationPrompt: String,
                                          stop!: Option<Array<String>>): Message {
        return chatWithOperation(state, operationPrompt, tools: [], stop: stop).message
    }

    //-----------------------------------------------------------

    public static func plan(state: ExecutionState): ExecutionState {
        if (state.done) {
            return state
        }
        let msg = chatWithOperation(state, PLAN_PROMPT, stop: [])
        let plan = Tag.extract(msg.content, Tag.Plan) ?? msg.content
        // Parse the response and add the message to the state
        LogUtils.info(state.task.agent.name, "Plan: ${plan}")
        // Add plan as a thought
        state.execution.addStep(MessageRole.Assistant, plan, Tag.Plan )
        state.task.notify(Tag.Plan, plan)
        return state
    }

    public static func think(state: ExecutionState): ExecutionState {
        if (state.done) {
            return state
        }
        let msg = chatWithOperation(state, THINK_PROMPT, stop: [Tag.Action.open, Tag.Thought.close])
        let thought = Tag.extract(msg.content, Tag.Thought) ?? msg.content
        // Parse the response and add the message to the state
        LogUtils.info(state.task.agent.name, "Thought: ${thought}")
        state.execution.addStep(
            MessageRole.Assistant, thought, Tag.Thought
        )
        state.task.notify(Tag.Thought, thought)
        return state
    }

    public static func action(state: ExecutionState): ExecutionState {
        if (state.done) {
            return state
        }
        // Inject the `answer` special tool
        var isInjected = false
        let schema = state.task.request.outputSchema
        let answerTool = BuiltinToolUtils.buildAnswerTool(schema)
        if (state.task.agent.toolManager.findTool(answerTool.name).isNone()) {
            state.task.agent.toolManager.addTool(answerTool)
            isInjected = true
        }
        try {
            let chatResp = if (Config.enableModelToolCall) {
                chatWithOperation(
                    state,
                    getActionPrompt(),
                    tools: state.task.availableTools,
                    stop: [Tag.Observation.open]
                )
            } else {
                let prompt = getActionPromptWithTools().format([
                    ("tools", PromptBuilder.buildAgentToolsPrompt(state.task))
                ])
                chatWithOperation(
                    state,
                    prompt,
                    tools: [],
                    stop: [Tag.Observation.open]
                )
            }
            return doInvokeTool(state, chatResp)
        } finally {
            // Remove the injected tool
            if (isInjected) {
                state.task.agent.toolManager.delTool(answerTool)
            }
        }
    }

    /**
     * Parse the tool request from the chat response:
     * If the chat response does not contain a tool request,
     * extract the request from the message content
    */
    private static func parseToolRequests(agent: Agent, chatResp: ChatResponse, forRequest: AgentRequest): Array<ToolRequest> {
        // Otherwise, try to parse a single tool request
        try {
            return AgentOp.parseToolRequests(agent, chatResp, forRequest: forRequest)
        } catch (ex: ParserException) {
            LogUtils.debug("Failed to extract tool requests")
            // If function call is enabled,
            // and there is no Json string || Json repair is disable,
            // treat the content as the final answer
            if (Config.enableModelToolCall &&
                (ex.reason.contains("NO JSON") || !Config.enableJsonRepair)) {
                LogUtils.info("Failed to extract tool requests. Treat the content as the final answer.")
                return [
                    ToolRequest(
                        name: AnswerTool.NAME,
                        args: JsonUtils.buildJsonObject([
                            ("result", chatResp.message.content)
                        ])
                    )
                ]
            }
            throw ex // Throw the exception again
        }
    }

    private static func buildToolCallSchemaGuideline(): String {
        return if (Config.enableParallelToolCall) {
"The Json object of tool call is invalid. Please output a JSON array like [{\"name\": \"tool_name\", \"arguments\": {...}}], where each element follows the {name, arguments} schema."
        } else {
"The Json object of tool call is invalid. Please output a JSON object like {\"name\": \"tool_name\", \"arguments\": {...}}, following the {name, arguments} schema."
        }
    }

    private static func repairJsonOutput(state: ExecutionState, chatResp: ChatResponse): ExecutionState {
        let guideline = buildToolCallSchemaGuideline()
        if (Config.enableModelToolCall) {
            state.execution.addMessage( // Not add as a step message
                Message.assistant("${chatResp.message.content}\n")
            )
            state.execution.addMessage(Message.user(guideline))
        } else {
            state.execution.addMessage(
                Message.assistant("```json\n${chatResp.message.content}\n```".withTag(Tag.Action))
            )
            state.execution.addMessage(
                Message.user(guideline.withTag(Tag.Observation))
            )
        }
        return state
    }

    private static func doInvokeTool(state: ExecutionState, chatResp: ChatResponse): ExecutionState {
        LogUtils.debug(state.task.agent.name, "To invoke tool: ${chatResp}")
        var toolRequests = try {
            ExecutionOpSet.parseToolRequests(state.task.agent, chatResp, state.task.request)
        } catch (ex: ParserException) {
            LogUtils.error(state.task.agent.name, "Failed to parse tool request: ${ex.message}")
            if (Config.enableJsonRepair) {
                return repairJsonOutput(state, chatResp)
            } else {
                throw ex
            }
        }
        // We also add reasoning content to the step messages
        if (let Some(reason) <- chatResp.message.reason) {
            Message.assistant(reason) // Without tag?
        }
        // LLM may generate parallel tools to run, but we run them sequentially currently
        // Execute each tool
        LogUtils.info(state.task.agent.name, "Tool call: ${toolRequests.toJsonValue().toJsonString()}")
        // If parallel tool call is disabled, we only run the first tool request
        if (!Config.enableParallelToolCall && toolRequests.size > 1) {
            toolRequests = [toolRequests[0]]
        }
        for (toolRequest in toolRequests) {
            // Add action to the message list
            // If function call is not enabled, we wrap the messages with tags
            // to guide the LLM generating formatted response
            if (Config.enableModelToolCall) {
                state.execution.addStep(
                    MessageRole.Assistant,
                    toolRequest.toJsonValue().toJsonString(),
                    Tag.Action,
                    wrapTag: false,
                    toolRequest: toolRequest
                )
            } else {
                state.execution.addStep(
                    MessageRole.Assistant,
                    "```json\n${toolRequest.toJsonValue().toJsonString()}\n```",
                    Tag.Action,
                    wrapTag: false,
                    toolRequest: toolRequest
                )
            }

            // No need to notify the tool request here because it's notified during invoking the tool
            let observation = state.task.invokeTool(toolRequest)
            // Special terminal tools may stop the execution
            if (let Some(stopInfo) <- state.task.stopInfo) {
                state.task.notify(Tag.Answer, stopInfo.result)
                return state
            }

            // Add tool call result to the message list
            if (Config.enableModelToolCall) {
                state.execution.addStep(
                    MessageRole.User,
                    observation,
                    Tag.Observation,
                    wrapTag: false
                )
            } else {
                state.execution.addStep(
                    MessageRole.User,
                    observation,
                    Tag.Observation,
                )
            }
            LogUtils.info(state.task.agent.name, "Observation: ${observation}")
            state.task.notify(Tag.Observation, observation)
        }
        return state
    }

    public static func done(state: ExecutionState): ExecutionState {
        if (state.done) {
            return state
        }
        state.answer = "Task completed!"
        return state
    }

    public static func answer(state: ExecutionState): ExecutionState {
        if (state.done) {
            return state
        }
        let prompt = state.task.request.outputSchema
            .map { schema =>
                ANSWER_WITH_STRUCTURE_OUTPUT_PROMPT.format([
                    ("output_schema", (schema as TypeSchema).getOrThrow())
                ])
            }
            .getOrDefault({ => ANSWER_PROMPT})
        let msg = chatWithOperation(state, prompt, stop: [])
        let answer = Tag.extract(msg.content, Tag.Answer) ?? msg.content
        // Parse the response
        LogUtils.info(state.task.agent.name, "Answer: ${answer}")
        state.task.notify(Tag.Answer, answer)
        if (state.task.request.verbose) {
            if (let Some(subtask) <- state.subtask) {
                let answer = "Solve the subtask ${subtask.description}\nAnswer: ${answer}"
                state.task.notify(Tag.Observation, answer)
            } else {
                state.task.notify(Tag.Observation, answer)
            }
        }
        state.answer = answer
        return state
    }

    public static func loop(op: ExecutionOp): ExecutionOp {
        return { state: ExecutionState =>
            var currState = state
            while (true) {
                if (currState.done) {
                    return state
                }
                currState = op(currState)
            }
            return currState
        }
    }

    public static func tool(tools: Array<Tool>): ExecutionOp {
        return { state: ExecutionState =>
            if (state.done) {
                return state
            }
            var currState = state
            for (tool in tools) {
                // Prepare input messages
                let chatResp = if (Config.enableModelToolCall) {
                    chatWithOperation(currState, TOOL_PROMPT, tools: tools, stop: [])
                } else {
                    let prompt = TOOL_PROMPT.format(
                        ("tool", tool.toJsonValue().toJsonString()),
                        ("tool_name", tool.name),
                    )
                    chatWithOperation(currState, prompt, tools: [], stop: [])
                }
                currState = doInvokeTool(currState, chatResp)
            }
            return currState
        }
    }

    public static func divide(state: ExecutionState): Array<ExecutionState> {
        if (state.done) {
            return [state]
        }
        let msg = chatWithOperation(state, DIVIDE_PROMPT, stop: [])
        LogUtils.info(state.task.agent.name, "Subtask Division: ${msg.content}")
        // If the content does not contain ```json ... ```, treat the content as a json value
        let jsonStr = ParserUtils.extractFirstCode(msg.content, "json") ?? msg.content.trimAscii()
        let json = JsonValue.fromStr(jsonStr).asObject()
        // Parse the content
        let subtasks = Array<Subtask>.fromJsonValue(json.get("subtasks").getOrThrow())

        return subtasks |> map { subtask: Subtask =>
            if (state.task.request.verbose) {
                let info = "Generate subtask:\n${subtask.toJsonValue().toJsonString()}"
                state.task.notify(Tag.Thought, info)
            }

            // Build the system prompt to solve the subtask
            let prompts = ArrayList<String>()
            prompts.add(state.task.agent.systemPrompt)
            prompts.add("# Guideline")
            prompts.add(all: subtask.guidelines)
            prompts.add("# Background")
            prompts.add(subtask.background)
            let sysPrompt = String.join(prompts.toArray(), delimiter: "\n")

            let subtaskState = ExecutionState(
                AgentTask(
                    state.task.agent,
                    AgentRequest(subtask.description, verbose: state.task.request.verbose),
                )
            )
            // Set the verbose event stream
            subtaskState.task.execution._events = state.task.execution._events
            // Save the current state as its parent state
            subtaskState.parent = state
            // Bound with the subtask
            subtaskState.subtask = subtask
            // Add prompts
            subtaskState.execution.addMessage(Message.system(sysPrompt))
            subtaskState.execution.addRequest(AgentRequest(subtask.description))
            LogUtils.info(state.task.agent.name, subtaskState.execution.messages)
            return subtaskState
        } |> collectArray
    }

    public static func each(op: ExecutionOp): (Array<ExecutionState>) -> Array<ExecutionState> {
        return { states: Array<ExecutionState> =>
            return states |> map { state: ExecutionState =>
                if (let Some(subtask) <- state.subtask) {
                    if (state.task.request.verbose) {
                        let info = "To solve the subtask: ${subtask.description}"
                        state.task.notify(Tag.Thought, info)
                    }
                }
                op(state)
            } |> collectArray
        }
    }

    private static func buildSubtaskDesc(states: Array<ExecutionState>): String {
        let subtaskDesc = String.join(
            states |> map { state => state.extractSubtaskInfo() } |> collectArray,
            delimiter: ",\n"
        )
        return "Subtasks: [\n${subtaskDesc}\n]"
    }

    public static func summary(states: Array<ExecutionState>): ExecutionState {
        // All sub-states share the same parent state
        let state = states[0].parent.getOrThrow()
        // Build prompt of subtasks
        let subtaskDesc = ExecutionOpSet.buildSubtaskDesc(states)
        state.execution.addStep(
            MessageRole.Assistant,
            "Multiple subtasks are generated and executed:\n${subtaskDesc}",
            Tag.Thought
        )

        let prompt = SUMMARY_PROMPT.format(
            ("subtasks", subtaskDesc)
        )
        let msg = chatWithOperation(state, prompt, stop: [])
        let summary = Tag.extract(msg.content, Tag.Summary) ?? msg.content
        LogUtils.info(state.task.agent.name, "Subtask Summary: ${summary}")
        state.task.notify(Tag.Summary, summary)
        state.execution.addStep(
            MessageRole.Assistant,
            summary,
            Tag.Summary
        )

        return state
    }

    public static func switch(onCases: Array<OnCase>): ExecutionOp {
        return { state: ExecutionState =>
            if (state.done) {
                return state
            }
            if (onCases.isEmpty()) {
                throw AgentExecutionException("No cases are provided")
            }
            for (c in onCases) {
                if (c.default == true) {
                    LogUtils.info(state.task.agent.name, "DEFAULT CASE")
                    return c.op(state)
                }
                let prompt = CHECK_CONDITION_PROMPT.format([
                    ("condition", c.condition)
                ])
                let msg = chatWithOperation(state, prompt, stop: [])
                // Extract the conclusion from the response
                let conclusion = Tag.extract(msg.content, Tag.Answer) ?? msg.content
                // Parse the response
                LogUtils.info(state.task.agent.name, "CHECK-CONDITION: ${c.condition} -> ${conclusion}")
                if (conclusion.contains("Conclusion: True")) {
                    return c.op(state)
                }
            }
            LogUtils.info(state.task.agent.name, "NO satisfied cases")
            return state
        }
    }

    public static func switch(onCase: OnCase): ExecutionOp {
        return switch([onCase])
    }

    public static func onCase(condition: String, op: ExecutionOp): OnCase {
        return OnCase(condition, op)
    }

    public static func otherwise(op: ExecutionOp): OnCase {
        return OnCase(op)
    }
}
