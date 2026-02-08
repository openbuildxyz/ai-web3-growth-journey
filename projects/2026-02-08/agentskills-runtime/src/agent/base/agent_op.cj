/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent.base

import magic.core.agent.*
import magic.core.interaction.*
import magic.core.tool.*
import magic.core.model.*
import magic.core.message.*
import magic.interaction.*
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.utils.Importer
import magic.config.Config
import magic.core.agent.AgentRequest
import magic.parser.{ParserUtils, ParserException}

import std.collection.ArrayList

private let REPAIR_JSON_SYSTEM_PROMPT = """
You are a JSON repair assistant. Your task is to receive an invalid or malformed JSON string and correct it to produce valid, parseable JSON.

Follow these rules strictly:

**Preserve Data**: Do not alter, add, or remove any actual data values (strings, numbers, booleans, nulls) unless absolutely necessary for validity.

**Fix Syntax**: Correct common JSON syntax errors such as:

- Missing or mismatched quotes around keys or strings.
- Trailing commas in objects or arrays.
- Use of single quotes instead of double quotes.
- Improper use of comments (remove or convert if needed).
- Unescaped characters within strings (e.g., newlines, quotes).
- Missing or extra commas.
- Incorrect capitalization of true, false, or null.

**Maintain Structure**: Keep the intended hierarchical structure of objects and arrays.

**Output Only**: Return only the corrected JSON string. Do not include explanations, markdown formatting, or code blocks.

**Validate Output**: Ensure the final output is valid JSON that can be parsed by standard JSON parsers.

If the input is already valid JSON, return it unchanged.
If the input is severely corrupted and cannot be reliably repaired, return an empty JSON object: {}.

Now, wait for the user to provide the JSON string to repair.
"""

/**
 * Agent common operations
 */
public struct AgentOp {
    /**
     * Preprocess AgentRequest to resolve file imports
     */
    public static func preprocessRequest(request: AgentRequest): AgentRequest {
        // Create importer with configured import paths
        let importer = Importer(Config.importPaths)
        let importedFiles = importer.importFiles(request.question, lineLimit: 200)
        request.importedFiles.add(all: importedFiles)
        return request
    }

    public static func chatLLM(agent: Agent,
                               messages: MessageList,
                               stop!: Option<Array<String>> = None,
                               tools!: Array<Tool> = [],
                               forRequest!: AgentRequest): Option<ChatResponse> {
        let chatRequest = ChatRequest(messages, temperature: agent.temperature, stop: stop, tools: tools)
        // The chat model start event call site
        let chatResponse = match (AgentOp.handle(event: ChatModelStartEvent(agent, chatRequest), forRequest: forRequest)) {
            case Continue => AgentOp.chatLLMWithFailure(agent, chatRequest)
            case Continue(chatResponse) => chatResponse
            case Terminate(_) =>
                LogUtils.info("Chat model request is terminated")
                return None
        }
        if (let Some(resp) <- chatResponse) {
            AgentOp.handle(event: ChatModelEndEvent(agent, chatRequest, resp), forRequest: forRequest)
        }
        return chatResponse
    }

    private static func chatLLMWithFailure(agent: Agent, chatRequest: ChatRequest): Option<ChatResponse> {
        try {
            return ModelUtils.agentMakeChat(agent, chatRequest)
                .getOrThrow({ => throw ModelException("Fail to get chat model response") })
        } catch (ex: ModelException) {
            match (AgentOp.handle(event: ChatModelFailureEvent(agent, chatRequest, ex.error))) {
                case EventResponse.Continue =>
                    LogUtils.info("Chat model failure handler return None")
                    throw ex // If the model exception is not handled, rethrow it
                case EventResponse.Continue(resp) => return resp
                case EventResponse.Terminate(_) =>
                    LogUtils.info("Chat model failure handler terminates")
                    return None
            }
        }
    }

    /**
     * Parse the tool request from the chat response:
     * If the chat response does not contain a tool request,
     * extract the request from the message content
    */
    public static func parseToolRequests(agent: Agent, chatResp: ChatResponse, forRequest!: AgentRequest): Array<ToolRequest> {
        if (!chatResp.toolRequests.isEmpty()) {
            return chatResp.toolRequests
        }
        return AgentOp.parseToolRequests(agent, chatResp.message.content, forRequest: forRequest)
    }

    protected static func parseToolRequests(agent: Agent, content: String, forRequest!: AgentRequest): Array<ToolRequest> {
        // First, try to parse tool request array
        try {
            let toolRequests = ParserUtils.extractToolRequestArray(content)
            if (!toolRequests.isEmpty()) {
                return toolRequests
            }
        } catch (ex: ParserException) {
            // Skip the exception
        }
        LogUtils.trace("Failed to extract tool request array")
        // Otherwise, try to parse a single tool request
        try {
            let toolRequest = ParserUtils.extractToolRequest(content)
            return [toolRequest]
        } catch (ex: ParserException) {
            LogUtils.trace("Failed to extract tool request")
            // If there is a invalid JSON object, repair it
            if (!ex.reason.contains("NO JSON") && Config.enableJsonRepair) {
                if (let Some(repairedJsonStr) <- AgentOp.repairJson(agent, content, forRequest: forRequest)) {
                    return [ParserUtils.extractToolRequest(content)]
                }
            }
            throw ex // Throw the exception again
        }
    }

    private static func repairJson(agent: Agent, invalidJson: String, forRequest!: AgentRequest): Option<String> {
        let chatResp = AgentOp.chatLLM(
            agent,
            MessageList([
                Message.system(REPAIR_JSON_SYSTEM_PROMPT),
                Message.user(invalidJson)
            ]),
            forRequest: forRequest
        )
        if (let Some(resp) <- chatResp) {
            return resp.message.content
        }
        return None
    }

    //--------------------------------------------------
    // The following methods are generated by gen.py;
    // never modify them directly
    //--------------------------------------------------
    // The following are event handlers: NEVER DELETE/MODIFY THIS LINE

    static public func handle(event!: ToolCallStartEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ToolResponse> {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                    case Continue => ()
                    case Continue(v) => return Continue(v)
                    case Terminate(v) => return Terminate(v)
                }
            }
        }

        if (let Some(object) <- event.agent.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        match (EventHandlerManager.global.handle(event)) {
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }
        return Continue
    }

    static public func handle(event!: ToolCallEndEvent, forRequest!: Option<AgentRequest> = None): Unit {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                (object as EventHandlerManager).getOrThrow().handle(event)
            }
        }
        if (let Some(object) <- event.agent.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        EventHandlerManager.global.handle(event)
    }

    static public func handle(event!: ToolCallRepeatEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ToolResponse> {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                    case Continue => ()
                    case Continue(v) => return Continue(v)
                    case Terminate(v) => return Terminate(v)
                }
            }
        }

        if (let Some(object) <- event.agent.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        match (EventHandlerManager.global.handle(event)) {
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }
        return Continue
    }

    static public func handle(event!: ChatModelStartEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ChatResponse> {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                    case Continue => ()
                    case Continue(v) => return Continue(v)
                    case Terminate(v) => return Terminate(v)
                }
            }
        }

        if (let Some(object) <- event.agent.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        match (EventHandlerManager.global.handle(event)) {
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }
        return Continue
    }

    static public func handle(event!: ChatModelEndEvent, forRequest!: Option<AgentRequest> = None): Unit {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                (object as EventHandlerManager).getOrThrow().handle(event)
            }
        }
        if (let Some(object) <- event.agent.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        EventHandlerManager.global.handle(event)
    }

    static public func handle(event!: ChatModelFailureEvent, forRequest!: Option<AgentRequest> = None): EventResponse<ChatResponse> {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                    case Continue => ()
                    case Continue(v) => return Continue(v)
                    case Terminate(v) => return Terminate(v)
                }
            }
        }

        if (let Some(object) <- event.agent.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        match (EventHandlerManager.global.handle(event)) {
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }
        return Continue
    }

    static public func handle(event!: AgentStartEvent): EventResponse<AgentResponse> {
        if (let Some(object) <- event.agentRequest.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        if (let Some(object) <- event.agent.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        match (EventHandlerManager.global.handle(event)) {
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }
        return Continue
    }

    static public func handle(event!: AgentEndEvent): Unit {
        if (let Some(object) <- event.agentRequest.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        if (let Some(object) <- event.agent.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        EventHandlerManager.global.handle(event)
    }

    static public func handle(event!: AgentStepEvent): Unit {
        if (let Some(object) <- event.agentRequest.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        if (let Some(object) <- event.agent.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        EventHandlerManager.global.handle(event)
    }

    static public func handle(event!: SubAgentStartEvent): EventResponse<AgentResponse> {
        if (let Some(object) <- event.agentRequest.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        if (let Some(object) <- event.agent.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        match (EventHandlerManager.global.handle(event)) {
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }
        return Continue
    }

    static public func handle(event!: SubAgentEndEvent): Unit {
        if (let Some(object) <- event.agentRequest.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        if (let Some(object) <- event.agent.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        EventHandlerManager.global.handle(event)
    }

    static public func handle(event!: AgentTimeoutEvent, forRequest!: Option<AgentRequest> = None): Unit {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                (object as EventHandlerManager).getOrThrow().handle(event)
            }
        }
        if (let Some(object) <- event.agent.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        EventHandlerManager.global.handle(event)
    }

    static public func handle(event!: UserInputEvent, forRequest!: Option<AgentRequest> = None): EventResponse<String> {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                    case Continue => ()
                    case Continue(v) => return Continue(v)
                    case Terminate(v) => return Terminate(v)
                }
            }
        }

        if (let Some(object) <- event.agent.eventHandlerManager) {
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }
        }

        match (EventHandlerManager.global.handle(event)) {
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }
        return Continue
    }

    static public func handle(event!: NotifyEvent, forRequest!: Option<AgentRequest> = None): Unit {
        if (let Some(request) <- forRequest) {
            if (let Some(object) <- request.eventHandlerManager) {
                (object as EventHandlerManager).getOrThrow().handle(event)
            }
        }
        if (let Some(object) <- event.agent.eventHandlerManager) {
            (object as EventHandlerManager).getOrThrow().handle(event)
        }
        EventHandlerManager.global.handle(event)
    }
    // end of event handlers. NEVER DELETE/MODIFY THIS LINE
}