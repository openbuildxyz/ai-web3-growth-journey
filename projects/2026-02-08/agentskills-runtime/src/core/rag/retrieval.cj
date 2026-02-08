/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.rag

import magic.prompt.ToPrompt

/**
 * Result of the retriever
 */
public interface Retrieval <: ToPrompt {
    prop sources: Array<Document>
}