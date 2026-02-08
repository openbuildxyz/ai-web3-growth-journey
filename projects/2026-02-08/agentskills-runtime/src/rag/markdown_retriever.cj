/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.rag

import magic.core.rag.*
import magic.core.model.EmbeddingModel
import magic.rag.splitter.{DocumentLoader, MarkdownSplitter}
import magic.vdb.{InMemoryVectorDatabase, JsonlIndexMap, SemanticMap}
import magic.log.LogUtils

import std.collection.{map, collectArray}

private type SimpleMarkdownSemanticMap = SemanticMap<InMemoryVectorDatabase, JsonlIndexMap<Document>, Document>

private func buildMarkdownSemanticMap(path: String, embModel: EmbeddingModel): SimpleMarkdownSemanticMap {
    // Load and split the document
    let loader = DocumentLoader(path)
    let splitter = MarkdownSplitter(returnEachLine: false)
    let docs = loader.loadSplit(splitter)
    // Initialize the semantic map
    let smap = SimpleMarkdownSemanticMap(vectorDB: InMemoryVectorDatabase(),
                                         indexMap: JsonlIndexMap<Document>(),
                                         embeddingModel: embModel)
    // Add all document
    for (doc in docs) {
        LogUtils.info("MarkdownRetriever", doc.toString())
        LogUtils.info("-----------------------------------")
        smap.put(doc.content, doc)
    }
    return smap
}

class MarkdownRetriever <: Retriever {
    private var _mode: RetrieverMode
    private let _description: String
    private let semanticMap: SimpleMarkdownSemanticMap

    init(path: String, mode: RetrieverMode, description: String, embModel: EmbeddingModel) {
        this._mode = mode
        this._description = description
        this.semanticMap = buildMarkdownSemanticMap(path, embModel)
    }

    override public prop description: String {
        get() { _description }
    }

    override public mut prop mode: RetrieverMode {
        get() { _mode }
        set(m) { _mode = m }
    }

    override public func search(query: String): Retrieval {
        let retrieval = DocumentRetrieval(
            this.semanticMap.search(query, number: 5)
        )
        LogUtils.info("MarkdownRetriever", "Found ${retrieval.toPrompt()}")
        return retrieval
    }
}