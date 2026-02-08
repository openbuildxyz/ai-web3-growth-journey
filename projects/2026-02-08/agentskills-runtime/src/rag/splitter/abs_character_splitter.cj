/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.rag.splitter

import std.collection.*

public abstract class AbsCharacterSplitter <: Splitter {
    let _chunk_size: Int64
    let _chunk_overlap: Int64
    public init(chunkSize: Int64, chunkOverlap: Int64) {
        if (chunkOverlap > chunkSize) {
            throw Exception("Chunk overlap must be less than or equal to chunk size")
        }
        this._chunk_size = chunkSize
        this._chunk_overlap = chunkOverlap
    }

    protected func textSize(text: String): Int64 {
        return text.toRuneArray().size
    }

    protected func mergeSplit(splits: Iterator<String>, separator: String): Array<String> {
        var separatorSize = textSize(separator)
        let chunks = ArrayList<String>()

        let currChunk: LinkedList<String> = LinkedList()
        var total = 0
        for (split in splits) {
            let len = textSize(split)
            var separatorSizeToAdd = 0
            if (currChunk.size > 0) {
                separatorSizeToAdd = separatorSize
            }
            if (total + len + separatorSizeToAdd > this._chunk_size) {
                if (total > this._chunk_size) {
                    // TODO: warning
                }
                let chunk = String.join(currChunk.toArray(), delimiter: separator).trimAscii()
                if (!chunk.isEmpty()) {
                    chunks.add(chunk)
                }

                while ((total > this._chunk_overlap) || ((total + len + separatorSizeToAdd) > this._chunk_size &&
                        total > 0)) {
                    let firstChunk = currChunk.removeFirst()
                    separatorSizeToAdd = 0
                    if (currChunk.size > 0) {
                        separatorSizeToAdd = separatorSize
                    }
                    match (firstChunk) {
                        case Some(value) => total -= textSize(value) + separatorSizeToAdd
                        case None => break
                    }
                }
            }
            currChunk.addLast(split)
            total += len + separatorSizeToAdd
        }
        let chunk = String.join(currChunk.toArray(), delimiter: separator).trimAscii()
        if (!chunk.isEmpty()) {
            chunks.add(chunk)
        }
        return chunks.toArray()
    }
}
