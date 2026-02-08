/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.rag

import magic.core.rag.*

/**
 * The wrapper of a retriever used when a retriever is set by the DSL.
 * like @agent[rag: {source: FooRetriever(), mode: "dynamic"}]
 */
class RetrieverWrapper <: Retriever {
    private let retriever: Retriever
    private var _mode: RetrieverMode
    private let _description: String

    init(retriever: Retriever, mode: Option<RetrieverMode>, description: Option<String>) {
        this.retriever = retriever
        _mode = mode ?? retriever.mode
        _description = description ?? retriever.description
    }

    override public prop description: String {
        get() { _description }
    }

    override public mut prop mode: RetrieverMode {
        get() { _mode }
        set(m) { _mode = m }
    }

    override public func search(query: String): Retrieval {
        return this.retriever.search(query)
    }
}