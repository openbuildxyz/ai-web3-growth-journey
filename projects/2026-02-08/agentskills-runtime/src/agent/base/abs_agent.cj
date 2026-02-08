/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent.base

import magic.core.agent.*
import magic.core.message.Message
import magic.config.Config
import magic.model.ModelUtils
import magic.jsonable.Jsonable
import magic.log.LogUtils
import magic.parser.{ParserUtils, ParserException}
import magic.interaction.{AgentStartEvent, AgentEndEvent}

//------------------------------------------------
// The agent type hierarchy:
// Interface Agent
//  |- AbsAgent
//      |- UserDefinedAgent
//          |- Agents defined by `@agent`
//      |- BaseAgent
//          |- Customized agents defined by APIs
//------------------------------------------------

public abstract class AbsAgent <: Agent {
    /**
     * Register uncaught exception handler to avoid ugly stack traces
     * Since this class will always be used as a base class,
     * we register the exception handler here.
    */
    static init() {
        Thread.handleUncaughtExceptionBy { thread: Thread, ex: Exception =>
            // Ignore cancelled exception
            if (ex is AgentCancelException) {
                return
            }
            let strBuilder = StringBuilder()
            strBuilder.append("Uncaught exception in thread ${thread.name}: ${ex}")
            for (ste in ex.getStackTrace()) {
                strBuilder.append("${ste.fileName}:${ste.lineNumber} ${ste.methodName}\n")
            }
            LogUtils.error(strBuilder.toString())
        }
    }

    public func chat(question: String): String {
        let resp = chat(AgentRequest(question))
        if (resp.status == AgentResponseStatus.Cancelled) {
            throw AgentCancelException(reason: resp.content)
        }
        return resp.content
    }

    public open override func chat(request: AgentRequest): AgentResponse {
        // Process file imports
        let processedRequest = AgentOp.preprocessRequest(request)
        AgentOp.handle(event: AgentStartEvent(this, request))

        try {
            if (let Some(interceptor) <- this.interceptor) {
                if (interceptor.shouldIntercept(processedRequest)) {
                    let resp = interceptor.doIntercept(processedRequest)
                    AgentOp.handle(event: AgentEndEvent(this, request, resp))
                    return resp
                } else {
                    interceptor.doBypass(processedRequest)
                }
            }
            let resp = this.executor.run(this, processedRequest)
            match (resp.status) {
                case AgentResponseStatus.Success =>
                    // Update the agent memory if needed
                    if (let Some(memory) <- this.memory) {
                        memory.update(resp.execution.chatRound.toString())
                    }
                case _ => ()
            }
            AgentOp.handle(event: AgentEndEvent(this, request, resp))
            return resp
        } catch (ex: AgentCancelException) {
            LogUtils.info("Agent execution cancelled by user. ${ex.reason}")
            return AgentResponse(AgentResponseStatus.Cancelled, ex.reason)
        } catch (ex: Exception) {
            AgentOp.handle(event: AgentEndEvent(this, request, None))
            return AgentResponse(AgentResponseStatus.Failed, ex.message)
        }
    }

    public func asyncChat(question: String): AsyncAgentResponse {
        return asyncChat(AgentRequest(question))
    }

    override open public func asyncChat(request: AgentRequest): AsyncAgentResponse {
        // Process file imports
        let processedRequest = AgentOp.preprocessRequest(request)
        AgentOp.handle(event: AgentStartEvent(this, request))
        let asyncResp = this.executor.asyncRun(this, processedRequest)
        asyncResp.addFinishFn({ okay =>
            if (okay) {
                AgentOp.handle(event: AgentEndEvent(this, request, asyncResp))
            } else {
                AgentOp.handle(event: AgentEndEvent(this, request, None))

            }
        })
        return asyncResp
    }

    public func chatGet<T>(question: String): Option<T> where T <: Jsonable<T> {
        return chatGet<T>(AgentRequest(question))
    }

    /**
     * Query the agent, get a response of required schema,
     * and convert the response content to the required type
     */
    public func chatGet<T>(request: AgentRequest): Option<T> where T <: Jsonable<T> {
        request.outputSchema = T.getTypeSchema()
        let resp = this.chat(request)
        // Reuse the message list
        var (answer, messageList) = (resp.content, resp.execution.messages)
        for (_ in 0..Config.outputRepairRetryNumber) {
            // Convert the answer to a value of type T
            try {
                return ParserUtils.extractFirstValue<T>(answer)
            } catch(_: ParserException) {
                let schema = T.getTypeSchema()
                let userMsg = Message.user("Output does not follow the type schema: ${schema}")
                LogUtils.info(this.name, userMsg)
                messageList.add(userMsg)
                // Continue to let the model repair the output
                let msg = AgentOp.chatLLM(this, messageList, forRequest: request).getOrThrow({ =>
                    AgentExecutionException("Fail to get chat model response")
                }).message
                LogUtils.info(this.name, msg)
                messageList.add(msg)
                answer = msg.content
                resp.execution.setAnswer(answer)
            }
        }
        LogUtils.error("${this.name}: Fail to generate an output following the type schema")
        return None
    }
}
