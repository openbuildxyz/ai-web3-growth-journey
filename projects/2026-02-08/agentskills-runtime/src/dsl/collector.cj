/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*
import std.collection.{HashSet, ArrayList}

class IndependentStringCollector <: Visitor {
    public let indepStringLiteralPositions = HashSet<HashPosition>()

    override public func visit(funcDecl: FuncDecl): Unit {
        collect(funcDecl.block)
    }

    override public func visit(block: Block): Unit {
        collect(block.nodes)
    }

    override public func visit(expr: DoWhileExpr): Unit {
        collect(expr.block)
    }

    override public func visit(expr: ForInExpr) {
        collect(expr.block)
    }

    override public func visit(expr: LambdaExpr) {
        collect(expr.nodes)
    }

    override public func visit(expr: IfExpr) {
        collect(expr.ifBlock)
        // expr.elseExpr will be visited recursively
    }

    override public func visit(expr: WhileExpr) {
        collect(expr.block)
    }

    override public func visit(expr: SpawnExpr) {
        eprintln("Spawn is disallowed")
        breakTraverse()
    }

    override public func visit(expr: SynchronizedExpr) {
        eprintln("Synchronized is disallowed")
        breakTraverse()
    }

    func collect(block: Block): Unit {
        collect(block.nodes)
    }

    /**
     * Collect independent string literals in a scope
     */
    func collect(nodes: ArrayList<Node>): Unit {
        // Traverse all items in a scope
        for (node in nodes) {
            // Independent strings are top-level literal expressions in a scope
            if (node.isExpr()) {
                let expr = node.asExpr()
                if (expr.isLitConstExpr()) {
                    let litExpr = expr.asLitConstExpr()
                    let token = litExpr.literal
                    match (token.kind) {
                        case TokenKind.STRING_LITERAL | TokenKind.MULTILINE_STRING =>
                            indepStringLiteralPositions.add(HashPosition(token.pos))
                        case _ => ()
                    }
                }
            }
        }
    }

    /**
     * Check whether the token is an independent string literal
     */
    func isIndependentStringLiteral(token: Token): Bool {
        match (token.kind) {
            case TokenKind.STRING_LITERAL | TokenKind.MULTILINE_STRING =>
                return indepStringLiteralPositions.contains(HashPosition(token.pos))
            case _ => return false
        }
    }
}

/**
 * Collect positions of independent string literals
 */
func collectIndependentStringLiteral(node: Node): IndependentStringCollector {
    let collector = IndependentStringCollector()
    node.traverse(collector)
    return collector
}
