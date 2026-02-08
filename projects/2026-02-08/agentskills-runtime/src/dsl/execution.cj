/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*
import std.collection.{ArrayList, HashMap}

class ExecutionAttr <: Attr {
    init() { super(AttrMap()) }

    init(map: AttrMap) { super(map) }

    static func parse(attrTokens: Tokens): ExecutionAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "execution",
            validKeys: ["dump"],
        )
        return ExecutionAttr(map)
    }
}

public macro execution(input: Tokens): Tokens {
    assertParentContext("agent")
    setItem("defineExecution", true)
    let executionAttr = ExecutionAttr()
    return transformExecution(input, executionAttr)
}

public macro execution(attr: Tokens, input: Tokens): Tokens {
    assertParentContext("agent")
    setItem("defineExecution", true)
    let executionAttr = ExecutionAttr.parse(attr)
    let content = transformExecution(input, executionAttr)
    if (executionAttr.dump) {
        printTokens(content)
    }
    return content
}

private enum ExecutionOpKind {
    | Normal
    | Nested(Int64) // The position of the argument, which is nested operations
    | Special
}

// Whether the execution operations contains nested operations, like loop(think |> action)
private let EXECUTION_OPS = HashMap<String, ExecutionOpKind>(
    ("loop", Nested(0)),
    ("each", Nested(0)),
    ("think", Normal),
    ("action", Normal),
    ("plan", Normal),
    ("divide", Normal),
    ("summary", Normal),
    ("answer", Normal),
    ("done", Normal),
    ("tool", Normal),
    ("switch", Normal),
    ("onCase", Nested(1)),
    ("otherwise", Nested(0)),
    ("ExecutionState", Special)
)

private func isExecutionOp(token: Token): Bool {
    if (token.kind != TokenKind.IDENTIFIER) {
        return false
    } else if (!EXECUTION_OPS.contains(token.value)) {
        return false
    } else if (let ExecutionOpKind.Special <- EXECUTION_OPS[token.value]) {
        return false
    } else {
        return true
    }
}

private func transformExecution(input: Tokens, executionAttr: ExecutionAttr): Tokens {
    let funcTokens = quote(
        override public func __customized_execution_func__(state: Object): Option<Object> {
            return ((state as ExecutionState) ?? ExecutionState()) |> $input
        }
    )
    let funcDecl = match(parseDecl(funcTokens) as FuncDecl) {
        case Some(decl) => decl
        case None => throw DslException("Expected FuncDecl")
    }
    let tokens = doTransform(funcDecl)
    // Rename all execution operation functions
    let result = Tokens()
    for (token in tokens) {
        // Add a prefix "ExecutionOpSet." for each operation function
        if (isExecutionOp(token)) {
            result.append(newIdentifierToken("ExecutionOpSet"))
            result.append(Token(TokenKind.DOT))
        }
        result.append(token)
    }
    return result
}

//-------------------------------------------------------------

private class Transformer <: Visitor {
    override public func visit(callExpr: CallExpr): Unit {
        let fnName = ((callExpr.callFunc as RefExpr)?.identifier)?.value ?? "unknown"
        if (!EXECUTION_OPS.contains(fnName)) {
            throw DslException("Unsupported execution operation ${fnName}")
        }
        if (let ExecutionOpKind.Nested(idx) <- EXECUTION_OPS[fnName]) {  // Functions that accept a lambda
            let arg = callExpr.arguments[idx].expr
            callExpr.arguments[idx].expr = LambdaExpr(quote(
                { state => state |> $arg }
            ))
        } else if (fnName == "tool") {
            // The tool operation has the format of `tool(a |> b |> c)`
            let toolIds = ArrayList<Token>()
            for (token in callExpr.arguments[0].expr.toTokens()) {
                if (token.kind == TokenKind.IDENTIFIER) {
                    toolIds.add(token)
                } else if (token.kind != TokenKind.PIPELINE) {
                    throw DslException("Invalid token ${token.value} in the execution tool operation.")
                }
            }
            if (toolIds.isEmpty()) {
                throw DslException("No tool ids are provided in the execution tool operation.")
            }
            callExpr.arguments[0].expr = ArrayLiteral(quote([$(joinTokens(toolIds, Token(TokenKind.COMMA)))]))
            breakTraverse()
        }
    }
}

private func doTransform(node: Node): Tokens {
    let transformer = Transformer()
    node.traverse(transformer)
    return node.toTokens()
}