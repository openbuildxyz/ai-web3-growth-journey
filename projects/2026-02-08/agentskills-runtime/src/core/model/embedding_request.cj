/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

public struct EmbeddingRequest {
    public let prompt: String
    public let dimensions: Option<Int64>

    public init(prompt: String, dimensions!: Option<Int> = None) {
        this.prompt = prompt
        this.dimensions = dimensions
    }
}
