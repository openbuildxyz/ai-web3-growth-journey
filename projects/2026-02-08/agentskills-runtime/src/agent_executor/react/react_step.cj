/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.react

import magic.config.Config
import magic.core.tool.ToolRequest
import magic.core.message.{WithTag, Tag}
import magic.log.LogUtils
import magic.parser.{ParserUtils, ParserException}

protected enum FailureLevel {
    | Repairable
    | Fatal
}

protected struct ToolCall {
    protected ToolCall(
        protected let thought!: String,              // Thoughts of choosing the tool
        protected let requests!: Array<ToolRequest>, // Tool call request
        protected let text!: String                  // The original tool call representation
    ) { }
}

protected struct FinalAnswer {
    protected FinalAnswer(
        protected let thought!: String, // Thoughts of summarizing the answer
        protected let content!: String   // Content of the answer
    ) { }
}

protected struct FailureInfo {
    protected FailureInfo(
        protected let level: FailureLevel,
        protected let message!: String, // The original failure message
        protected let reason!: String,
        protected let suggestion!: String
    ) { }
}

protected enum ReactStep <: Hashable & Equatable<ReactStep> & ToString {
    | Action(ToolCall)
    | Thought(String)
    | Answer(FinalAnswer)
    | Failure(FailureInfo)

    public func hashCode(): Int64 {
        return match (this) {
            case ReactStep.Action(tc) => tc.text.hashCode()
            case ReactStep.Thought(t) => t.hashCode()
            case ReactStep.Answer(a) => a.content.hashCode()
            case ReactStep.Failure(f) => f.reason.hashCode()
        }
    }

    public operator func ==(rhs: ReactStep): Bool {
        match ((this, rhs)) {
            case (ReactStep.Action(tc1), ReactStep.Action(tc2)) =>
                return tc1.text == tc2.text
            case (ReactStep.Thought(t1), ReactStep.Thought(t2)) =>
                return t1 == t2
            case (ReactStep.Answer(a1), ReactStep.Answer(a2)) =>
                return a1.content == a2.content
            case (ReactStep.Failure(f1), ReactStep.Failure(f2)) =>
                return f1.reason == f2.reason
            case _ => return false
        }
    }

    public operator func !=(rhs: ReactStep): Bool {
        return !(this == rhs)
    }

    public func toString(): String {
        return match (this) {
            case ReactStep.Action(tc) => "${Tag.Thought} ${tc.thought} ${Tag.Thought.close}; ${Tag.Action} ${tc.text} ${Tag.Action.close}"
            case ReactStep.Thought(t) => "${Tag.Thought} ${t} ${Tag.Thought.close}"
            case ReactStep.Answer(a) => "${Tag.Thought} ${a.thought} ${Tag.Thought.close}; ${Tag.Answer} ${a.content} ${Tag.Answer.close}"
            case ReactStep.Failure(f) => "${Tag.Fail} Original message: ${f.message}; \n Reason: ${f.reason} ${Tag.Fail.close}"
        }
    }

    static func fromStr(content: String): ReactStep {
        let thought = Tag.extract(content, Tag.Thought)
        if (let Some(answer) <- Tag.extract(content, Tag.Answer)) {
            return ReactStep.Answer(
                FinalAnswer(thought: thought ?? "",
                            content: answer)
            )
        }
        match ((thought, Tag.extract(content, Tag.Action))) {
            case (_, Some(action)) =>
                try {
                    let toolCalls = if (Config.enableParallelToolCall) {
                        ParserUtils.extractToolRequestArray(action)
                    } else {
                        [ParserUtils.extractToolRequest(action)]
                    }
                    return ReactStep.Action(
                        ToolCall(
                            text: action,
                            thought: thought ?? "",
                            requests: toolCalls
                        )
                    )
                } catch (ex: ParserException) {
                    LogUtils.error("Parsing action failed: ${ex.reason}")
                    return ReactStep.Failure(
                        FailureInfo(FailureLevel.Repairable,
                                    message: content,
                                    reason: ex.reason,
                                    suggestion: "You should regenerate to fix the error: `${ex.reason}`")
                    )
                }
            case (Some(_thought), None) =>
                return ReactStep.Thought(_thought)
            case (None, None) =>
                return ReactStep.Failure(
                    FailureInfo(
                        FailureLevel.Repairable,
                        message: content,
                        reason: "Output format is invalid.",
                        suggestion: "You should generate ${Tag.Action} or ${Tag.Answer}"
                    )
                )
        }
    }
}