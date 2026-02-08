/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.{collectArrayList, ArrayList, HashMap, map}
import std.ast.*

class RetrieverAttr <: Attr {
    RetrieverAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    var isClass = true

    prop mode: String {
        get() { getString("mode") ?? "static" }
    }

    prop description: String {
        get() { getString("description") ?? "" }
    }

    static func parse(attrTokens: Tokens): RetrieverAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "retriever",
            validKeys: ["mode", "description", "dump"]
        )
        return RetrieverAttr(map)
    }
}

public macro retriever(input: Tokens): Tokens {
    let retrieverAttr = RetrieverAttr()
    return transformRetriever(input, retrieverAttr)
}

public macro retriever(attr: Tokens, input: Tokens): Tokens {
    let retrieverAttr = RetrieverAttr.parse(attr)
    let content = transformRetriever(input, retrieverAttr)
    if (retrieverAttr.dump) {
        printTokens(content)
    }
    return content
}

func transformRetriever(input: Tokens, retrieverAttr: RetrieverAttr): Tokens {
    let decl = parseDecl(input)
    if (let Some(classDecl) <- (decl as ClassDecl)) {
        return transformRetrieverClass(classDecl, retrieverAttr)
    } else if (let Some(structDecl) <- (decl as StructDecl)) {
        return transformRetrieverStruct(structDecl, retrieverAttr)
    } else {
        throw Exception("@retriever should be used on class/struct declarations")
    }
}

func transformRetrieverClass(classDecl: ClassDecl, retrieverAttr: RetrieverAttr): Tokens {
    retrieverAttr.isClass = true
    return transformRetrieverType(classDecl, classDecl.superTypes, classDecl.body, retrieverAttr)
}

func transformRetrieverStruct(structDecl: StructDecl, retrieverAttr: RetrieverAttr): Tokens {
    retrieverAttr.isClass = false
    return transformRetrieverType(structDecl, structDecl.superTypes, structDecl.body, retrieverAttr)
}


/**
 * Transform
 * @retriever
 * class F {
 *   ...
 * }
 * as
 * class F <: Retriever {
 *   prop description: String { get() "..." }
 *   private var _mode = ...
 *   mut prop mode: RetrieverMode {
 *      get() { _mode }
 *      set(v) { _mode = v }
 *   }
 * }
 */
func transformRetrieverType(typeDecl: Decl, superTypes: ArrayList<TypeNode>, body: Body, retrieverAttr: RetrieverAttr): Tokens {
    let name = typeDecl.identifier
    let allSuperTypes = if (superTypes.isEmpty()) {
        quote(Retriever)
    } else {
        quote(Retriever & $(superTypes.toTokens()))
    }

    let genericTypeParamTokens = getGenericTypeParamsTokens(typeDecl)
    let genericConstraintTokens = getGenericConstraintsTokens(typeDecl)
    let classOrStruct = if (retrieverAttr.isClass) {
        Token(TokenKind.CLASS)
    } else {
        Token(TokenKind.STRUCT)
    }
    let defaultMode = if (retrieverAttr.mode == "static") {
        quote(RetrieverMode.Static)
    } else {
        quote(RetrieverMode.Dynamic)
    }

    // Compose all `Tokens`
    return quote(
        $(typeDecl.modifiers) $classOrStruct $name $genericTypeParamTokens <: $allSuperTypes $genericConstraintTokens {
            $(body.decls)
            public prop description: String {
                get() { $(newLiteralToken(retrieverAttr.description)) }
            }
            private var _mode = $defaultMode
            public mut prop mode: RetrieverMode {
                get() { _mode }
                set(v) { _mode = v }
            }
        }
    )
}