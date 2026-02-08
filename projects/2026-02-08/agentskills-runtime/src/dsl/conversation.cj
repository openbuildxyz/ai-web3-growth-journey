/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*

class ConversationAttr <: Attr {
    ConversationAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    prop agent: Tokens {
        get() { getTokens("agent").getOrThrow() }
    }

    static func parse(attrTokens: Tokens): ConversationAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "conversation",
            validKeys: ["agent"],
        )
        return ConversationAttr(map)
    }
}

public macro conversation(attrTokens: Tokens, input: Tokens): Tokens {
    let attr = ConversationAttr.parse(attrTokens)
    let content = transformConversation(input, attr)
    if (attr.dump) {
        printTokens(content)
    }
    return content
}

func transformConversation(input: Tokens, attr: ConversationAttr): Tokens {
    // 1. Process conversation-related tokens
    var transformedTokens = transformDialogTokens(input)
    // 3. Wrap the conversation into a lambda function (as its scope) and call it immediately
    // 4. transform if the last expression is an infer expression
    let lambda = quote({ => $transformedTokens })
    // Compose as a call of the lambda
    return quote(
        { =>
            let __CURR_CONVERSATION__ = Conversation()
            let __CURR_AGENT__ = $(attr.agent)
            $transformedTokens
        }()
    )
}

func transformDialogTokens(tokens: Tokens): Tokens {
    let transformedTokens = Tokens()
    var (lastPos, currPos) = (-1, 0)
    while (currPos < tokens.size) {
        let currToken = tokens[currPos]
        match (currToken.kind) {
            case TokenKind.RSHIFT => // >>
                transformedTokens.append(quote(
                    __CURR_CONVERSATION__.clear()
                ))
            case TokenKind.ARROW => // ->
                if (lastPos >= 0 && tokens[lastPos].kind == TokenKind.STRING_LITERAL) {
                    // Remove the last token that is appended during the previous iteration
                    transformedTokens.remove(transformedTokens.size - 1)
                    // Parse the chat expression and append its transformed tokens
                    let (chatExprTokens, endPos) = ChatExprParser.parse(tokens, lastPos)
                    currPos = endPos // We may set lastPos = -1 here?
                    transformedTokens.append(chatExprTokens)
                } else {
                    transformedTokens.append(currToken)
                }
            case _ =>
                transformedTokens.append(currToken)
        }
        lastPos = currPos
        currPos += 1
    }
    return transformedTokens
}

/**
 * Parsing "..." -> variable [: type]?
 **/
class ChatExprParser <: Parser {
    init(tokens: Tokens, currPos: Int64) {
        super(tokens, currPos: currPos)
    }

    func doParse(): (Tokens, Int64) {
        // "..." -> <var> [':' <type>]?
        let chatMessage = currToken
        skipCurrToken(TokenKind.STRING_LITERAL)
        skipCurrToken(TokenKind.ARROW)
        let varToken = currToken
        let tempToken = newIdentifierToken("${currToken.value}__TEMP__")
        let content = match (parseType()) {
            case Some(ty) =>
                quote(
                    let $tempToken = __CURR_AGENT__.chatGet<$ty>(AgentRequest($chatMessage, conversation: __CURR_CONVERSATION__))
                    match ($tempToken) {
                        case Some(v) =>
                            __CURR_CONVERSATION__.addChatRound(
                                Message.user($chatMessage),
                                Message.assistant(v.toJsonValue().toJsonString())
                            )
                        case None =>
                            __CURR_CONVERSATION__.addChatRound(
                                Message.user($chatMessage),
                                Message.assistant("Generate JSON object failed")
                            )
                    }
                    let $varToken = $tempToken.getOrThrow()
                )
            case None =>
                quote(
                    let $varToken = __CURR_AGENT__.chat(
                        AgentRequest($chatMessage, conversation: __CURR_CONVERSATION__)
                    ).content
                    __CURR_CONVERSATION__.addChatRound(
                        Message.user($chatMessage),
                        Message.assistant($varToken)
                    )
                )
        }
        return (content, currPos)
    }

    func parseType(): Option<Tokens> {
        if (!lookupNextToken(TokenKind.COLON)) {
            return None
        }
        skipNextToken(TokenKind.COLON)
        // Collect tokens until meeting a newline
        let result = Tokens()
        while (currToken.kind != TokenKind.NL) {
            result.append(currToken)
            forwardPosition(skipNL: false)
        }
        if (result.size == 0) {
            throw DslException("Parse chat expression error. Missing type.")
        }
        return result
    }

    static func parse(tokens: Tokens, currPos: Int64): (Tokens, Int64) {
        let parser = ChatExprParser(tokens, currPos)
        return parser.doParse()
    }
}
