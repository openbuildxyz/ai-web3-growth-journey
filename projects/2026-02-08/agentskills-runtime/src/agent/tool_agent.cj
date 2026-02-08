/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent

import magic.agent.base.BaseAgent
import magic.core.agent.{AgentRequest, AgentResponse, AgentResponseStatus}
import magic.core.model.ChatModel
import magic.jsonable.Jsonable

/**
 * This agent will not use LLMs to answer question.
 * Instead, it runs the provided function.
 */
public class ToolAgent<T> <: BaseAgent where T <: Jsonable<T> {
    let fn: (String) -> T

    public init(fn!: (String) -> T) {
        super(
            model: unsafe { zeroValue<ChatModel>() }, // ToolAgent will not use model
            name: "Tool Agent",
            description: "This is an agent powered by a function. Questions will be answered by executing the function."
        )
        this.fn = fn
    }

    override public func chat(request: AgentRequest): AgentResponse {
        return AgentResponse(
            AgentResponseStatus.Success,
            fn(request.question).toJsonValue().toJsonString()
        )
    }

    // U should satisfy T <: U or T == U; however, we cannot write down the constraint
    // public func chatGet<U>(question: String): Option<U> where U <: Jsonable<U> {
    //     let obj = fn(question).toJsonValue()
    //     return U.fromJsonValue(obj)
    // }
}