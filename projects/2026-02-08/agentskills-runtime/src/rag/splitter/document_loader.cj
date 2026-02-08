/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.rag.splitter

import magic.core.rag.Document
import magic.utils.readFile

import std.fs.Path
import std.io.StringReader
import std.collection.{ArrayList, HashMap}

public class DocumentLoader {
    public DocumentLoader(
        private let filePath: String
    ) { }

    public func load(): Array<Document> {
        let content = readFile(Path(this.filePath))
        let metadata = HashMap<String, String>([("source", filePath)])
        return [ Document(content, metadata: metadata) ]
    }

    public func loadSplit(splitter: Splitter): Array<Document> {
        let allDocs = ArrayList<Document>()
        for (doc in this.load()) {
            allDocs.add(all: splitter.split(doc.content))
        }
        return allDocs.toArray()
    }
}
