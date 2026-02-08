/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import magic.core.rag.Retriever
import magic.core.model.EmbeddingModel

/**
 * SemanticSet is a special SemanticMap whose key and value are same.
 **/
public class SemanticSet<VDB, IMAP, T> where VDB <: VectorDatabase<VDB>,
                                             IMAP <: IndexMap<IMAP, T>,
                                             T <: ToString {
    private let semanticMap: SemanticMap<VDB, IMAP, T>

    public init(vectorDB!: VDB, indexMap!: IMAP, embeddingModel!: Option<EmbeddingModel> = None) {
        semanticMap = SemanticMap(vectorDB: vectorDB,
                           indexMap: indexMap,
                           embeddingModel: embeddingModel)
    }

    public mut prop embeddingModel: EmbeddingModel {
        get() { semanticMap.embeddingModel }
        set(v) { semanticMap.embeddingModel = v }
    }

    /**
     * Used by the load method
     */
    private init(semanticMap!: SemanticMap<VDB, IMAP, T>) {
        this.semanticMap = semanticMap
    }

    public func put(value: T): Unit {
        semanticMap.put(value.toString(), value)
    }

    public func search(query: String, number!: Int64 = 5, minDistance!: Float64 = 0.3): Array<T> {
        return semanticMap.search(query, number: number, minDistance: minDistance)
    }

    public func asRetriever(): Retriever {
        return SemanticMapRetriever(this.semanticMap)
    }

    public func save(dirPath: String): Unit {
        semanticMap.save(dirPath)
    }

    public static func load(dirPath: String): SemanticSet<VDB, IMAP, T> {
        let map = SemanticMap<VDB, IMAP, T>.load(dirPath)
        return SemanticSet(semanticMap: map)
    }
}