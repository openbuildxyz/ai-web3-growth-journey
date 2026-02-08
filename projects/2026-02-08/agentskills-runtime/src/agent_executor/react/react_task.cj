/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.react

import magic.agent_executor.common.{AgentTask, PromptBuilder}
import magic.core.*
import magic.core.message.{Message, MessageList, MessageRole, WithTag, Tag}
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.parser.{TagStreamParser, ParserException}
import magic.utils.sleep2

protected class ReactTask <: AgentTask {
    protected init(agent: Agent, request: AgentRequest) {
        super(agent, request)

        PromptBuilder()
            .system(ReactPromptUtils.buildReactSystemPrompt(this))
            .tool(PromptBuilder.buildAgentToolsPrompt(this))
            .system(this.agent.systemPrompt)
            .retrieval(PromptBuilder.buildAgentRetrievalPrompt(this))
            .memory(PromptBuilder.buildAgentMemoryPrompt(this))
            .conversation(request.conversation, withStepMessage: true)
            .request(request)
            .fillTo(this)
    }

    /**
     * If the answer is generated, return its value;
     * otherwise, just add messages to the messageList
     */
    private func handleStep(step: ReactStep): Option<String> {
        LogUtils.info(this.agent.name, step.toString())
        match (step) {
            case ReactStep.Thought(thought) =>
                this.execution.addStep(MessageRole.Assistant, thought, Tag.Thought)
            case ReactStep.Action(tc) =>
                if (tc.thought != "") {
                    this.execution.addStep(MessageRole.Assistant, tc.thought, Tag.Thought)
                }
                // LLM may generate parallel tools to run, but we run them sequentially currently
                for (toolRequest in tc.requests) {
                    this.execution.addStep(MessageRole.Assistant, toolRequest.toJsonValue().toJsonString(), Tag.Action, toolRequest: toolRequest)
                    let observation = this.invokeTool(toolRequest)
                    this.execution.addStep(MessageRole.User, observation, Tag.Observation)
                    this.notify(Tag.Observation, observation)
                }
            case ReactStep.Answer(answer) =>
                if (answer.thought != "") {
                    this.execution.addStep(MessageRole.Assistant, answer.thought, Tag.Thought)
                }
                return answer.content
            case ReactStep.Failure(failureInfo) =>
                match (failureInfo.level) {
                    case FailureLevel.Repairable =>
                        // If the model returns an empty reply, just retry;
                        // else, add hint messages to fix.
                        if (!failureInfo.message.isEmpty()) {
                            // Add the reply message to the messageList and fix the failure
                            this.execution.addMessage(Message.assistant(failureInfo.message))
                            this.execution.addMessage( // and add the repair message
                                Message.user("Output is invalid because ${failureInfo.reason}. ${failureInfo.suggestion}")
                            )
                        } else {
                            LogUtils.info(this.agent.name, "React backoff")
                            sleep2(1000) // Backoff when getting empty messages
                        }
                    case FailureLevel.Fatal =>
                        throw AgentExecutionException(failureInfo.reason)
                }
        }
        return None
    }

    private func notifyStep(step: ReactStep): Unit {
        match (step) {
            case Action(toolCall) =>
                if (!toolCall.thought.isEmpty()) {
                    this.notify(Tag.Thought, toolCall.thought)
                }
                // tool call is notified in its own event handler
            case Thought(thought) =>
                this.notify(Tag.Thought, thought)
            case Answer(answer) =>
                if (!answer.thought.isEmpty()) {
                    this.notify(Tag.Thought, answer.thought)
                }
                this.notify(Tag.Answer, answer.content)
            case Failure(_) => ()
        }
    }

    //------------------------------------------------------
    protected func runOnce(): Option<String> {
        LogUtils.info(this.agent.name, "Run Step")
        let step = try {
            // Add a hint message
            this.execution.addMessage(
                Message.system(REACT_STEP_PROMPT)
            )
            this.getNextReactStep()
        } finally {
            // Remove the hint message
            this.execution.removeLastMessage()
        }

        this.notifyStep(step)
        if (let Some(answer) <- handleStep(step)) {
            return answer
        } else {
            return None
        }
    }

    private func getNextReactStep(): ReactStep {
        // The LLM may generates [Observation] itself,
        // I.e., it may generate
        // [Thought] ... [Thought]
        // [Action] ... [/Action]
        // [Observation] ... [Observation],
        // so we truncate it with `stop` words.
        try {
            let msg = this.chatLLM(this.execution.messages, stop: [Tag.Observation.open]).message
            return ReactStep.fromStr(msg.content)
        } catch (ex: Exception) {
            LogUtils.error(this.agent.name, ex.toString())
            return ReactStep.Failure(
                FailureInfo(
                    FailureLevel.Fatal,
                    message: "",
                    reason: "Fail to get chat model response",
                    suggestion: ""
                )
            )
        }
    }

    /**
     * Summarize an answer according to the react execution history.
     **/
    protected func summarize(): String {
        let messages = MessageList(
            ReactPromptUtils.buildReactSummarizePrompt(this)
        )
        let msg = this.chatLLM(messages).message
        return Tag.extract(msg.content, Tag.Answer).getOrThrow({ =>
            AgentExecutionException("Chat model response has no answers")
        })
    }

    //-----------------------------------------------------------------------------------------
    // The following methods are used to implement asynchronous execution,
    // but these are outdated implementations with bugs (they may directly pass incorrect LLM outputs to verbose info).
    // These methods are currently not in use and are temporarily retained for reference.
    func asyncRunOnce(): Option<AsyncReactAnswer> {
        LogUtils.info(this.agent.name, "Run Step")
        // Add a hint message
        this.execution.addMessage(
            Message.system(REACT_STEP_PROMPT)
        )
        let asyncReactStep = this.getAsyncReactStep()
        // remove the hint message
        this.execution.removeLastMessage()
        try {
            let tag = asyncReactStep.peekTag()
            if (tag == Tag.Thought || tag == Tag.Action) {
                let step = asyncReactStep.getStepOf(tag)
                this.notifyStep(step)
                this.handleStep(step)
                return None
            } else if (tag == Tag.Answer) {
                let (thought, asyncAnswer) = asyncReactStep.getAsyncAnswer()
                if (!thought.trimAscii().isEmpty()) {
                    this.execution.addStep(MessageRole.Assistant, thought, Tag.Thought)
                }
                return asyncAnswer
            } else {
                throw UnsupportedException()
            }
        } catch (ex: ParserException) {
            // Add the repair message
            this.execution.addMessage(
                Message.system("You should generate valid tags of required syntax!")
            )
            return None
        }
    }

    private func getAsyncReactStep(): AsyncReactStep {
        // The LLM may generates [Observation] itself,
        // I.e., it may generate
        // [Thought] ... [/Thought]
        // [Action] ... [/Action]
        // [Observation} ... [/Observation],
        // so we truncate it with `stop` words.
        let asyncChatResp = agent.model.asyncCreate(
            ChatRequest(this.execution.messages, stop: [Tag.Observation.open])
        )
        let parser = TagStreamParser(asyncChatResp.iter(withReason: false))
        return AsyncReactStep(parser)
    }

    /**
     * Summarize an answer according to the react execution history.
     **/
    func asyncSummarize(): AsyncReactAnswer {
        let asyncChatResp = agent.model.asyncCreate(
            ChatRequest(ReactPromptUtils.buildReactSummarizePrompt(this))
        )
        let parser = TagStreamParser(asyncChatResp.iter())
        let asyncReactStep = AsyncReactStep(parser)
        let (_, asyncAnswer) = asyncReactStep.getAsyncAnswer()
        return asyncAnswer
    }
}