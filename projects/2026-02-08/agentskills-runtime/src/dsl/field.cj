/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.ArrayList
import std.ast.*

public macro field(attr: Tokens, input: Tokens): Tokens {
    assertParentContext("jsonable")
    let desc = if (let Some(d) <- getAttrDescription(attr)) {
        d
    } else {
        throw DslException("@field must contain string literals as attributes")
    }

    let decl: Decl = parseDecl(input)
    if (!decl.isVarDecl()) {
        throw DslException("@field must annotate variable definitions")
    }
    let varDecl = decl.asVarDecl()
    let name = varDecl.identifier.value
    setItem("fieldDesc", "${name}:${desc}")
    return input
}

func getAttrDescription(attr: Tokens): Option<String> {
    let buffer = ArrayList<String>()
    for (token in attr) {
        if (isTokenOfKind(token, [TokenKind.NL, TokenKind.COMMA])) {
            continue
        }
        if (!isTokenStringLiteral(token)) {
            throw DslException("@field accepts only string values as attributes")
        }
        buffer.add(token.value)
    }
    return String.join(buffer.toArray(), delimiter: "\n")
}