/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.storage.vdb

import magic.core.model.EmbeddingModel
import magic.core.rag.Document
import magic.storage.LocalStorage

public interface VectorStorage {
    prop embeddingModel: EmbeddingModel

    func query(query: String, topK: Int64, threshold!: Float64): Array<Document>

    func queryWithScore(query: String, topK: Int64, threshold!: Float64): Array<(Document, Float64)>

    func add(doc: Document): Unit
}

public interface LocalVectorStorage <: VectorStorage & LocalStorage {}