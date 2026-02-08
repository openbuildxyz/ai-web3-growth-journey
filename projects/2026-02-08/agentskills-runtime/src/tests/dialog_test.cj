/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.dsl.*
import magic.dsl.*
import magic.prelude.*
import std.unittest.testmacro.PowerAssert

@agent[
    executor:"naive",
    model: "${OLLAMA_CHAT_MODEL}"
]
class Bar {
}

@jsonable
class A <: ToString {
    @field["Year of the foundation"]
    let year: Int64
    let month: Int64
    let date: Int64
    let time: String

    public func toString(): String {
        return "Y: ${year}\nM: ${month}\nD: ${date}\nT:${time}"
    }
}

@Test
class TestDialog {
    @TestCase
    func test() {
        @conversation[agent: Bar()](
            "微软创建时间" -> time1: A
            @Assert(time1.year, 1975)

            "华为创建时间" -> time2: A
            @Assert(time2.year, 1987)

            "两个公司哪一个创建的更早，回答微软或者华为" -> result
            println(result)
            @Assert(result.contains("微软") || result.toAsciiLower().contains("microsoft"))
        )
    }
}