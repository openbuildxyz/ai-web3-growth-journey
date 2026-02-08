/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.rag

import magic.prompt.ToPrompt
import std.collection.{map, collectArray}

/**
 * The commonly used retrieval result structure is an array of documents
 */
protected class DocumentRetrieval <: Retrieval {
    protected DocumentRetrieval(
        private let docs: Array<Document>) { }

    override public prop sources: Array<Document> {
        get() { this.docs }
    }

    override public func toPrompt(): String {
        return String.join(
            this.docs |> map { doc: Document => doc.content } |> collectArray,
            delimiter: "\n"
        )
    }
}