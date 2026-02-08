/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.parser

import magic.log.LogUtils
import magic.core.message.{Tag, WithTag, OPEN_TAG_SYMBOL, CLOSE_TAG_SYMBOL}

import std.collection.ArrayList
import std.regex.Regex

/**
 * Parsing a sequence of tagged content
 * Each tagged content is of form [tag] ... [/tag]
 * ATTENTION: the tag name must be of less than 20 letters!
 */
protected class TagStreamParser {
    private static const MAX_TAG_NAME_SIZE = 20

    protected TagStreamParser(
        /**
         * Data chunks of the tag sequence
        */
        private let chunks: Iterator<String>,
        /**
        * Callback function used to print internal messages
        */
        protected var onChunkFn!: Option<(String) -> Unit> = None
    ) { }

    private var finished = false

    /**
     * Save content has been read
     */
    private let buffer = StringBuilder()

    /**
     * Read a chunk to the buffer
     */
    private func readChunk(): Bool {
        if (let Some(chunk) <- this.chunks.next()) {
            buffer.append(chunk)
            if (let Some(fn) <- this.onChunkFn) {
                fn(chunk)
            }
            return true
        }
        return false
    }

    /**
     * Read all chunks to the buffer
     */
    private func readAllChunk(): Unit {
        for (chunk in this.chunks) {
            buffer.append(chunk)
        }
    }

    protected func resetBuffer(content: String): Unit {
        this.buffer.reset()
        this.buffer.append(content)
    }

    protected prop currContent: String {
        get() {
            buffer.toString()
        }
    }

    protected prop currTag: Option<Tag> {
        get() {
            while (this.currContent.trimAscii().size < Tag.longestTagSize) {
                if (!this.readChunk()) { break }
            }
            // Check whether the current content starts with a tag
            let content = this.currContent.trimAscii()
            for (tag in Tag.allTags) {
                if (content.startsWithTag(tag)) {
                    return tag
                }
            }
            if (!content.isEmpty()) {
                throw ParserException("Fail to peek tag. Invalid content: `${this.currContent}`")
            }
            return None
        }
    }

    protected func readTagAndContent(tag: Tag): String {
        let strBuilder = StringBuilder()
        while (let Some((content, isClosed)) <- this.readContentUntilClosed(tag)) {
            strBuilder.append(content)
            if (isClosed) { break }
        }
        let content = strBuilder.toString().trimTag(tag)
        return content.withTag(tag)
    }

    protected func removeTag(tag: Tag): Unit {
        this.resetBuffer(this.currContent.trimAsciiStart().trimTag(tag))
    }

    /**
     * Return part content and whether the close tag is read
     */
    protected func readContentUntilClosed(tag: Tag): Option<(String, Bool)> {
        if (finished) {
            if (this.readChunk()) {
                LogUtils.debug("Tag stream is finished but the stream is not finished")
            }
            return None
        }
        // Read a chunk
        let exhausted = !this.readChunk()
        let (left, closeTag, right) = this.splitByCloseTag(tag)
        if (exhausted) {
            if (tag == Tag.Answer) {
                // Case 1: The answer tag is special, we always treat the stream is over
                finished = true
                this.resetBuffer("")
            } else if (right.trimAscii().isEmpty()) {
                // Case 2: If the rest is empty, we can consider the tag is closed
                finished = true
                this.resetBuffer("")
            } else if (closeTag.isNone()) {
                // Case 3: If the rest is not empty and does not contain the close tag
                throw ParserException("Fail to read async react ${tag} content. Rest: `${right}`")
            } else { // Otherwise
                this.resetBuffer(right)
            }
            return (left.trimAsciiEnd(), true)
        } else {
            // If the rest starts with the complete close tag, remove it
            this.resetBuffer(right)
            if (closeTag.isSome()) {
                return (left.trimAsciiEnd(), true)
            } else {
                return (left, false)
            }
        }
    }

    private func splitByCloseTag(tag: Tag): (String, ?String, String) {
        let tagName = tag.name
        let content = this.currContent
        // The current content contains the full close tag
        let regex = Regex("\\${OPEN_TAG_SYMBOL}\\s*/\\s*${tagName}\\s*\\${CLOSE_TAG_SYMBOL}")
        if (let Some(md) <- regex.find(content)) {
            let pos = md.matchPosition()
            let left = content[..pos.start]
            let right = content[pos.end..]
            return (left, tag.close, right)
        }

        // Check whether the content ends with a prefix of the close tag
        let regexToCheck = ArrayList<Regex>()
        for (index in tagName.size..=1 : -1) {
            let prefix = tagName[0..index]
            regexToCheck.add(Regex("\\${OPEN_TAG_SYMBOL}\\s*/\\s*${prefix}\\s*$"))
        }
        // Add the regex to check the prefix symbols of closed tags
        regexToCheck.add(Regex("\\${OPEN_TAG_SYMBOL}\\s*/?\\s*$"))

        for (regex in regexToCheck) {
            if (let Some(md) <- regex.find(content)) {
                let pos = md.matchPosition()
                let pivot = pos.start
                return (content[0..pivot], None, content[pivot..])
            }
        }
        return (content, None, "")
    }
}
