/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tool

import magic.core.agent.*
import magic.core.tool.*
import magic.jsonable.TypeSchema
import magic.core.message.{Message, MessageRole, MessageList}
import magic.core.model.{ChatModel, ChatRequest}
import magic.log.LogUtils
import magic.prompt.Template

import std.collection.ArrayList
import std.collection.HashMap
import stdx.encoding.json.JsonValue

private let AGENT_SUMMARY_PROMPT = """
# Task
Given instructions for an agent, summarize a description of the agent's functionality.
If the instructions include information about inputs and outputs, this should also be described in the functional description.
The output should be complete but also brief.

# Agent Instruction
{instruction}

Now, make the summary:
"""

private const SIMPLE_PARAM_DESCRIPTION = """
A clear and comprehensive question for the tool.
"""

private const PARAM_DESCRIPTION = """
A complete question that defines the task for the tool.
This should include:
- The core question or instruction
- Any necessary context or constraints
- Expected output format if relevant
Example: 'What is the capital of France? Respond with just the city name.'
"""

/**
 * Defines the execution mode for sub-agents (whether they inherit the main agent's context).
 */
public enum SubAgentMode {
    /**
     * Sub-agent executes independently without any context from the main agent
     */
    | Isolated

    /**
     * Sub-agent inherits the full context (state, history, data, etc.) from the main agent
     */
    | WithContext
}

public class AgentAsTool <: AbsTool {
    protected let agent: Agent
    protected let mode: SubAgentMode

    public init(agent: Agent, mode!: SubAgentMode = SubAgentMode.Isolated) {
        this.agent = agent
        this.mode = mode
    }

    public prop name: String {
        get() { this.agent.name }
    }

    public prop description: String {
        get() {
            return if (this.agent.description == "") {
                this.agent.name
            } else {
                this.agent.description
            }
        }
    }

    public prop parameters: Array<ToolParameter> {
        get() {
            // For isolated sub-agents, we need full context in the question parameter
            // For context-inheriting sub-agents, a simple question parameter suffices
            match (this.mode) {
                case SubAgentMode.Isolated =>
                    [ToolParameter("question", PARAM_DESCRIPTION, TypeSchema.Str)]
                case SubAgentMode.WithContext =>
                    [ToolParameter("question", SIMPLE_PARAM_DESCRIPTION, TypeSchema.Str)]
            }
        }
    }

    public prop retType: TypeSchema {
        get() { TypeSchema.Str }
    }

    public prop examples: Array<String> {
        get() { [] }
    }

    override public func invoke(args: HashMap<String, JsonValue>): ToolResponse {
        if (args.size == 1) {
            // The agent tool must receive a string
            let question = args["question"].asString().getValue()
            let resp = this.agent.chat(AgentRequest(question))
            if (resp.status == AgentResponseStatus.Cancelled) {
                throw AgentCancelException(reason: resp.content)
            }
            // Ensure the response is in JSON format
            let content = resp.content.trimAscii()
            if (content.startsWith("{") || content.startsWith("[")) {
                // Already JSON format
                return ToolResponse(content)
            } else {
                // Wrap non-JSON response in JSON format
                let jsonResponse = "{\"result\":\"" + content + "\",\"is_raw_response\":true}"
                return ToolResponse(jsonResponse)
            }
        } else {
            throw ToolException("Agent as tool with invalid arguments")
        }
    }

    // private func summarize(): String {
    //     let messages = MessageList([
    //         Message.system(AGENT_SUMMARY_PROMPT.format(
    //             ("instruction", this.agent.systemPrompt)
    //         ))
    //     ])
    //     if (let Some(chatResp) <- AgentOp.chatLLM(this.agent, messages)) {
    //         return chatResp.message.content
    //     } else {
    //         LogUtils.debug("Summarize failed")
    //         return "None"
    //     }
    // }
}
