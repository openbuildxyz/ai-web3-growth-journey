/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.ArrayList
import std.ast.*

public macro jsonname(attr: Tokens, input: Tokens): Tokens {
    assertParentContext("jsonable")
    let jsonName = if (let Some(d) <- getAttrJsonName(attr)) {
        d
    } else {
        throw DslException("@jsonname must contain string literals as attributes")
    }

    let decl: Decl = parseDecl(input)
    if (!decl.isVarDecl()) {
        throw DslException("@jsonname must annotate variable definitions")
    }
    let varDecl = decl.asVarDecl()
    let varName = varDecl.identifier.value
    setItem("jsonname", "${varName}:${jsonName}")
    return input
}

func getAttrJsonName(attr: Tokens): Option<String> {
    let buffer = ArrayList<String>()
    for (token in attr) {
        if (isTokenOfKind(token, [TokenKind.NL, TokenKind.COMMA])) {
            continue
        }
        if (!isTokenStringLiteral(token)) {
            throw DslException("@jsonname accepts only string values as attributes")
        }
        buffer.add(token.value)
    }
    if (buffer.size != 1) {
        throw DslException("@jsonname accepts only one string value as attribute")
    }
    return buffer[0]
}