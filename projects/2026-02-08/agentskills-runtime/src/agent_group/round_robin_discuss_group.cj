/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_group

import magic.core.message.{MessageList, Tag, WithTag}
import magic.agent.base.AgentOp
import magic.log.LogUtils

import std.collection.ArrayList

private let RR_SPEAKER_SELECT_PROMPT = """
There are agents collaborate to solve questions, i.e., the topic.
They solve the problem by discussion.
The discussion can be divided as multiple rounds. During each round, there is an agent to speak.
You should decide whether the question has been solved according to existed discussion.
If so, return the final answer.

## Topic
The topic is: {topic}

## Discussion
The discussion is split as speeches, and each speech is wrapped by the pair of [Speech] and [/Speech].
The following is the discussion content.
{discussion}

## Output Format
1. If the problem is solved, the output should be formatted as ${Tag.Answer} ... ${Tag.Answer.close}
2. Otherwise, output NO-ANSWER
"""

class RoundRobinDiscussGroup <: DiscussGroup {
    init(request!: AgentRequest, members!: ArrayList<Agent>) {
        super(request, members)
    }

    private func buildSelectSystemPrompt(): String {
        return RR_SPEAKER_SELECT_PROMPT.format(
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
        for (msg in discussion) {
            messageList.add(Message.assistant("${msg.name} says: ${msg.content}"))
        }
        messageList.add(
            Message.user("Select the next speaker now")
        )

        let msg = match (AgentOp.chatLLM(this.host, messageList, forRequest: this.request)) {
            case Some(chatResp) => chatResp.message
            case None => return Selection.Failure("LLM model failed")
        }
        LogUtils.info(this.host.name, msg)
        let answer = Tag.extract(msg.content, Tag.Answer) ?? "NO-ANSWER"
        if (answer.contains("NO-ANSWER")) {
            let selection = Selection.Speaker(members[currSpeakerIndex % members.size])
            currSpeakerIndex += 1
            return selection
        } else {
            return Selection.Summary(answer)
        }
    }
}