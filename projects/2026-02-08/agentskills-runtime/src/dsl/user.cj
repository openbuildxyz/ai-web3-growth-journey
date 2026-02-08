/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*

class UserAttr <: Attr {
    UserAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    prop include: Option<String> {
        get() {
            getLiteral("include")
        }
    }

    static func parse(attrTokens: Tokens): UserAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "user",
            validKeys: ["include"]
        )
        return UserAttr(map)
    }
}

public macro user(input: Tokens): Tokens {
    assertParentContext("agent")
    let userAttr = UserAttr()
    return transformUser(input, userAttr)
}

public macro user(attr: Tokens, input: Tokens): Tokens {
    assertParentContext("agent")
    let userAttr = UserAttr.parse(attr)
    let result = transformUser(input, userAttr)
    return result
}

/**
 * Transform
 * ```
 * @user( ... )
 * ```
 * as
 * override protected func USER_PROMPT_FUNC_NAME(): String {
 *   let PROMPT_BUILDER = StingBuilder()
 *   ...
 *   return $PROMPT_BUILDER.toString()
 * }
 */
func transformUser(input: Tokens, userAttr: UserAttr): Tokens {
    let funcName = newIdentifierToken("${USER_PROMPT_FUNC}")
    if (let Some(path) <- userAttr.include) {
        if (!exists(path)) {
            throw DslException("`include` refers to non-existing file: ${path}")
        }
        return quote(override protected func $funcName(): String {
            return PromptUtils.readPromptFile($(newLiteralToken(path)))
        })
    } else {
        let tokens = quote(override protected func $funcName(): String {
            let $PROMPT_BUILDER = StringBuilder()
            $input
            return $PROMPT_BUILDER.toString()
        })
        return transformStringLiteral(tokens, isDecl: true)
    }
}
