/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.parser

import magic.utils.{Color, Colorful}
import magic.core.message.Tag

/**
 * Visitor of a tag stream
 */
public abstract class TagStreamVisitor {
    private let parser: TagStreamParser

    public init(chunks: Iterator<String>) {
        this.parser = TagStreamParser(chunks)
    }

    protected func onOpen(tag: Tag): Unit

    protected func onClose(tag: Tag): Unit

    protected func onChunk(chunk: String): Unit

    private var _currTag: Tag = Tag.Fail
    protected prop currTag: Tag {
        get() {
            this._currTag
        }
    }

    public func start(): Unit {
        while (let Some(tag) <- this.parser.currTag) {
            _currTag = tag
            this.onOpen(tag)
            this.parser.removeTag(tag)
            while (let Some((content, isClosed)) <- this.parser.readContentUntilClosed(tag)) {
                this.onChunk(content)
                if (isClosed) { break }
            }
            this.onClose(tag)
        }
    }
}
