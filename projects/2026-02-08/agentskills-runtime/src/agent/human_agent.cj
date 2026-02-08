/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent

import magic.agent.base.BaseAgent
import magic.core.agent.{AgentRequest, AgentResponse, AgentResponseStatus}
import magic.core.model.ChatModel

import std.console.Console

private func consoleUI(question: String): String {
    Console.stdOut.writeln("Question: ${question}")
    Console.stdOut.write("> ")
    Console.stdOut.flush()
    let answer = Console.stdIn.readln().getOrThrow()
    return answer
}

/**
 * This agent dispatches the question to users and accepts user input as the answer.
 */
public class HumanAgent <: BaseAgent {
    let qaFunc: (String) -> String

    public init(qaFunc!: Option<(String) -> String> = None) {
        super (
            model: unsafe { zeroValue<ChatModel>() }, // HumanAgent will not use model
            name: "Human Agent",
            description: "This is an agent powered by human being. Questions will be answered by human being"
        )
        if (let Some(fn) <- qaFunc) {
            this.qaFunc = fn
        } else {
            this.qaFunc = consoleUI
        }
    }

    override public func chat(request: AgentRequest): AgentResponse {
        return AgentResponse(AgentResponseStatus.Success, qaFunc(request.question))
    }
}