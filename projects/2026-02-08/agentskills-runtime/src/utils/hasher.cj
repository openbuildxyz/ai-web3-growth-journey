/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */

package magic.utils

protected class ObjectHasher {
    private var res: Int64 = 0
    public init(res!: Int64 = 0) {
        this.res = res
    }
    public func finish(): Int64 {
        return res
    }

    public func reset(): Unit {
        res = 0
    }

    public func write(value: Hashable): Unit {
        res = hashCombine(res, value.hashCode())
    }
    /*
     * widely-used hash algorithm combining two numbers from C++ boost:
     * seed ^= hasher(v) + 0x9e3779b9 + (seed<<6) + (seed>>2)
     */
    @OverflowWrapping
    private func hashCombine(seed: Int64, hashV: Int64): Int64 {
        let a: Int64 = -7046029254386353131 // 0x9e3779b97f4a7c15
        return seed ^ (hashV + a + (seed << 6) + (seed >> 2))
    }
}
