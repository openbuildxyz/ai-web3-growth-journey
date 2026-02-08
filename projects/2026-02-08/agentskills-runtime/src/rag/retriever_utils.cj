/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.rag

import magic.core.*
import magic.config.Config

public struct RetrieverUtils {
    /**
     * Source should be: <sqlite-path>
     *                   <sqlite-path>:<table-name>
     *                   <markdown-path>
     */
    public static func createRetriever(agent: Agent,
                                       source: String,
                                       mode: Option<RetrieverMode>,
                                       description: Option<String>): Retriever {
        match (parseRAGSource(source)) {
            case RAGSource.Sqlite(path) =>
                return SqliteRetriever(
                    path,
                    mode ?? RetrieverMode.Static,
                    description ?? "Sqlite retriever to search content from the database",
                    agent.model,
                    table: "")
            case RAGSource.SqliteTable(path, table) =>
                return SqliteRetriever(
                    path,
                    mode ?? RetrieverMode.Static,
                    description ?? "Sqlite retriever to search content from the database",
                    agent.model,
                    table: table)
            case RAGSource.Markdown(path) =>
                let embModel = Config.defaultEmbeddingModel.getOrThrow({ => RetrieverException("Default embedding model is not set") })
                return MarkdownRetriever(
                    path,
                    mode ?? RetrieverMode.Static,
                    description ?? "Markdown retriever to search content from the markdown file",
                    embModel)
        }
    }

    public static func createRetriever(_agent: Agent,
                                       source: Retriever,
                                       mode: Option<RetrieverMode>,
                                       description: Option<String>): Retriever {
        return RetrieverWrapper(source, mode, description)
    }
}