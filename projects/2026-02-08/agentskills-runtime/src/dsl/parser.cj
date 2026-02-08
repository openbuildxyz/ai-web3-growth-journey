/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.{ArrayList, HashMap}
import std.ast.*
protected open class Parser {
    let tokens: Tokens

    protected var currPos: Int64
    protected var currToken: Token

    protected init(tokens: Tokens, currPos!: Int64 = 0) {
        this.tokens = tokens
        this.currPos = currPos
        if (tokens.size == 0) {
            currToken = Token(TokenKind.ILLEGAL)
        } else {
            currToken = tokens[currPos]
        }
    }

    protected func assertCurrToken(kind: TokenKind) {
        if (currToken.kind != kind) {
            currToken.dump()
            throw DslException("Fail to assert the current token kind. Expected: ${kind}")
        }
    }

    protected func forwardPosition(skipNL!: Bool = true) {
        do {
            currPos += 1
        } while (currPos < tokens.size && (skipNL && tokens[currPos].kind == TokenKind.NL))
        if (currPos < tokens.size) {
            currToken = tokens[currPos]
        } else {
            currToken = Token(TokenKind.ILLEGAL)
        }
    }

    protected func nextPosition(): Int64 {
        var pos = currPos
        do {
            pos += 1
        } while (pos < tokens.size && tokens[pos].kind == TokenKind.NL)
        if (pos < tokens.size) {
            return pos
        } else {
            return -1
        }
    }

    protected func skipCurrToken(kind: TokenKind) {
        assertCurrToken(kind)
        forwardPosition()
    }

    protected func skipNextToken(kind: TokenKind) {
        forwardPosition()
        if (currToken.kind != kind) {
            currToken.dump()
            throw DslException("Assert next token failure")
        }
        forwardPosition()
    }

    protected func lookupNextToken(kind: TokenKind): Bool {
        let nextPos = nextPosition()
        if (nextPos == -1) {
            return false
        }
        return tokens[nextPos].kind == kind
    }

    protected func lookupNextToken(token: Token): Bool {
        let nextPos = nextPosition()
        if (nextPos == -1) {
            return false
        }
        let nextToken = tokens[nextPos]
        return nextToken.kind == token.kind && nextToken.value == token.value
    }

    protected func extractValue(): Tokens {
        let result = Tokens()
        if (currToken.kind == TokenKind.LSQUARE) {
            // Collect tokens (as an array value) until meeting "]"
            var depth = 0 // For nested arrays; the depth will be added first
            while (currToken.kind != TokenKind.RSQUARE || depth > 1) {
                if (currToken.kind == TokenKind.LSQUARE) {
                    depth += 1
                } else if (currToken.kind == TokenKind.RSQUARE) {
                    depth -= 1
                }
                result.append(currToken)
                forwardPosition(skipNL: true)
            }
            result.append(currToken) // Add the last ']'
            forwardPosition(skipNL: true)
        } else if (currToken.kind == TokenKind.LCURL) {
            // Collect tokens (as an array value) until meeting "}"
            var depth = 0 // For nested map; the depth will be added first
            while (currToken.kind != TokenKind.RCURL || depth > 1) {
                if (currToken.kind == TokenKind.LCURL) {
                    depth += 1
                } else if (currToken.kind == TokenKind.RCURL) {
                    depth -= 1
                }
                result.append(currToken)
                forwardPosition(skipNL: true)
            }
            result.append(currToken) // Add the last '}'
            forwardPosition(skipNL: true)
        } else {
            // Collect tokens until meeting ",", "}", or END
            // It may collect any expressions, like @macro[a=b.c()+d, ...]
            let isEndToken = { token: Token =>
                return (token.kind == TokenKind.COMMA ||
                        token.kind == TokenKind.RCURL ||
                        token.kind == TokenKind.ILLEGAL)
            }
            while (!isEndToken(currToken)) {
                result.append(currToken)
                forwardPosition(skipNL: false)
            }
        }
        return result
    }
}

protected open class AttrParser <: Parser {
    protected init(tokens: Tokens) { super(tokens) }

    protected func parseAttr(validKeys!: Array<String>, macroName!: String): HashMap<String, Tokens> {
        let map = HashMap<String, Tokens>()
        while (currPos < tokens.size) {
            if (currToken.kind == TokenKind.IDENTIFIER) {
                let key = currToken.value
                forwardPosition()
                // Skip '=' or ':'
                if (currToken.kind == TokenKind.ASSIGN || currToken.kind == TokenKind.COLON) {
                    forwardPosition()
                } else {
                    currToken.dump()
                    throw DslException("Fail to parse attributes. Expecting '=' or ':'.")
                }
                let value = extractValue()
                if (map.contains(key)) {
                    throw DslException("Duplicated attributes of `${key}`")
                }
                map.add(key, value)
            } else if (currToken.kind == TokenKind.COMMA) {
                forwardPosition() // ','
            } else {
                eprintln("Unknown token ${currToken.value} in parsing Attr")
                currToken.dump()
                break
            }
        }
        let (status, info) = Attr.checkAttr(map.keys().toArray(), validKeys)
        if (!status) {
            throw DslException("@${macroName} has invalid attributes. ${info}")
        }
        return map
    }
}

protected class ArrayParser <: Parser {
    private let beginSymbol: TokenKind
    private let endSymbol: TokenKind

    protected init(tokens: Tokens) {
        super(tokens)
        this.beginSymbol = TokenKind.LSQUARE
        this.endSymbol = TokenKind.RSQUARE
    }

    protected init(tokens: Tokens, beginSymbol!: TokenKind, endSymbol!: TokenKind) {
        super(tokens)
        this.beginSymbol = beginSymbol
        this.endSymbol = endSymbol
    }

    /**
     * Parse an array of specified tokens
     */
    protected func parseArrayOf(kind: TokenKind): ArrayList<Token> {
        let result = ArrayList<Token>()
        skipCurrToken(this.beginSymbol)
        while (currPos < tokens.size) {
            if (currToken.kind == kind) {
                result.add(currToken)
                forwardPosition()
            } else if (currToken.kind == TokenKind.COMMA) {
                forwardPosition() // ','
            } else if (currToken.kind == this.endSymbol) {
                break
            } else {
                throw DslException("Unknown token ${currToken.value} when parsing array")
            }
        }
        skipCurrToken(this.endSymbol)
        return result
    }

    /**
     * Parse an array of specified tokens
     */
    protected func parseArrayOfTokens(): ArrayList<Tokens> {
        let result = ArrayList<Tokens>()
        skipCurrToken(TokenKind.LSQUARE)
        var currTokens = Tokens()
        var depth = 0
        while (currPos < tokens.size) {
            if (currToken.kind == TokenKind.COMMA && depth == 0) {
                if (currTokens.size == 0) {
                    eprintln("Array contains empty value: ${tokens}")
                } else {
                    result.add(currTokens)
                    currTokens = Tokens() // clear current tokens
                }
                forwardPosition() // ','
            } else if (currToken.kind == TokenKind.RSQUARE && depth == 0) {
                if (currTokens.size == 0) {
                    eprintln("Array contains empty value: ${tokens}")
                } else {
                    result.add(currTokens)
                }
                break
            } else {
                if (currToken.kind == TokenKind.LCURL ||
                    currToken.kind == TokenKind.LSQUARE ||
                    currToken.kind == TokenKind.LPAREN) {
                    depth += 1
                } else if (currToken.kind == TokenKind.RCURL ||
                           currToken.kind == TokenKind.RSQUARE ||
                           currToken.kind == TokenKind.RPAREN) {
                    depth -= 1
                }
                currTokens.append(currToken)
                forwardPosition()
            }
        }
        skipCurrToken(TokenKind.RSQUARE)
        return result
    }
}

protected class MapParser <: Parser {
    protected init(tokens: Tokens) { super(tokens) }

    /**
     * Parse an map whose values are of the specified token kind,
     * and the key is represented as String.
     */
    protected func parseMapOf(kind: TokenKind): HashMap<String, Token> {
        let map = this.parseMap()
        let result = HashMap<String, Token>()
        for ((key, value) in map) {
            if (value.size != 1 || value[0].kind != kind) {
                throw DslException("`${key}` has invalid value `${value}`")
            } else {
                result.add(key, value[0])
            }
        }
        return result
    }

    protected func parseMap(): HashMap<String, Tokens> {
        let result = HashMap<String, Tokens>()
        skipCurrToken(TokenKind.LCURL)
        while (currPos < tokens.size) {
            if (currToken.kind == TokenKind.IDENTIFIER) {
                let key = currToken.value
                forwardPosition()
                if (currToken.kind != TokenKind.ASSIGN && currToken.kind != TokenKind.COLON) {
                    throw Exception("Parsing map value failed")
                }
                forwardPosition() // Skip = or :
                let value = extractValue()
                result.add(key, value)
            } else if (currToken.kind == TokenKind.COMMA) {
                forwardPosition() // ','
            } else if (currToken.kind == TokenKind.RCURL) {
                break
            } else {
                throw DslException("Unknown token ${currToken.value} when parsing map. `${this.tokens}`")
            }
        }
        skipCurrToken(TokenKind.RCURL)
        return result
    }
}