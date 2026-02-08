/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.rag.splitter

import magic.core.rag.Document
import magic.utils.*

import std.core.*
import std.sort.*
import std.collection.*

private func sortMarkDownHeaders(headers: Array<(String, String)>): Unit {
    headers.sortBy(stable: true) { a: (String, String), b: (String, String) =>
        if(a[0].size < b[0].size) {
            return Ordering.LT
        }
        if(a[0].size > b[0].size) {
            return Ordering.GT
        }
        return Ordering.EQ
    }
}

private struct Header {
    Header(
        let level: Int64,
        let name: String,
        let value: String
    ) {}
}

private let DEFAULT_HEADERS_TO_SPLIT = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
    ("####", "Header 4")
]

/**
 * Splitting markdown files based on specified headers.
 */
public class MarkdownSplitter <: Splitter {
    private let headersToSplit: Array<(String, String)>
    private let returnEachLine: Bool
    private let stripHeader: Bool

    /**
     * headersToSplit: Headers we want to track
     * returnEachLine: Return each line w/ associated headers
     * stripHeader: Strip split headers from the content of the chunk
     */
    public init(
        headersToSplit!: Array<(String, String)> = DEFAULT_HEADERS_TO_SPLIT,
        returnEachLine!: Bool = false,
        stripHeader!: Bool = true) {
        sortMarkDownHeaders(headersToSplit)
        this.headersToSplit = headersToSplit
        this.returnEachLine = returnEachLine
        this.stripHeader = stripHeader
    }

    private func checkHeaderLine(line: String): Option<(String, String)> {
        for ((headerMark, headerName) in this.headersToSplit) {
            if (line.startsWith("${headerMark} ")) {
                return (headerMark, headerName)
            }
        }
        return None
    }

    private func checkCodeLine(line: String): Option<String> {
        if (line.startsWith("```") && line.count("```") == 1) {
            return "```"
        } else if (line.startsWith("~~~") && line.count("~~~") == 1) {
            return "~~~"
        }
        return None
    }

    /**
     * Split markdown file
     * text: Markdown file
     */
    override public func split(text: String): Array<Document> {
        // Final output
        var linesWithMetadata = ArrayList<Document>()
        //Keep track of the nested header structure
        let headerStack = LinkedList<Header>()

        let buildCurrMetadata = { =>
            let map = HashMap<String, String>()
            for (header in headerStack) {
                map[header.name] = header.value
            }
            return map
        }

        let lines = text.split("\n")
        var lineNo = 0
        while (lineNo < lines.size) {
            let line = lines[lineNo]
            let strippedLine = line.trimAscii()
            // Case 1: Header
            if (let Some((headerMark, headerName)) <- checkHeaderLine(strippedLine)) {
                let currHeaderLevel = headerMark.count("#")
                while (let Some(last) <- headerStack.last) {
                    if (last.level >= currHeaderLevel) {
                        headerStack.removeLast()
                    } else {
                        break
                    }
                }
                // Push the current header to the stack
                let headerValue = strippedLine.removePrefix(headerMark).trimAscii()
                headerStack.addLast(Header(currHeaderLevel, headerName, headerValue))

                if (!this.stripHeader) {
                    linesWithMetadata.add(
                        Document(line, metadata: buildCurrMetadata())
                    )
                }
                lineNo += 1
                continue
            }
            // Case 2: code
            if (let Some(fence) <- checkCodeLine(strippedLine)) {
                let codeLines = ArrayList<String>()
                codeLines.add(line)
                var codeLineNo = lineNo + 1
                while (codeLineNo < lines.size &&
                       !lines[codeLineNo].trimAscii().startsWith(fence)) {
                    codeLines.add(lines[codeLineNo])
                    codeLineNo += 1
                }
                codeLines.add("```")
                linesWithMetadata.add(
                    Document(String.join(codeLines.toArray(), delimiter: "\n"),
                             metadata: buildCurrMetadata())
                )
                lineNo = codeLineNo + 1
                continue
            }
            // Case 3: others
            if (!strippedLine.isEmpty()) {
                linesWithMetadata.add(
                    Document(line, metadata: buildCurrMetadata())
                )
            }
            lineNo += 1
        }
        // linesWithMetadata has each line with associated header metadata
        // aggregate these into chunks based on common metadata
        if (!this.returnEachLine) {
            return this.mergeLines(linesWithMetadata)
        } else {
            return linesWithMetadata.toArray()
        }
    }

    private func mergeMetadata(metadata: HashMap<String, String>): String {
        let strBuilder = StringBuilder()
        let keys = ArrayList(metadata.keys())
        keys.sort()
        for (k in keys) {
            strBuilder.append("${k} ${metadata[k]};")
        }
        return strBuilder.toString()
    }

    /**
     * Merge lines with the same metadata
     * lines: Line of text associated header metadata
     */
    private func mergeLines(lines: ArrayList<Document>): Array<Document> {
        let mergedDocs = ArrayList<Document>()
        var currMetadata = lines[0].metadata
        var currContent = ArrayList<String>()
        for (line in lines) {
            if (mergeMetadata(currMetadata) == mergeMetadata(line.metadata)) {
                currContent.add(line.content)
            } else {
                mergedDocs.add(
                    Document(
                        String.join(currContent.toArray(), delimiter: "\n"),
                        metadata: currMetadata
                    )
                )
                currContent.clear()
                currMetadata = line.metadata
                currContent.add(line.content)
            }
        }
        mergedDocs.add(
            Document(
                String.join(currContent.toArray(), delimiter: "\n"),
                metadata: currMetadata
            )
        )
        return mergedDocs.toArray()
    }
}