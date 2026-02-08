/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.{ArrayList, map, collectArray}
import std.ast.*

private class ToolsetAttr <: Attr {
    private static let ATTR_NAMES = [
        "tools",
        "dump"
    ]

    ToolsetAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    // Whether @toolset is used with a class or struct.
    var isClass = false

    let internalTools = ArrayList<String>()

    private var _tools: Option<Array<AgentToolAttr>> = None
    prop externalTools: Array<AgentToolAttr> {
        get() {
            if (let Some(tokens) <- getTokens("tools")) {
                let result = ArrayList<AgentToolAttr>()
                for (toolTokens in ArrayParser(tokens).parseArrayOfTokens()) {
                    result.add(AgentToolAttr.parse(toolTokens))
                }
                _tools = result.toArray()
                return _tools.getOrThrow()
            } else {
                return []
            }
        }
    }

    static func parse(attrTokens: Tokens): ToolsetAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "toolset",
            validKeys: ToolsetAttr.ATTR_NAMES
        )
        return ToolsetAttr(map)
    }
}

public macro toolset(input: Tokens): Tokens {
    let attr = ToolsetAttr()
    for (m in getChildMessages("tool")) {
        if (m.hasItem("internalTool")) {
            let name = m.getString("internalTool")
            attr.internalTools.add(name)
        }
    }
    return transformToolset(input, attr)
}

public macro toolset(attrTokens: Tokens, input: Tokens): Tokens {
    let attr = ToolsetAttr.parse(attrTokens)
    for (m in getChildMessages("tool")) {
        if (m.hasItem("internalTool")) {
            let name = m.getString("internalTool")
            attr.internalTools.add(name)
        }
    }
    let content = transformToolset(input, attr)
    if (attr.dump) {
        printTokens(content)
    }
    return content
}

/**
 * Transform the function
 * @toolset
 * struct/class <name> {
 *   @tool <func-decl>
 * }
 * AS
 * struct/class <name> <: Toolset {
 *   public override iterator(): Iterator<Tool> {
 *      [<tool-names>]
 *   }
 *   ...
 *   public static let <xxx-tool>Id = "<xxx-tool>"
 *   ...
 * }
 */
private func transformToolset(input: Tokens, attr: ToolsetAttr): Tokens {
    let decl = parseDecl(input)
    if (let Some(classDecl) <- (decl as ClassDecl)) {
        return transformToolsetClass(classDecl, attr)
    } else if (let Some(structDecl) <- (decl as StructDecl)) {
        return transformToolsetStruct(structDecl, attr)
    } else {
        throw DslException("@toolset should be used with class/struct declarations")
    }
}

private func transformToolsetClass(classDecl: ClassDecl, attr: ToolsetAttr): Tokens {
    attr.isClass = true
    return transformToolsetType(classDecl, classDecl.superTypes, classDecl.body, attr)
}

private func transformToolsetStruct(structDecl: StructDecl, attr: ToolsetAttr): Tokens {
    attr.isClass = false
    return transformToolsetType(structDecl, structDecl.superTypes, structDecl.body, attr)
}

private func transformToolsetType(typeDecl: Decl, superTypes: ArrayList<TypeNode>, body: Body, attr: ToolsetAttr): Tokens {
    let name = typeDecl.identifier
    let allSuperTypes = if (superTypes.isEmpty()) {
        quote(Toolset)
    } else {
        quote(Toolset & $(superTypes.toTokens()))
    }

    let genericTypeParamTokens = getGenericTypeParamsTokens(typeDecl)
    let genericConstraintTokens = getGenericConstraintsTokens(typeDecl)
    let classOrStruct = if (attr.isClass) {
        Token(TokenKind.CLASS)
    } else {
        Token(TokenKind.STRUCT)
    }

    let toolNames = ArrayList<Token>(attr.internalTools.size, { i =>
        newIdentifierToken(attr.internalTools[i])
    })
    for (toolAttr in attr.externalTools) {
        match (toolAttr) {
            case AgentToolAttr.NativeFuncTool(token) =>
                toolNames.add(token)
            case _ => throw DslException("Invalid tool for @toolset. Only native func tool is supported.")
        }
    }

    let toolIdTokens = Tokens()
    for (name in attr.internalTools) {
        toolIdTokens.append(quote(
            public static let $( newIdentifierToken("_${name}") ) = $( newLiteralToken(name) )
        ))
    }

    // Compose all `Tokens`
    return quote(
        $(typeDecl.modifiers) $classOrStruct $name $genericTypeParamTokens <: $allSuperTypes $genericConstraintTokens {
            $(body.decls)
            public override prop tools: Array<Tool> {
                get() {
                    [ $( joinTokens(toolNames, Token(TokenKind.COMMA)) ) ]
                }
            }
            $toolIdTokens
        }
    )
}

