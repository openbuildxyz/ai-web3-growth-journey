/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*

class PromptAttr <: Attr {
    PromptAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    prop pattern: Option<String> {
        get() { getLiteral("pattern") }
    }

    prop include: Option<String> {
        get() { getLiteral("include") }
    }

    prop solid: Bool {
        get() { getBool("solid", default: true) }
    }

    static func parse(attrTokens: Tokens): PromptAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "prompt",
            validKeys: ["pattern", "include", "solid"]
        )
        if (map.contains("pattern") && map.contains("include")) {
            throw DslException("`pattern` and `include` cannot be used together")
        }
        return PromptAttr(map)
    }
}

public macro prompt(input: Tokens): Tokens {
    assertParentContext("agent")
    setItem("definePrompt", true)
    let promptAttr = PromptAttr()
    return transformPrompt(input, promptAttr)
}

public macro prompt(attr: Tokens, input: Tokens): Tokens {
    assertParentContext("agent")
    setItem("definePrompt", true)
    let promptAttr = PromptAttr.parse(attr)
    setItem("prompt:solid", promptAttr.solid)
    let result = transformPrompt(input, promptAttr)
    if (promptAttr.dump) {
        printTokens(result)
    }
    return result
}

/**
 * Transform
 * ```
 * @prompt[...]( ... )
 * ```
 * as
 * private func SYSTEM_PROMPT_FUNC_NAME(): String {
 *   let pattern = $pattern(...)
 *   return pattern.toString()
 * }
 * or
 * private func SYSTEM_PROMPT_FUNC_NAME(): String {
 *   let PROMPT_BUILDER = StingBuilder()
 *   ...
 *   return $PROMPT_BUILDER.toString()
 * }
 */
func transformPrompt(input: Tokens, promptAttr: PromptAttr): Tokens {
    let funcName = newIdentifierToken("${SYSTEM_PROMPT_FUNC}")

    // Check whether the system prompt is written with patterns or raw string literals
    if (let Some(patternName) <- promptAttr.pattern) {
        // Case 1: Written in prompt patterns
        // `input` consist of lambda functions of prompt elements
        let pattern = newIdentifierToken(patternName)
        return quote(private func $funcName(): String {
            let pattern = $pattern($input)
            return pattern.toString()
        })
    } else if (let Some(path) <- promptAttr.include) {
        if (!exists(path)) {
            throw DslException("`include` refers to non-existing file: ${path}")
        }
        return quote(private func $funcName(): String {
            return PromptUtils.readPromptFile($(newLiteralToken(path)))
        })
    } else {
        // Case 2: if no patterns are specified, the system prompt is written in raw string literals
        let tokens = quote(private func $funcName(): String {
            let $PROMPT_BUILDER = StringBuilder()
            $input
            return $PROMPT_BUILDER.toString()
        })
        return transformStringLiteral(tokens, isDecl: true)
    }
}

/**
 * 1. Find all independent string literals, which are top-level STRING_LITERAL tokens
 *    Since we cannot mutate AST in-place, we collect positions of these tokens
 * 2. Replace all these string literals (tokens) with a call of `prompt_builder`
 */
func transformStringLiteral(input: Tokens, isDecl!: Bool): Tokens {
    let node: Node = if (isDecl) {
        parseDecl(input)
    } else {
        parseExpr(input)
    }
    let collector = collectIndependentStringLiteral(node)
    let transformedTokens = Tokens()
    for (token in input) {
        if ((token.kind == TokenKind.STRING_LITERAL ||
            token.kind == TokenKind.MULTILINE_STRING) &&
            collector.isIndependentStringLiteral(token)) {
            transformedTokens.append(quote(
                $PROMPT_BUILDER.append($token)
                // $token
            ))
        } else {
            transformedTokens.append(token)
        }
    }
    return transformedTokens
}
