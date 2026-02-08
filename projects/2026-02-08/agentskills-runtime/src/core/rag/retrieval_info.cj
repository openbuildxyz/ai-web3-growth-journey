/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.rag

/**
 * Result of the retriever
 */
public struct RetrievalInfo {
    public RetrievalInfo(
        public let query: String,
        public let retrieval: Retrieval) { }
}