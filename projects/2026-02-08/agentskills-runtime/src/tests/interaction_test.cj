/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.dsl.*
import magic.prelude.*
import magic.interaction.*
import magic.core.interaction.*
import std.unittest.testmacro.PowerAssert

@agent
private class Foo {
    @tool[
        description: "add two numbers"
    ]
    func add(a: Int64, b: Int64): Int64 {
        return a + b
    }
}

@Test
func testInteract() {
    @interact[agent: Foo(), request: AgentRequest("22 + 33 = ?")](
        case evt: ToolCallStartEvent =>
            @PowerAssert(evt.toolRequest.name == "add")
            return EventResponse.Continue
    )
}