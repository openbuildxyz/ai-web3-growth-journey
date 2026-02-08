/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.dsl.*
import magic.prelude.*
import magic.core.{Interceptor, InterceptorMode}
import magic.config.Config
import magic.agent.HumanAgent
import std.unittest.testmacro.PowerAssert

func mockUI(q: String): String {
    return "MOCK RESPONSE"
}

@agent[executor:"naive", model: "${OLLAMA_CHAT_MODEL}"]
private class Foo { }

@Test
func testHumanIntercept() {
    Config.logLevel = "TRACE"
    Config.logFile = "./logs/abc.log"

    let ag = Foo()
    let human = HumanAgent(qaFunc: mockUI)
    ag.interceptor = Interceptor(human, mode: InterceptorMode.Periodic(2))

    println(ag.chat("hello"))
    println(ag.chat("What's your name"))
    @Assert(ag.chat("How old are you"), "MOCK RESPONSE")

    println(ag.chat("Apple or orange?"))
    println(ag.chat("Nice to meet you"))
    @Assert(ag.chat("How old are you"), "MOCK RESPONSE")
}