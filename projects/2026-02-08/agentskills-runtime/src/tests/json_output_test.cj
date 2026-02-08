/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.prelude.*
import magic.dsl.*

@jsonable
class MyDateTime <: ToString {
    @field["Year of the foundation"]
    let year: Int64
    let month: Int64
    let date: Int64
    let time: String

    init() {
        this.year = 0
        this.month = 0
        this.date = 0
        this.time = ""
    }

    public func toString(): String {
        return "Y: ${year}\nM: ${month}\nD: ${date}\nT:${time}"
    }
}

@agent[executor:"naive", model: "${OLLAMA_CHAT_MODEL}"]
private class Foo { }

@Test
public func testJsonOutput(): Unit {
    let ag = Foo()
    @Assert(ag.chatGet<MyDateTime>("华为创建时间").getOrDefault({ => MyDateTime() }).year, 1987)
    @Assert(ag.chatGet<MyDateTime>("微软创建时间").getOrDefault({ => MyDateTime() }).year, 1975)
}