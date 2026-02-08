/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.rag

public class RetrieverException <: Exception {
    public init(msg: String) {
        super(msg)
    }
}