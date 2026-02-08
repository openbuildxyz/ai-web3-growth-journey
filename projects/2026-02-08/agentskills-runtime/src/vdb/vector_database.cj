/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import std.collection.ArrayList

class VectorDatabaseException <: Exception {
    init(msg: String) { super(msg) }
}

public struct SearchResult {
    public let index: Int64
    public let dist: Float64
    public init(index: Int64, dist: Float64) {
        this.index = index
        this.dist = dist
    }
}

public interface VectorDatabase<Self> {
    /**
     * Add the vector to the database
     * ATTENTION: index must start from 0
     */
    func addVector(vector: Vector): Unit

    /**
     * Query the database and find indexes of similar data
     */
    func search(queryVec: Vector, number!: Int64, minDistance!: Float64): Array<SearchResult>

    /**
     * Save to the file
     */
    func save(filePath: String): Unit

    /**
     * Load from the file
     */
    static func load(filePath: String): Self
}
