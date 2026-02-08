/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import std.math.*

public class Vector {
    public let vector: Array<Float64>
    // Expanding more parameters

    public init(vec: Array<Float64>) {
        this.vector = vec
    }

    func euclideanDistance(another: Vector) {
        var sum: Float64 = 0.0
        for(i in 0..this.vector.size){
            let diff: Float64 = this.vector[i] - another.vector[i]
            sum += diff * diff
        }
        return sqrt(sum)
    }

    protected func cosineSimilarity(another: Vector) {
        var dotProduct = 0.0
        var normVec1 = 0.0
        var normVec2 = 0.0
        for (i in 0..this.vector.size) {
            let a: Float64 = this.vector[i]
            let b: Float64 = another.vector[i]
            dotProduct += a * b
            normVec1 += pow(a, 2);
            normVec2 += pow(b, 2);
        }
        return abs(dotProduct / (sqrt(normVec1) * sqrt(normVec2)))
    }
}