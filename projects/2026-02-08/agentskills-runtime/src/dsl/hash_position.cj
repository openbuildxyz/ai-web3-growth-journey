/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.Position

/**
 * Wrap `Position` as being hashable
 */
class HashPosition <: Hashable & Equatable<HashPosition> {
    public HashPosition(public let pos: Position) { }

    public func hashCode(): Int64 {
        return (Int64(pos.fileID) << 32) + (Int64(pos.line) << 16) + Int64(pos.column)
    }

    public operator func ==(r: HashPosition): Bool {
        return this.pos == r.pos
    }

    /** Returns true if and only if the two positions are not identical. */
    public operator func !=(r: HashPosition): Bool {
        return !(this == r)
    }
}