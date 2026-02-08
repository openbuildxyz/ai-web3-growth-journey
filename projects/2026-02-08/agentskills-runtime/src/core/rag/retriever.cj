/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.rag

public interface Retriever {
    /**
     * Describe what the retriever will search.
     * Used under the dynamic mode.
     **/
    prop description: String

    mut prop mode: RetrieverMode

    func search(query: String): Retrieval
}