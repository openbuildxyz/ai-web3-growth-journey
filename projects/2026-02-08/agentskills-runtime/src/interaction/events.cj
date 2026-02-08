/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.interaction

import magic.core.interaction.*
import magic.core.agent.{Agent, AgentRequest, AgentResponse}
import magic.core.tool.{ToolRequest, ToolResponse}
import magic.core.model.{ChatRequest, ChatResponse}
import magic.core.agent.AgentExecution
import magic.core.message.{Tag, MessageList, StepMessage}

import std.collection.ArrayList

/**
 * Triggered when before tool call
 */
public class ToolCallStartEvent <: InteractionEvent { // Return: ToolResponse
    public ToolCallStartEvent(
        public let agent: Agent,
        public let toolRequest: ToolRequest // Details of the tool being invoked
    ) {
        super(EventKind.ToolCallStart)
    }
}

/**
 * Triggered when after tool call
 */
public class ToolCallEndEvent <: InteractionEvent { // Return: Unit
    public ToolCallEndEvent(
        public let agent: Agent,
        public let toolRequest: ToolRequest,  // Details of the tool being invoked
        public let toolResponse: ToolResponse // Result of calling the tool
    ) {
        super(EventKind.ToolCallEnd)
    }
}

/**
 * Triggered when repeated tool call
 */
public class ToolCallRepeatEvent <: InteractionEvent { // Return: ToolResponse
    public ToolCallRepeatEvent(
        public let agent: Agent,
        public let toolRequest: ToolRequest  // Details of the tool being invoked
    ) {
        super(EventKind.ToolCallRepeat)
    }
}

/**
 * Triggered before an agent calling the chat model
 */
public class ChatModelStartEvent <: InteractionEvent { // Return: ChatResponse
    public ChatModelStartEvent(
        public let agent: Agent,
        public let chatRequest: ChatRequest
    ) {
        super(EventKind.ChatModelStart)
    }
}

/**
 * Triggered after an agent calling the chat model
 */
public class ChatModelEndEvent <: InteractionEvent { // Return: Unit
    public ChatModelEndEvent(
        public let agent: Agent,
        public let chatRequest: ChatRequest,
        public let chatResponse: ChatResponse
    ) {
        super(EventKind.ChatModelEnd)
    }
}

/**
 * Triggered when the LLM fails to generate a response.
 */
public class ChatModelFailureEvent <: InteractionEvent { // Return: ChatResponse
    public ChatModelFailureEvent(
        public let agent: Agent,
        public let chatRequest: ChatRequest, // The failing chat request
        public let error: String // Error message
    ) {
        super(EventKind.ChatModelFailure)
    }
}

/**
 * Triggered before an agent start to execute
 */
public class AgentStartEvent <: InteractionEvent { // Return: AgentResponse
    public AgentStartEvent(
        public let agent: Agent,
        public let agentRequest: AgentRequest
    ) {
        super(EventKind.AgentStart)
    }
}

/**
 * Triggered after agent execution
 */
public class AgentEndEvent <: InteractionEvent { // Return: Unit
    public AgentEndEvent(
        public let agent: Agent,
        public let agentRequest: AgentRequest,
        public let agentResponse: Option<AgentResponse>
    ) {
        super(EventKind.AgentEnd)
    }
}

/**
 * Triggered after agent execution
 */
public class AgentStepEvent <: InteractionEvent { // Return: Unit
    public AgentStepEvent(
        public let agent: Agent,
        public let agentRequest: AgentRequest,
        public let steps: ArrayList<StepMessage>
    ) {
        super(EventKind.AgentStep)
    }
}

/**
 * Triggered before a subAgent, i.e., AgentAsTool, starts execution
 */
public class SubAgentStartEvent <: InteractionEvent { // Return: AgentResponse
    public SubAgentStartEvent(
        public let agent: Agent,
        public let agentRequest: AgentRequest
    ) {
        super(EventKind.SubAgentStart)
    }
}

/**
 * Triggered before a subAgent, i.e., AgentAsTool, starts execution
 */
public class SubAgentEndEvent <: InteractionEvent { // Return: Unit
    public SubAgentEndEvent(
        public let agent: Agent,
        public let agentRequest: AgentRequest,
        public let agentResponse: AgentResponse
    ) {
        super(EventKind.SubAgentEnd)
    }
}

/**
 * Triggered when agent execution exceeds a time limit.
 */
public class AgentTimeoutEvent <: InteractionEvent { // Return: Unit
    public AgentTimeoutEvent(
        public let agent: Agent,
        public let execution: AgentExecution // The stalled execution context
    ) {
        super(EventKind.AgentTimeout)
    }
}

/**
 * Triggered when the agent requires additional human guidance.
 */
public class UserInputEvent <: InteractionEvent { // Return: String
    public UserInputEvent(
        public let agent: Agent,
        public let question: String // Clarification needed from a human
    ) {
        super(EventKind.UserInput)
    }
}

/**
 * Notify the agent execution
 */
public class NotifyEvent <: InteractionEvent { // Return: Unit
    public NotifyEvent(
        public let agent: Agent,
        public let tag: Tag, // The tag like [Info], [Action], etc.
        public let content: String // The tagged content
    ) {
        super(EventKind.Notify)
    }

    override public func toString(): String {
        return "${this.kind} ${this.tag} ${this.content}"
    }
}