/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

import magic.agent.base.AgentOp
import magic.core.agent.*
import magic.core.message.*
import magic.core.model.*
import magic.core.tool.*
import magic.core.interaction.*
import magic.core.rag.RetrieverMode
import magic.config.Config
import magic.compactor.SimpleToolCompactor
import magic.jsonable.ToJsonValue
import magic.log.LogUtils
import magic.interaction.*
import magic.model.ModelUtils
import magic.tool.{SimpleToolFilter, AgentAsTool, SubAgentMode}
import magic.prompt.Template

import std.collection.{ArrayList, ArrayDeque, HashMap, any, map, collectArray}
import std.sync.AtomicBool

/**
 * ToolCallCheckStatus represents the status of a tool call check.
 */
private enum ToolCallCheckStatus {
    | Normal
    | Warning(String)
    | Hijack(ToolResponse)
    | Stop(ToolResponse)
}

/**
 * AgentTask represents a task that is being executed by an agent executor.
 * It contains the agent, the request, and execution information.
 */
public open class AgentTask {
    public let agent: Agent

    public let request: AgentRequest

    /**
     * Information during the execution
     */
    public let execution: AgentExecutionInfo

    /**
     * A cache for tool results for compacting tool invocation results
     */
    private let toolResultCache = ToolResultCache()

    /**
     * A cache for tool requests for checking invalid tool calls, e.g., repeating tool calls
     */
    private let toolRequestCache = ArrayDeque<ToolRequest>()

    /**
     * Create a new AgentTask with the given agent and request.
     * If `initPrompt` is true, it will initialize the messageList with system and user messages.
     */
    protected init(agent: Agent, request: AgentRequest) {
        this.agent = agent
        this.request = request
        this.execution = AgentExecutionInfo(agent, request)
        if (request.verbose) {
            initVerboseEventHandlers(this.request, this.execution)
        }
    }

    private static func initVerboseEventHandlers(request: AgentRequest, execution: AgentExecutionInfo): Unit {
        let manager = EventHandlerManager()
        // dispatched subagents (e.g., react workers of the plan-react executor) will not set verbose event handlers
        // because the they inherit the verbose event handlers from the request
        if (!request.dispatchToSubagent) {
            manager.addHandler { evt: ToolCallStartEvent =>
                execution.events.put(evt)
                Continue
            }
            manager.addHandler { evt: NotifyEvent =>
                execution.events.put(evt)
            }
        }
        // If event handlers exist, add new handlers, and update the request
        // Note new handlers will be added before existed handlers
        if (let Some(object) <- request.eventHandlerManager) {
            manager.merge((object as EventHandlerManager).getOrThrow())
        }
        request.eventHandlerManager = manager
    }

    /**
     * Whether the task is stopped by an early-stop tool
     */
    private var _stopInfo: Option<EarlyStopInfo> = None

    protected prop stopInfo: Option<EarlyStopInfo> {
        get() {
            // If the task is already stopped, return the stop info
            if (let Some(info) <- this._stopInfo) {
                return info
            }
            // Check whether the first task is cancelled by the user
            // TODO: only async tasks check the cancellation status
            if (let Some(firstTask) <- AgentTaskStackUtils.first()) {
                if (firstTask.execution.hasPendingCancellation) {
                    // If the first task is cancelled, we stop this task as well
                    throw AgentCancelException()
                }
            }
            this._stopInfo
        }
    }

    /**
     * Stop the task with the given reason and result.
     * The task will be marked as stopped.
     */
    protected func stop(reason: EarlyStopReason, result!: String, log!: String = ""): Unit {
        // Already stopped
        if (this._stopInfo.isSome()) {
            LogUtils.error(agent.name, "Task already stopped, ignore the stop request")
            return
        }
        this._stopInfo = EarlyStopInfo(reason, result: result)
        if (!log.isEmpty()) {
            LogUtils.info(agent.name, log)
        }
        LogUtils.info(agent.name, "Early stopped: ${reason}; with result: ${result}")
    }

    /**
     * The builtin tool to view the detailed results stored in the cache
     */
    private var _resultViewerTool: Option<Tool> = None

    private prop resultViewerTool: Tool {
        get() {
            if (let Some(tool) <- this._resultViewerTool) {
                return tool
            } else {
                let tool = BuiltinToolUtils.buildToolResultViewerTool(this.toolResultCache)
                this._resultViewerTool = tool
                return tool
            }
        }
    }

    /**
     * The builtin tool of dynamic RAG
     */
    private var _retrieverTool: Option<Tool> = None

    private prop retrieverTool: Tool {
        get() {
            if (let Some(tool) <- this._retrieverTool) {
                return tool
            } else {
                let tool = BuiltinToolUtils.buildRetrieverTool(this)
                this._retrieverTool = tool
                return tool
            }
        }
    }

    /**
     * Get available and related tools for the current request
     */
    var _availableTools: Option<Array<Tool>> = None
    protected prop availableTools: Array<Tool> {
        get() {
            if (let Some(tools) <- this._availableTools) {
                return tools
            }
            // Filter tools based on the request
            let tools = ArrayList<Tool>(
                agent.toolManager.filterTool(
                    request.question,
                    SimpleToolFilter(agent.model, number: request.maxTool)
                )
            )
            // If any tool is compactable, we add the result viewer tool
            // to the available tools, so that the tool results can be viewed
            if (tools |> any { tool => (tool.extra.get("compactable") ?? "false") == "true" }) {
                // Add the result viewer tool to the tools
                tools.add(this.resultViewerTool)
            }
            if (let Some(rt) <- this.agent.retriever) {
                if (rt.mode == RetrieverMode.Dynamic) {
                    tools.add(this.retrieverTool)
                }
            }
            this._availableTools = tools.toArray()
            return this._availableTools.getOrThrow()
        }
    }

    //-------------------------------------------------------------------------------------
    // Two important methods must be called before and after the task execution
    protected func begin(): Unit {
        LogUtils.info("${this.agent.name} runs")
        AgentTaskStackUtils.push(this)
    }

    protected func end(): Unit {
        if (this.request.verbose) {
            this.execution.events.close()
        }
        AgentTaskStackUtils.pop()
    }

    //-------------------------------------------------------------------------------------
    /**
     * Note that: Agents ALWAYS call this method to use the LLM
     */
    protected func chatLLM(messages: MessageList,
                           stop!: Option<Array<String>> = None,
                           tools!: Array<Tool> = []): ChatResponse {
        if (this.stopInfo.isSome()) {
            throw AgentCancelException()
        }
        match (AgentOp.chatLLM(this.agent, messages, stop: stop, tools: tools, forRequest: this.request)) {
            case Some(resp) => resp
            case None =>
                let info = "Terminated because of invalid chat model response."
                this.stop(EarlyStopReason.EventHandlerTerminated, result: info)
                return ChatResponse("Event Handler", Message.assistant(info))
        }
    }

    //-------------------------------------------------------------------------------------

    private func findTool(name: String): Option<Tool> {
        if (name == RetrieverTool.NAME) {
            return this.retrieverTool
        } else if (name == ToolResultViewerTool.NAME) {
            return this.resultViewerTool
        } else {
            return this.agent.toolManager.findTool(name)
        }
    }

    /**
     * Check whether the tool call is valid
     * Return None if the tool call is valid, otherwise return the error message
     */
    private func checkToolCall(toolRequest: ToolRequest): ToolCallCheckStatus {
        if (!Config.enableToolCallCheck) {
            return ToolCallCheckStatus.Normal
        }
        // Cascading checking with Short-circuit evaluation
        let warning = this.checkSameToolCall(toolRequest) ??
                      (this.checkRepeatedToolCall(toolRequest) ?? "")

        // Add the tool request to the cache, and only the last 10 tool requests are cached
        if (this.toolRequestCache.size > 10) {
            this.toolRequestCache.removeFirst()
        }
        this.toolRequestCache.addLast(toolRequest)

        if (warning == "") {
            return ToolCallCheckStatus.Normal
        }
        // If there is a warning, we call event handlers
        match (AgentOp.handle(event: ToolCallRepeatEvent(this.agent, toolRequest),
                              forRequest: this.request)) {
            case EventResponse.Continue =>
                return ToolCallCheckStatus.Warning(warning)
            case EventResponse.Continue(resp) =>
                return ToolCallCheckStatus.Hijack(resp)
            case EventResponse.Terminate(resp) =>
                return ToolCallCheckStatus.Stop(resp)
        }
    }

    /**
     * Check if the tool is exactly repeated
     */
    private func checkSameToolCall(toolRequest: ToolRequest): Option<String> {
        if (let Some(lastToolRequest) <- this.toolRequestCache.last) {
            if (lastToolRequest.toString() == toolRequest.toString()) {
                let msg = "Warning: Detected repeated tool `${toolRequest.name}` calls with identical parameters. AVOID redundant tool calls. Reuse prior results if inputs match. If repetition is needed, state the reason briefly. Proceed efficiently."
                LogUtils.debug(msg)
                return msg
            }
        }
        return None
    }

    /**
     * Check if the tool is called repeatedly
     */
    private func checkRepeatedToolCall(toolRequest: ToolRequest): Option<String> {
        let lastToolRequests = this.toolRequestCache.toArray()
        var sameCount = 0
        for (i in (lastToolRequests.size-1)..=0:-1) { // Iterate from the end to the beginning
            if (lastToolRequests[i].name == toolRequest.name) {
                sameCount += 1
            } else {
                return None
            }
            if (sameCount >= 2) { // If the tool is called more than 4 times, consider it as repeated
                let msg = "Warning: Detected repeated tool `${toolRequest.name}` calls. Consolidate inputs and invoke the tool once with comprehensive arguments to improve efficiency. If repetition is needed, state the reason briefly."
                LogUtils.debug(msg)
                return msg
            }
        }
        return None
    }

    /**
     * Run the tool and return observation messages
     */
    protected func invokeTool(toolRequest: ToolRequest): String {
        if (this.stopInfo.isSome()) {
            throw AgentCancelException()
        }
        // Check the tool call request
        // If there is a warning and its event handler hijacks the request, return the result
        let warningOpt: Option<String> = match (this.checkToolCall(toolRequest)) {
            case ToolCallCheckStatus.Normal => None
            case ToolCallCheckStatus.Warning(msg) => msg
            case ToolCallCheckStatus.Hijack(resp) =>
                AgentOp.handle(event: ToolCallEndEvent(this.agent, toolRequest, resp), forRequest: this.request)
                return resp.content
            case ToolCallCheckStatus.Stop(resp) =>
                this.stop(
                    EarlyStopReason.EventHandlerTerminated,
                    result: resp.content,
                    log: "Terminated by repeated tool call event handler"
                )
                AgentOp.handle(event: ToolCallEndEvent(this.agent, toolRequest, resp), forRequest: this.request)
                return resp.content
        }
        // Now, the normal process of calling a tool
        let toolResult = this.doInvokeTool(toolRequest)
        // Call event handlers
        AgentOp.handle(event: ToolCallEndEvent(this.agent, toolRequest, ToolResponse(toolResult)), forRequest: this.request)
        // If there is a warning, add it to the result to guide the agent
        if (let Some(warning) <- warningOpt) {
            return "${warning}\n\nResult of the tool:\n${toolResult}"
        } else {
            return toolResult
        }
    }

    /**
     * Invoke the tool and return the result
     */
    private func doInvokeTool(toolRequest: ToolRequest): String {
        // Find the tool
        let toolOpt = this.findTool(toolRequest.name)
        if (toolOpt.isNone()) {
            // LLM generate invalid tool calling?
            let names = this.agent.toolManager.tools |> map { t => t.name } |> collectArray
            return "Tool `${toolRequest.name}` not found in ${names}"
        }
        let tool = toolOpt.getOrThrow()
        match (AgentOp.handle(event: ToolCallStartEvent(this.agent, toolRequest), forRequest: this.request)) {
            case EventResponse.Continue => () // Do nothing
            case EventResponse.Continue(resp) =>
                return resp.content
            case EventResponse.Terminate(resp) =>
                let toolResult = resp.content
                this.stop(
                    EarlyStopReason.EventHandlerTerminated,
                    result: toolResult,
                    log: "Terminated by tool call event handler"
                )
                return toolResult
        }
        // Invoke the tool
        let toolResponse = try {
            if (tool is AgentAsTool) {
                // If the tool is an agent, we invoke the agent
                this.invokeAgentAsTool(toolRequest, (tool as AgentAsTool).getOrThrow())
            } else {
                // Normal tool invocation
                tool.invoke(toolRequest.args)
            }
        } catch (ex: AgentCancelException) {
            throw ex // throw the exception to the upper level to cancel the execution
        } catch (ex: ToolException) {
            return "Tool `${toolRequest.name}` did not run successfully. Reason: ${ex.reason}"
        } catch (ex: Exception) {
            let strBuilder = StringBuilder()
            for (ste in ex.getStackTrace()) {
                strBuilder.append("${ste.fileName}:${ste.lineNumber} ${ste.methodName}\n")
            }
            return "Fail to invoke the tool with exception `${strBuilder}`"
        }
        // Save the tool result
        var toolResult = toolResponse.content
        // Check whether the tool has special attributes
        if ((tool.extra.get("compactable") ?? "false") == "true" &&
            toolResult.size > Config.toolResultCompactThreshold) {
            // If the tool is compactable, we can compact its result
            let compactor = SimpleToolCompactor(ChatModelWrapper(this))
            let summary = compactor.compact(toolRequest, toolResponse)
            // Put the compacted results to the cache
            toolResult = this.toolResultCache.put(
                toolRequest: toolRequest,
                toolResponse: toolResponse,
                compactedResult: summary
            )
        }
        // If the tool is terminal, we stop the execution
        if ((tool.extra.get("terminal") ?? "false") == "true") {
            this.stop(
                EarlyStopReason.ToolTerminated,
                result: toolResult,
                log: "Tool `${tool.name}` terminates the task"
            )
        }
        return toolResult
    }

    /**
     * Invoke an subagent
     */
    protected func invokeAgentAsTool(toolRequest: ToolRequest, tool: AgentAsTool): ToolResponse {
        // Fetch the question for the sub-agent
        let questionToSubAgent = if (toolRequest.args.size == 1) {
            // The agent tool must receive a string
            toolRequest.args["question"].asString().getValue()
        } else {
            throw ToolException("Agent as tool with invalid arguments")
        }
        // Prepare the request for the sub-agent
        let subRequest = AgentRequest(
            questionToSubAgent,
            verbose: this.request.verbose,
            maxTool: this.request.maxTool
        )
        match (tool.mode) {
            case SubAgentMode.WithContext =>
                // The sub-agent inherits the full context from the parent agent
                //    conversation: None, // Conversation is not inherited?
                subRequest.parentContext = this.execution.steps
            case SubAgentMode.Isolated =>
                () // The sub-agent executes independently without any context from the main agent
        }

        // Inherit the event handlers
        subRequest.eventHandlerManager = this.request.eventHandlerManager
        // Inherit the event stream
        subRequest.eventStream = this.request.eventStream
        // Mark the request as dispatched to a subagent
        subRequest.dispatchToSubagent = true

        let resp = match (AgentOp.handle(event: SubAgentStartEvent(tool.agent, subRequest))) {
            case EventResponse.Continue => tool.agent.chat(subRequest)
            case EventResponse.Continue(r) => r
            case EventResponse.Terminate(r) =>
                this.stop(
                    EarlyStopReason.EventHandlerTerminated,
                    result: r.content,
                    log: "Terminated by sub-agent end event handler"
                )
                r
        }
        AgentOp.handle(event: SubAgentEndEvent(tool.agent, subRequest, resp))
        return ToolResponse(resp.content)
    }

    //-------------------------------------------------------------------------------------

    /**
     * Call the notify event handler
     */
    protected func notify(tag: Tag, content: String): Unit {
        if (this.request.verbose) {
            AgentOp.handle(event: NotifyEvent(this.agent, tag, content), forRequest: this.request)
        }
    }

    /**
     * Handle the agent step event
     */
    protected func handleAgentStepEvent(): Unit {
        AgentOp.handle(event: AgentStepEvent(this.agent, this.request, this.execution.stepMessages))
    }
}
