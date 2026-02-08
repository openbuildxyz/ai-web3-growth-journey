/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.rag

/**
 * The retriever can be used in two modes.
 */
public enum RetrieverMode {
    | Static // The retriever will be used to search related content before the agent answer the question
    | Dynamic // The retriever will be used during the agent solving the problem

    public operator func ==(other: RetrieverMode): Bool {
        match ((this, other)) {
            case (RetrieverMode.Static, RetrieverMode.Static) => true
            case (RetrieverMode.Dynamic, RetrieverMode.Dynamic) => true
            case _ => false
        }
    }
    public operator func !=(other: RetrieverMode): Bool {
        return !(this == other)
    }
}
