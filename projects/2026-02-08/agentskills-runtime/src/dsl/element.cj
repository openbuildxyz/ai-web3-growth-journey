/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*

public macro element(input: Tokens): Tokens {
    assertParentContext("promptPattern")

    let decl: Decl = parseDecl(input)
    if (!decl.isVarDecl()) {
        throw Exception("@element must annotate variable definitions")
    }
    let varDecl = decl.asVarDecl()
    let name = varDecl.identifier.value
    setItem("elementName", name)
    return input
}

public macro element(attr: Tokens, input: Tokens): Tokens {
    assertParentContext("promptPattern")
    let decl: Decl = parseDecl(input)
    if (!decl.isVarDecl()) {
        throw Exception("@element must annotate variable definitions")
    }
    let varDecl = decl.asVarDecl()
    let name = varDecl.identifier.value
    setItem("elementName", name)
    return input
}
