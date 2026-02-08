/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.rag

import magic.core.rag.*
import magic.core.model.ChatModel

class SqliteRetriever <: Retriever {
    private let sqliteAgent: SqliteAgent
    private var _mode: RetrieverMode
    private let _description: String

    init(path: String, mode: RetrieverMode, description: String, model: ChatModel, table!: String) {
        sqliteAgent = SqliteAgent(path, table: table)
        sqliteAgent.model = model
        _mode = mode
        _description = description
    }

    override public prop description: String {
        get() { _description }
    }

    override public mut prop mode: RetrieverMode {
        get() { _mode }
        set(m) { _mode = m }
    }

    override public func search(query: String): Retrieval {
        return DocumentRetrieval(
            [Document(sqliteAgent.chat(query))]
        )
    }
}