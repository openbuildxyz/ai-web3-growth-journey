/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent

import magic.agent.base.BaseAgent
import magic.core.agent.*
import magic.core.interaction.EventStream
import magic.core.message.{Tag, WithTag}
import magic.interaction.NotifyEvent
import magic.log.LogUtils
import magic.model.ModelManager
import magic.tool.AgentAsTool

/**
 * This agent is used to dispatch user question to other agents.
 * It's a special case of ToolSelectAgent, whose tools are agents.
 * Normally, this agent plays the role of the leader of LeaderGroup.
 **/
public class DispatchAgent <: BaseAgent {
    public init(model!: String) {
        super(name: "Dispatch Agent", model: ModelManager.createChatModel(model))
    }

    override public func chat(request: AgentRequest): AgentResponse {
        if (let Some(agent) <- this.doSelect(request)) {
            return agent.chat(request)
        } else {
            return AgentResponse(AgentResponseStatus.Success, "Unknown Question")
        }
    }

    override public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        if (let Some(agent) <- this.doSelect(request)) {
            if (request.verbose) {
                let eventStream = EventStream()
                eventStream.put(NotifyEvent(this, Tag.Info, "Dispatch to the agent: ${agent.name}"))
                // Let the selected agent know the previous execution
                request.eventStream = eventStream
            }
            return agent.asyncChat(request)
        } else {
            return AsyncAgentResponse(["Unknown Question"].iterator())
        }
    }

    private func doSelect(request: AgentRequest): Option<Agent> {
        // Tools are updated when building the leader group, so we build the prompt every time
        let selectAgent = ToolSelectAgent(this.model, this.toolManager.tools)
        if (let Some(toolRequest) <- selectAgent.select(request.question)) {
            if (let Some(tool) <- this.toolManager.findTool(toolRequest.name)) {
                LogUtils.info(this.name, "Dispatch to ${toolRequest.name}")
                // All tools are agents
                // Pass LLM generated arguments or the original request?
                // tool.invoke(toolRequest.args)
                return (tool as AgentAsTool).getOrThrow().agent
            } else {
                throw AgentExecutionException("Fail to find the agent `${name}`")
            }
        }
        return None
    }
}
