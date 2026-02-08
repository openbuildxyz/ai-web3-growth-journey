/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.rag

import magic.core.rag.RetrieverException
import magic.utils.{fileExt, exists}

import std.collection.{map, collectArrayList, collectArray}
import std.fs.Path

enum RAGSource {
    | Sqlite(String)              // Path to Sqlite DB
    | SqliteTable(String, String) // Path to Sqlite DB, table name
    | Markdown(String)            // Path to markdown file
}

func parseRAGSource(source: String): RAGSource {
    let items = source.split(":") |> map { item: String => item.trimAscii() } |> collectArrayList
    if (items.isEmpty()) {
        throw RetrieverException("Invalid rag source")
    }
    let path = items[0]
    if (!exists(path)) {
        throw RetrieverException("File ${path} does not exist")
    }
    match (fileExt(Path(path))) {
        case "md" | "markdown" => return RAGSource.Markdown(path)
        case "db" | "sqlite" =>
            if (items.size == 1) {
                return RAGSource.Sqlite(path)
            } else if (items.size == 2) {
                let table = items[1]
                return RAGSource.SqliteTable(path, table)
            } else {
                throw RetrieverException("Invalid rag source for Sqlite `${source}`")
            }
        case _ => throw RetrieverException("Invalid rag source `${source}`")
    }
}
