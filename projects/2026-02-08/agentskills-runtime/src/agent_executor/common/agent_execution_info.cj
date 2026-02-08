/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

import magic.core.agent.*
import magic.core.message.*
import magic.core.rag.{Retrieval, RetrievalInfo}
import magic.core.tool.ToolRequest
import magic.parser.TagChannel
import magic.core.interaction.*
import magic.tokenizer.TokenizerLoader
import magic.log.LogUtils

import std.collection.{ArrayList, LinkedList}
import std.sync.{Mutex, AtomicBool}

/**
 * Bookkeeping information during the agent execution
 */
public class AgentExecutionInfo <: AgentExecution {
    /**
     * Internal chat messages between the agent and llm
     * These messages represent the execution traces
     */
    private let _messages: LinkedList<ExecutionMessage>

    /**
     * The agent request, which is the user question
     */
    private var request: Option<AgentRequest> = None

    /**
     * The final answer of the agent, which is set by the agent executor
     */
    private var answer: Option<String> = None

    /**
     * Retrieved documents during execution
     */
    private let _retrievalInfo = ArrayList<RetrievalInfo>()

    /**
     * The cancellation mark
     */
    private let cancellation = AtomicBool(false)

    /**
     * A communication channel to transfer verbose events during the agent execution
     * Only access this field when setting `verbose: true` in AgentRequest
     */
    protected var _events: Option<EventStream> = None

    public init(agent: Agent, request: AgentRequest) {
        let tokenizer = TokenizerLoader.default()
        this._messages = LinkedList<ExecutionMessage>()
        this._events = request.eventStream
        // Use bounded message list?
        // this.messageList = BoundedMessageList(
        //     agent.model.contextLength,
        //     computeFn: { str => return tokenizer.countToken(str) }
        // )
    }


    override public prop retrievalInfo: ArrayList<RetrievalInfo> {
        get() { this._retrievalInfo }
    }

    /**
     * All messages, including user questions, internal assistant messages
     * Convert the internal execution messages to a message list
     */
    override public prop messages: MessageList {
        get() {
            let messageList = MessageList()
            for (execMsg in this._messages) {
                messageList.add(execMsg.message)
            }
            return messageList
        }
    }

    /**
     * Messages about solving the request
     * Convert the internal execution messages to a message list
     */
    override public prop steps: MessageList {
        get() {
            let steps = MessageList()
            var node = this._messages.firstNode
            while (let Some(currNode) <- node) {
                if (currNode.value.isStep()) {
                    steps.add(currNode.value.message)
                }
                node = currNode.next
            }
            return steps
        }
    }

    /**
     * Wrap internal step messages as StepMessage
     */
    protected prop stepMessages: ArrayList<StepMessage> {
        get() {
            let steps = ArrayList<StepMessage>()
            var node = this._messages.firstNode
            while (let Some(currNode) <- node) {
                if (currNode.value.isStep()) {
                    steps.add(StepMessage(list: this._messages, node: currNode))
                }
                node = currNode.next
            }
            return steps
        }
    }

    public func addMessage(msg: Message): Unit {
        this._messages.addLast(ExecutionMessage(msg))
    }

    public func removeLastMessage(): Unit {
        this._messages.removeLast()
    }

    public func addStep(role: MessageRole,
                        content: String,
                        tag: Tag,
                        wrapTag!: Bool = true,
                        toolRequest!: Option<ToolRequest> = None): Unit {
        let msgContent = if (wrapTag) {
            content.withTag(tag)
        } else {
            content
        }
        let message = match (role) {
            case MessageRole.Assistant => Message.assistant(msgContent)
            case MessageRole.User => Message.user(msgContent)
            case _ => throw IllegalArgumentException("Invalid role: ${role}")
        }
        this._messages.addLast(ExecutionMessage(message, tag, toolRequest: toolRequest))
    }

    public func addRequest(request: AgentRequest): Unit {
        this.request = request

        // Add previous execution messages from the parent agent if any
        if (let Some(parentContext) <- request.parentContext) {
            let strBuilder = StringBuilder("--- Previous Context ---\n")
            for (msg in parentContext) {
                strBuilder.append("${msg}\n")
            }
            strBuilder.append("--- End of Previous Context ---\n")
            this.addMessage(Message.assistant(strBuilder.toString()))
        }
        // Remove the @ tags from the question
        var newQuestion = request.question
        // Merge all imported files
        let strBuilder = StringBuilder()
        for (importedFile in request.importedFiles) {
            let path = importedFile.referencePath
            // Remove the @ tag
            newQuestion = newQuestion.replace("@${path}", path.toString())
            // Append the file content
            if (importedFile.truncated) {
                strBuilder.append("The following is PART of file ${path}. You should use tool to read the full content.\n")
                strBuilder.append(
                    "<file-content path=${path} truncated=true>\n${importedFile.content}\n...\n</file-content>\n"
                )
            } else {
                strBuilder.append("The following is FULL content of file ${path}.\n")
                strBuilder.append(
                    "<file-content path=${path}>\n${importedFile.content}\n</file-content>\n"
                )
            }
        }
        // Add messages in the following order:
        // 1. Add the user question as the first user message
        this.addMessage(Message.user(newQuestion, image: request.image))
        // 2. Add imported files as user messages
        // Note that the imported file are separated from the user question
        // This is to avoid imported files being put to next chat rounds
        if (strBuilder.size > 0) {
            this.addMessage(Message.user(strBuilder.toString()))
        }
    }

    override public func setAnswer(answer: String): Unit {
        this.answer = answer
    }

    protected func addRetrieval(query: String, retrieval: Retrieval): Unit {
        this.retrievalInfo.add(RetrievalInfo(query, retrieval))
    }

    override public prop chatRound: ChatRound {
        get() {
            let req = this.request.getOrThrow({ => AgentExecutionException("User request is not set") })
            let steps = ArrayList<Message>()
            for (execMsg in this._messages) {
                if (execMsg.isStep()) {
                    steps.add(execMsg.message)
                }
            }
            let answer = this.answer.getOrThrow({ => AgentExecutionException("Answer is not set") })
            return ChatRound(
                Message.user(req.question, image: req.image),
                Message.assistant(answer),
                MessageList(steps)
            )
        }
    }

    /**
     * Use the same prop name as thread for convention
     */
    protected prop hasPendingCancellation: Bool {
        get() { this.cancellation.load() }
    }

    override public func markCancellation(): Unit {
        LogUtils.debug("Mark cancellation for the agent execution")
        this.cancellation.store(true)
    }

    private let mutex = Mutex()
    public prop events: EventStream {
        get() {
            synchronized(this.mutex) {
                if (let Some(value) <- _events) {
                    return value
                }
                let value = EventStream()
                _events = value
                return value
            }
        }
    }
}
