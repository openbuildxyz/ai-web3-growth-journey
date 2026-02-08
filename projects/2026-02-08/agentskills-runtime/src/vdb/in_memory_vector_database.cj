/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import magic.log.LogUtils

import std.collection.ArrayList
@When[cjc_version < "1.0.0"]
import std.math.min

struct VectorWithIndex {
    VectorWithIndex(
        let index: Int64,
        let vector: Vector) { }
}

public class InMemoryVectorDatabase <: VectorDatabase<InMemoryVectorDatabase> {
    let vectorBuffer = ArrayList<VectorWithIndex>()

    public func setVector(index: Int64, vector: Vector): Unit {
        vectorBuffer[index] = VectorWithIndex(index, vector)
    }

    public override func addVector(vector: Vector): Unit {
        let index = vectorBuffer.size
        vectorBuffer.add(VectorWithIndex(index, vector))
        // return index
    }

    /*
     *  query: the query string
     *  number: number of most similar vectors to be returned
     */
    public override func search(queryVec: Vector, number!: Int64 = 5, minDistance!: Float64 = 0.6): Array<SearchResult> {
        if (vectorBuffer.isEmpty()) {
            LogUtils.info("Vector buffer is empty")
            return []
        }
        let tempList = vectorBuffer.clone()
        tempList.sortBy(stable: true) {
            a: VectorWithIndex, b: VectorWithIndex =>
            if (a.vector.cosineSimilarity(queryVec) > b.vector.cosineSimilarity(queryVec)) {
                return Ordering.LT
            }
            if (a.vector.cosineSimilarity(queryVec) < b.vector.cosineSimilarity(queryVec)) {
                return Ordering.GT
            }
            return Ordering.EQ
        }
        let result = ArrayList<SearchResult>()
        for (i in 0..min(number, tempList.size)) {
            let dist = tempList[i].vector.cosineSimilarity(queryVec)
            if (dist < minDistance) {
                break
            }
            LogUtils.debug("Query distance: ${dist}")
            result.add(SearchResult(tempList[i].index, dist))
        }
        return result.toArray()
    }

    public override func save(filePath: String): Unit {
        throw UnsupportedException()
    }

    public static redef func load(filePath: String): InMemoryVectorDatabase {
        throw UnsupportedException()
    }
}