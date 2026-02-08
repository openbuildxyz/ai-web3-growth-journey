/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.{ArrayList, map, collectArray}
import std.ast.*
@When[cjc_version >= "1.0.0"]
internal import std.fs.exists

import std.fs.{File, OpenMode}
import std.io.StringReader

@When[cjc_version < "1.0.0"]
protected func exists(path: String): Bool {
    return File.exists(path) || Directory.exists(path)
}

protected func readFile(path: String): String {
    try (file = File(path, OpenMode.Read)) {
        let reader = StringReader(file)
        return reader.readToEnd()
    }
    throw UnsupportedException()
}

protected func newIdentifierToken(id: String): Token {
    return Token(TokenKind.IDENTIFIER, id)
}

protected func newArrayOfIdentifierToken(ids: Array<String>): Array<Token> {
    let result = ArrayList<Token>()
    for (id in ids) {
        result.add(newIdentifierToken(id))
    }
    return result.toArray()
}

protected func newLiteralToken(v: Bool): Token {
    return Token(TokenKind.BOOL_LITERAL, v.toString())
}

protected func newLiteralToken(v: Int64): Token {
    return Token(TokenKind.INTEGER_LITERAL, v.toString())
}

protected func newLiteralToken(v: String): Token {
    if (v.contains("\n")) {
        return Token(TokenKind.MULTILINE_STRING, v)
    } else {
        return Token(TokenKind.STRING_LITERAL, v)
    }
}

protected func newArrayOfLiteralToken(values: Array<String>): Array<Token> {
    let result = ArrayList<Token>()
    for (v in values) {
        result.add(newLiteralToken(v))
    }
    return result.toArray()
}

protected func newMultilineStringLiteralToken(v: String): Token {
    return Token(TokenKind.MULTILINE_STRING, v)
}

protected func newLiteralToken(v: Float64): Token {
    return Token(TokenKind.FLOAT_LITERAL, v.toString())
}

protected func concatTokens(tokensList: ArrayList<Tokens>): Tokens {
    var ret: Tokens = Tokens()
    for (tokens in tokensList) {
        ret = ret + tokens
    }
    return ret
}

protected func joinTokens(tokensList: Array<Tokens>, separator: Token): Tokens {
    if (tokensList.isEmpty()) {
        return Tokens()
    } else if (tokensList.size == 1) {
        return tokensList[0]
    } else {
        var ret = tokensList[0]
        for (i in 1..tokensList.size) {
            ret = ret + separator + tokensList[i]
        }
        return ret
    }
}

protected func joinTokens(tokensList: ArrayList<Tokens>, separator: Token): Tokens {
    return joinTokens(tokensList.toArray(), separator)
}

protected func joinTokens(tokenList: Array<Token>, separator: Token): Tokens {
    if (tokenList.isEmpty()) {
        return Tokens()
    } else if (tokenList.size == 1) {
        return Tokens() + tokenList[0]
    } else {
        var ret = Tokens() + tokenList[0]
        for (i in 1..tokenList.size) {
            ret = ret + separator + tokenList[i]
        }
        return ret
    }
}

protected func joinTokens(tokenList: ArrayList<Token>, separator: Token): Tokens {
    return joinTokens(tokenList.toArray(), separator)
}

protected func isTokenOfKind(token: Token, kinds: Array<TokenKind>): Bool {
    for (kind in kinds) {
        if (token.kind == kind) {
            return true
        }
    }
    return false
}

protected func isTokenLiteral(token: Token): Bool {
    return isTokenOfKind(token, [
        TokenKind.STRING_LITERAL,  TokenKind.MULTILINE_STRING,
        TokenKind.INTEGER_LITERAL, TokenKind.BOOL_LITERAL,
        TokenKind.FLOAT_LITERAL
    ])
}

protected func isTokenStringLiteral(token: Token): Bool {
    return isTokenOfKind(token, [
        TokenKind.STRING_LITERAL,  TokenKind.MULTILINE_STRING
    ])
}

protected func printTokens(tokens: Tokens): Unit {
    let s = tokens.toString()
    println(s)
}

protected func getGenericTypeParamsTokens(decl: Decl): Tokens {
    try {
        let generic = decl.genericParam
        return generic.toTokens()
    } catch(_: ASTException) {
        return Tokens()
    }
}

protected func getGenericConstraintsTokens(decl: Decl): Tokens {
    let tokens = Tokens()
    for (c in decl.genericConstraint) {
        tokens.append(c.toTokens())
    }
    return tokens
}

//=====================================================================
// Auxiliary protected functions to help modify protected function decls
//=====================================================================
protected func renameFunction(funcDecl: FuncDecl, newName: Token): Tokens {
    let modifier = funcDecl.modifiers
    let paramList = funcDecl.funcParams
    let retType: TypeNode = try {
        funcDecl.declType
    } catch (_: ASTException) {
        PrimitiveType(quote(Unit))
    }
    let funcBody = funcDecl.block
    let genericTypeParam = getGenericTypeParamsTokens(funcDecl)
    let genericConstraint = getGenericConstraintsTokens(funcDecl)

    return quote (
        $modifier func $newName $genericTypeParam ( $paramList ): $retType $genericConstraint
            $funcBody
    )
}

protected func renameFunctionAsOperator(funcDecl: FuncDecl): Tokens {
    let modifier = funcDecl.modifiers
    let paramList = funcDecl.funcParams
    let retType: TypeNode = try {
        funcDecl.declType
    } catch (_: ASTException) {
        PrimitiveType(quote(Unit))
    }
    let funcBody = funcDecl.block
    let genericTypeParam = getGenericTypeParamsTokens(funcDecl)
    let genericConstraint = getGenericConstraintsTokens(funcDecl)

    return quote (
        $modifier operator func() $genericTypeParam ( $paramList ): $retType $genericConstraint
            $funcBody
    )
}

/**
 * Get the names of all parameters in a function declaration.
 */
protected func getFuncParamNames(funcDecl: FuncDecl): Array<String> {
    return funcDecl.funcParams |>
        map { param: FuncParam => param.identifier.value } |>
        collectArray
}

/**
 * Get the types of all parameters in a function declaration.
 */
protected func getFuncParamTypes(funcDecl: FuncDecl): Array<Tokens> {
    return funcDecl.funcParams |>
        map { param: FuncParam => param.paramType.toTokens() } |>
        collectArray
}

protected func getRetTypeTokens(funcDecl: FuncDecl): Tokens {
    try {
        let ty = funcDecl.declType
        return ty.toTokens()
    } catch (_: ASTException) {
        return Tokens([Token(TokenKind.UNIT)])
    }
}

protected func isRetUnit(funcDecl: FuncDecl): Bool {
    try {
        let ty = funcDecl.declType
        if (ty.isPrimitiveType()) {
            return ty.asPrimitiveType().keyword.kind == TokenKind.UNIT
        } else {
            return false
        }
    } catch (_: ASTException) {
        return true
    }
}

func isOption(typeNode: TypeNode): Bool {
    if (let Some(varType) <- (typeNode as RefType)) {
        return varType.identifier.value == "Option"
    }
    return false
}

class ReturnVisitor <: Visitor {
    var visited = false

    override public func visit(expr: ReturnExpr) {
        visited = true
    }
}

protected func hasReturnExpr(node: Node): Bool {
    let visitor = ReturnVisitor()
    node.traverse(visitor)
    return visitor.visited
}

protected func parseFuncDecl(tokens: Tokens): FuncDecl {
    match (parseDecl(tokens) as FuncDecl) {
        case Some(f) => return f
        case None => throw DslException("Expected FuncDecl")
    }
}

protected func getTypeName(ty: TypeNode): String {
    if (ty is PrimitiveType) {
        return (ty as PrimitiveType).getOrThrow().keyword.value
    } else if (ty is RefType) {
        return (ty as RefType).getOrThrow().identifier.value
    } else {
        return "Error"
    }
}

protected interface NodeExt { }

extend Node <: NodeExt {
    protected func isDecl(): Bool {
        match (this as Decl) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isFuncDecl(): Bool {
        match (this as FuncDecl) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isClassDecl(): Bool {
        match (this as ClassDecl) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isVarDecl(): Bool {
        match (this as VarDecl) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isExpr(): Bool {
        match (this as Expr) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isLambdaExpr(): Bool {
        match (this as LambdaExpr) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isRefExpr(): Bool {
        match (this as RefExpr) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isCallExpr(): Bool {
        match (this as CallExpr) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isMemberAccess(): Bool {
        match (this as MemberAccess) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isRefType(): Bool {
        match (this as RefType) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isPrimitiveType(): Bool {
        match (this as PrimitiveType) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isLitConstExpr(): Bool {
        match (this as LitConstExpr) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isStringLiteral(): Bool {
        match (this as LitConstExpr) {
            case Some(lit) =>
                lit.literal.kind == TokenKind.STRING_LITERAL ||
                lit.literal.kind == TokenKind.MULTILINE_STRING
            case None => false
        }
    }

    protected func isBinaryExpr(): Bool {
        match (this as BinaryExpr) {
            case Some(_) => true
            case None => false
        }
    }

    protected func isTrailingClosureExpr(): Bool {
        match (this as TrailingClosureExpr) {
            case Some(_) => true
            case None => false
        }
    }

    protected func asDecl() {
        (this as Decl).getOrThrow()
    }

    protected func asLitConstExpr() {
        (this as LitConstExpr).getOrThrow()
    }

    protected func asBinaryExpr() {
        (this as BinaryExpr).getOrThrow()
    }

    protected func asRefExpr() {
        (this as RefExpr).getOrThrow()
    }

    protected func asVarDecl() {
        (this as VarDecl).getOrThrow()
    }

    protected func asFuncDecl() {
        (this as FuncDecl).getOrThrow()
    }

    protected func asClassDecl() {
        (this as ClassDecl).getOrThrow()
    }

    protected func asExpr() {
        (this as Expr).getOrThrow()
    }

    protected func asCallExpr() {
        (this as CallExpr).getOrThrow()
    }

    protected func asMemberAccess() {
        (this as MemberAccess).getOrThrow()
    }

    protected func asLambdaExpr() {
        (this as LambdaExpr).getOrThrow()
    }

    protected func asRefType() {
        (this as RefType).getOrThrow()
    }

    protected func asPrimitiveType() {
        (this as PrimitiveType).getOrThrow()
    }

    protected func asTrailingClosureExpr() {
        (this as TrailingClosureExpr).getOrThrow()
    }
}