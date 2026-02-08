/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

import std.regex.Regex

protected interface WithTag {
    func withTag(tag: Tag): String
    func withoutTag(tag: Tag): String
    func withoutTag(): String
    func startsWithTag(tag: Tag): Bool
    func endsWithTag(tag: Tag): Bool
    func trimTag(tag: Tag): String
}

/**
 * Add auxiliary methods to wrap strings with react tags.
 */
extend String <: WithTag {
    /**
     * Wrap the string with the specified tag if necessary
     */
    public func withTag(tag: Tag): String {
        let content = this.trimAscii()
        if (!content.startsWithTag(tag)) {
            return "${tag.open} ${content} ${tag.close}"
        } else {
            if (content.endsWithTag(tag)) {
                return content
            } else {
                return "${content} ${tag.close}"
            }
        }
    }

    /**
     * Remove the specified tag from the string if necessary
     */
    public func withoutTag(tag: Tag): String {
        var content = this.trimAscii()
        content = content.removePrefix(tag.open)
        content = content.removeSuffix(tag.close)
        return content.trimAscii()
    }

    public func withoutTag(): String {
        var content = this.trimAscii()
        for (tag in Tag.allTags) {
            if (content.startsWithTag(tag)) {
                return content.withoutTag(tag)
            }
        }
        return this
    }

    public func startsWithTag(tag: Tag): Bool {
        let tagName = tag.name
        let regex = Regex("^\\s*\\${OPEN_TAG_SYMBOL}\\s*${tagName}\\s*\\${CLOSE_TAG_SYMBOL}")
        return regex.find(this).isSome()
    }

    public func endsWithTag(tag: Tag): Bool {
        let tagName = tag.name
        let regex = Regex("\\${OPEN_TAG_SYMBOL}/\\s*${tagName}\\s*\\${CLOSE_TAG_SYMBOL}\\s*$")
        return regex.find(this).isSome()
    }

    public func trimTag(tag: Tag): String {
        let tagName = tag.name
        let regex = Regex("^\\s*\\${OPEN_TAG_SYMBOL}\\s*${tagName}\\s*\\${CLOSE_TAG_SYMBOL}")
        if (let Some(md) <- regex.find(this)) {
            let pos = md.matchPosition()
            return this[pos.end..]
        } else {
            return this
        }
    }
}
