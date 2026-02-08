/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.{HashMap, HashSet}
import std.ast.*

protected type AttrMap = HashMap<String, Tokens>

protected open class Attr {
    protected Attr(protected let map: AttrMap) { }

    protected prop dump: Bool {
        get() { getBool("dump") }
    }

    private func filterTokens(tokens: Tokens): Tokens {
        let result = Tokens()
        for (token in tokens) {
            if (token.kind != TokenKind.NL) {
                result.append(token)
            }
        }
        return result
    }

    protected func getLiteral(key: String): Option<String> {
        if (let Some(tokens) <- map.get(key)) {
            let validTokens = filterTokens(tokens)
            if (validTokens.size != 1) {
                throw DslException("Attr key-value error. Key: ${key}, Value: ${validTokens}")
            }
            return Some(validTokens[0].value)
        } else {
            return None
        }
    }

    protected func getTokens(key: String): Option<Tokens> {
        return map.get(key)
    }

    protected func getBool(key: String, default!: Bool = false): Bool {
        if (let Some(v) <- getLiteral(key)) {
            if (v == "true") {
                return true
            } else if (v == "false") {
                return false
            } else {
                throw DslException("Attribute `${key}` should has a bool value")
            }
        }
        return default
    }

    protected func getString(key: String): Option<String> {
        return getLiteral(key)
    }

    protected static func checkAttr(attrNames: Array<String>,
                                    validAttrNames: Array<String>): (Bool, String) {
        let names = HashSet(attrNames)
        if (names.size != attrNames.size) {
            return (false, "Duplicated attributes")
        }
        names.remove(all: validAttrNames)
        if (!names.isEmpty()) {
            return (false, "Invalid attributes ${names}")
        }
        return (true, "Okay")
    }
}

