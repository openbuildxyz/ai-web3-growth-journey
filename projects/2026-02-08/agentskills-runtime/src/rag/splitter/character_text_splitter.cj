/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.rag.splitter

import magic.core.rag.Document
import std.collection.*

public class CharacterTextSplitter <: AbsCharacterSplitter {
    public CharacterTextSplitter(
        private let separator!: String = "\n\n",
        private let chunkSize!: Int64 = 1024,
        private let chunkOverlap!: Int64 = 1024
    ) {
        super(chunkSize, chunkOverlap)
    }

    public override func split(text: String): Array<Document> {
        if (text.isEmpty()) {
            return []
        }
        if (text.size < this.chunkSize) {
            return [Document(text)]
        }
        let res: Iterator<String> = text.lazySplit(this.separator, this.chunkSize)
        let chunks = mergeSplit(res, this.separator)
        return chunks |> map {chunk => Document(chunk)}|> collectArray
    }
}
