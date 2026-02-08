/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.agent_executor.common

import magic.core.agent.{AgentRequest, AgentExecutor, AgentExecutionException}
import magic.core.tool.Tool
import magic.core.rag.RetrieverMode
import magic.core.message.{Message, Conversation, MessageList, Tag, WithTag}
import magic.tokenizer.{TokenizerLoader, TokenizerType}
import magic.log.LogUtils

import std.collection.{ArrayList, forEach, map, filter, collectArray, enumerate}

/**
 * A builder for constructing agent system prompts.
 * This class is used to build the initial prompts for the agent executor.
 * It usually builds
 *   - the system prompt (comprising system, retrieval, tool, and memory prompts),
 *   - the conversation (between the agent and user),
 */
protected class PromptBuilder {
    private let systemMessages = ArrayList<Message>()

    private var _conversation: Option<Conversation> = None
    private var conversationWithStepMessage = false

    private var _request: Option<AgentRequest> = None

    /**
     * Agent System Prompt
     */
    public func system(prompt: String): PromptBuilder {
        if (!prompt.trimAscii().isEmpty()) {
            this.systemMessages.add(Message.system(prompt))
        }
        this
    }

    /**
     * Agent Retrieval Prompt
     */
    public func retrieval(prompt: String): PromptBuilder {
        // Treat retrieval prompt as a part of the system message
        this.system(prompt)
    }

    public func tool(prompt: String): PromptBuilder {
        // Treat tool prompt as a part of the system message
        this.system(prompt)
    }

    public func memory(prompt: String): PromptBuilder {
        // Treat memory prompt as a part of the system message
        this.system(prompt)
    }

    /**
     * Conversation between the agent and user
     */
    public func conversation(conversation: Option<Conversation>, withStepMessage!: Bool): PromptBuilder {
        this._conversation = conversation
        this.conversationWithStepMessage = withStepMessage
        this
    }

    /**
     * The agent request, which is the user question
     */
    public func request(request: AgentRequest): PromptBuilder {
        this._request = request
        this
    }

    private func mergeSystemPrompt(): String {
        return String.join(
            this.systemMessages |> map { msg => msg.content } |> collectArray,
            delimiter: "\n\n"
        )
    }

    private func mergeConversationSummary(): Option<String> {
        if (let Some(con) <- this._conversation) {
            let compacts = con.compacts
            if (compacts.isEmpty()) {
                return None
            }
            let strBuilder = StringBuilder("Following are summary of previous conversations between you and the user:\n")
            for ((idx, compact) in enumerate(compacts)) {
                strBuilder.append("[Summary ${idx+1}]\n${compact.summary}\n")
            }
            return strBuilder.toString()
        } else {
            return None
        }
    }

    /**
     * Fill the prompts to the task execution message list
     */
    public func fillTo(task: AgentTask): Unit {
        // If the request is not set, use the task request
        if (this._request.isNone()) {
            this.request(task.request)
        }
        this.fillTo(task.execution, forExecutor: task.agent.executor)
    }

    public func fillTo(execution: AgentExecutionInfo, forExecutor!: AgentExecutor): Unit {
        // Ensure that only fill to an empty execution message list
        if (!execution.messages.isEmpty()) {
            throw AgentExecutionException("PromptBuilder: The task execution messages is not empty")
        }
        //----------------------------------------------------------
        // Add messages in order to the task execution message list
        //----------------------------------------------------------
        // 1. Merge system prompts
        let systemPrompt = this.mergeSystemPrompt()
        if (!systemPrompt.trimAscii().isEmpty()) {
            execution.addMessage(Message.system(systemPrompt))
        }
        // 2. Add conversation summary
        if (let Some(summary) <- this.mergeConversationSummary()) {
            execution.addMessage(Message.system(summary))
        }
        // 3. Add conversation messages in order
        if (let Some(con) <- this._conversation) {
            for (chatRound in con) {
                execution.addMessage(chatRound.question)
                if (this.conversationWithStepMessage) {
                    for (msg in chatRound.steps) {
                        execution.addMessage(msg)
                    }
                }
                // Wrap the answer with tags for react and plan-react agents
                // to guide the LLM to generate correct final answers
                if(forExecutor.name == "react" ||
                   forExecutor.name == "plan-react") {
                    execution.addMessage(Message.assistant(chatRound.answer.content.withTag(Tag.Answer)))
                } else {
                    execution.addMessage(Message.assistant(chatRound.answer.content))
                }
            }
        }
        // 4. Add user request (together with its step messages if any)
        execution.addRequest(
            this._request.getOrThrow({ =>
                AgentExecutionException("PromptBuilder: request is not set")
            })
        )
        LogUtils.trace("Prompt Builder", "----- Initialize Agent Execution Messages -----")
        LogUtils.trace(execution.messages)
        LogUtils.trace("Prompt Builder", "----- End of Agent Execution Messages -----")
    }

    //-------------------------------------------------------------------
    // Methods for building prompt parts
    //-------------------------------------------------------------------
    protected static func buildAgentToolsPrompt(task: AgentTask): String {
        let tools = task.availableTools
        if (tools.size == 0) {
            return "# Available Tools\nNo tools"
        }
        let str = String.join(
            tools |> map { t: Tool => t.toJsonValue().toJsonString() } |> collectArray,
            delimiter: ",\n"
        )
        return "# Available Tools\n[\n ${str} \n]\n---end of tools---"
    }

    protected static func buildAgentRetrievalPrompt(task: AgentTask): String {
        if (let Some(rt) <- task.agent.retriever) {
            if (rt.mode == RetrieverMode.Dynamic) {
                return ""
            }
            let query = task.request.question
            let retrieval = rt.search(query)
            task.execution.addRetrieval(query, retrieval)
            return "# Retrieved Content\n${retrieval.toPrompt()}\n---end of Retrieved Content---"
        } else {
            return ""
        }
    }

    protected static func buildAgentMemoryPrompt(task: AgentTask): String {
        let agent = task.agent
        let query = task.request.question
        if (let Some(memory) <- agent.memory) {
            let docs = memory.search(query)
            if (docs.size == 0) {
                LogUtils.info(agent.name, "Memory not found")
                return ""
            }
            let strBuilder = StringBuilder()
            strBuilder.append("# Memory\n")
            strBuilder.append("The following is the QA history that contains the user question, the solution steps (including thoughts and actions), and the final answer.\n")
            strBuilder.append("When solving new problems, you can refer to past execution history.\n")
            for (idx in 0..docs.size) {
                strBuilder.append("## Memory ${idx+1}: \n")
                strBuilder.append(docs[idx])
                strBuilder.append("\n---\n")
            }
            strBuilder.append("---end of memory---\n")
            return strBuilder.toString()
        } else {
            return ""
        }
    }
}
