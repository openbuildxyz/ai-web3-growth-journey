/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.prelude.*
import magic.dsl.*

@agent[model: "${OLLAMA_CHAT_MODEL}",
       executor:"naive",
       description: "Product manager"]
class PM { }

@agent[model: "${OLLAMA_CHAT_MODEL}",
       executor:"naive",
       description: "Program engineer"]
class Coder { }

@agent[model: "${OLLAMA_CHAT_MODEL}",
       executor:"naive",
       description: "Program tester"]
class Tester { }

public func demoFreeGroup() {
    let g = PM() | Coder() | Tester()
    let r = g.chat(AgentRequest("Make a bubble sorting")).content
    println(r)
}


@agent[executor: "naive"]
class AgentWithNumber {
    @prompt(
        "You are playing a game of guess-my-number. You have the "
        "number 33 in your mind, and I will try to guess it. "
        "If I guess too high, say 'too high', if I guess too low, say 'too low'."
    )
}

@agent[executor: "naive"]
class AgentGuessNumber {
    @prompt(
        "I have a number in my mind, and you will try to guess it. "
        "If I say 'too high', you should guess a lower number. If I say 'too low', "
        "you should guess a higher number. "
    )
}

public func demoRoundRobinDiscuss() {
    let group = AgentWithNumber() | AgentGuessNumber()
    group.discuss(topic: "Number guessing game",
                  initiator: "AgentWithNumber",
                  speech: "I have a number between 1 and 70. Guess it!",
                  mode: FreeGroupMode.RoundRobin)
}