/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_group

import magic.agent.base.AgentOp
import magic.log.LogUtils
import magic.core.agent.*
import magic.core.message.{Message, MessageRole, MessageList, Tag, WithTag}
import magic.prompt.Template

import std.collection.ArrayList

private let AUTO_SPEAKER_SELECT_PROMPT = """
There are {numOfAgent} agents collaborate to solve questions, i.e., the topic.
They solve the problem by discussion. The discussion can be divided as multiple rounds.
During each round, there is an agent to speak.
You should select the next agent to speak according to what they have discussed so far.
If the problem have been solved, return the final answer instead of selecting an agent.

## Agents
Each agent has a name and a description, whose description summarize its ability.
The following are agent involved in the discussion.

----- Begin of agent descriptions -----
{agents}
----- End of agent descriptions -----

## Topic
{topic}

## Output Format
1. If the problem is solved, there is no need to select the agent and return the final answer.
   The output should be formatted as ${Tag.Answer} ... ${Tag.Answer.close}
1. If an agent select, The output should be formatted as ${Tag.Info} <agent-name> ${Tag.Info.close}

## Discussion
The discussion is split as speeches, and each speech is wrapped by the pair of [Speech] and [/Speech].
The following is the discussion content.
{discussion}

## Task
Select the next speaker or make the final answer.
"""

class AutoDiscussGroup <: DiscussGroup {
    init(request!: AgentRequest, members!: ArrayList<Agent>) {
        super(request, members)
    }

    private func buildSelectSystemPrompt(): String {
        let strBuilder = StringBuilder()
        for (agent in members) {
            strBuilder.append("[Agent] name: ${agent.name}; description: ${agent.description} [/Agent]\n")
        }
        return AUTO_SPEAKER_SELECT_PROMPT.format(
            ("numOfAgent", members.size),
            ("agents", strBuilder),
            ("topic", this.request.question),
            ("discussion", buildDiscussionPrompt())
        )
    }

    override public func selectSpeaker(): Selection {
        let sysPrompt = buildSelectSystemPrompt()
        let messageList = MessageList([
            Message.system(sysPrompt)
        ])
        LogUtils.info(this.host.name, sysPrompt)
        messageList.add(
            Message.user("Now, select the next speaker or make the final answer")
        )

        let msg = match (AgentOp.chatLLM(this.host, messageList, forRequest: this.request)) {
            case Some(chatResp) => chatResp.message
            case None => return Selection.Failure("LLM response error")
        }
        LogUtils.info(this.host.name, msg)
        if (let Some(answer) <- Tag.extract(msg.content, Tag.Answer)) {
            return Selection.Summary(answer)
        }

        if (let Some(name) <- Tag.extract(msg.content, Tag.Info)) {
            if (let Some(idx) <- findAgent(name)) {
                currSpeakerIndex = idx
                return Selection.Speaker(members[idx])
            } else {
                return Selection.Failure("Select a non-existed agent")
            }
        } else {
            return Selection.Failure("Parse [Selection] failure")
        }
    }
}