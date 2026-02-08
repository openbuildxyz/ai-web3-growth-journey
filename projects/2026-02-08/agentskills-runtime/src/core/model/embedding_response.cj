/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

public struct EmbeddingResponse <: ToString {
    public let data: Array<Float64>
    public init(data: Array<Float64>) {
        this.data = data
    }

    override public func toString(): String {
        return "Embedding: ${data}"
    }
}
