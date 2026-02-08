/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*

class HandlerAttr <: Attr {
    HandlerAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    static func parse(attrTokens: Tokens): HandlerAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "handler",
            validKeys: [""]
        )
        return HandlerAttr(map)
    }
}

public macro handler(input: Tokens): Tokens {
    assertParentContext("agent")
    setItem("defineHandler", true)
    let handlerAttr = HandlerAttr()
    return transformHandler(input, handlerAttr)
}

public macro handler(attr: Tokens, input: Tokens): Tokens {
    assertParentContext("agent")
    setItem("defineHandler", true)
    let handlerAttr = HandlerAttr.parse(attr)
    let result = transformHandler(input, handlerAttr)
    if (handlerAttr.dump) {
        printTokens(result)
    }
    return result
}

/**
 * Transform
 * @handler[...]( ... )
 * AS
 * private func HANDLER_FUNC_NAME(): EventHandlerManager {
 *   let manager = EventHandlerManager()
 *   ...
 *   return $manager
 * }
 */
func transformHandler(input: Tokens, handlerAttr: HandlerAttr): Tokens {
    let funcName = newIdentifierToken("${HANDLER_FUNC_NAME}")
    let body = transformEventHandlers(input)
    return quote(
        private func $funcName(): EventHandlerManager {
            $body
            return manager
        }
    )
}
