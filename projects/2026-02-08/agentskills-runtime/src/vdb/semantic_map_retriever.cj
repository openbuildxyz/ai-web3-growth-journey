/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import magic.prompt.ToPrompt
import magic.core.rag.*
import std.collection.{map, collectArray}

class SemanticMapRetriever<VDB, IMAP, T> <: Retriever where VDB <: VectorDatabase<VDB>,
                                            IMAP <: IndexMap<IMAP, T>,
                                            T <: ToPrompt {
    private let semanticMap: SemanticMap<VDB, IMAP, T>
    private var _mode = RetrieverMode.Static
    private let number = 5

    init(semanticMap: SemanticMap<VDB, IMAP, T>) {
        this.semanticMap = semanticMap
    }

    public prop description: String {
        get() { "" }
    }

    override public mut prop mode: RetrieverMode {
        get() { _mode }
        set(m) { _mode = m }
    }

    public func search(query: String): Retrieval {
        return DocumentRetrieval(
            semanticMap.search(query, number: number) |>
                map { value: T => Document(value.toPrompt()) } |>
                collectArray
        )
    }
}
