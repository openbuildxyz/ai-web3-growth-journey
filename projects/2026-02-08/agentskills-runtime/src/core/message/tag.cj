/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

import std.deriving.Derive
import std.regex.Regex

protected const OPEN_TAG_SYMBOL = '<'

protected const CLOSE_TAG_SYMBOL = '>'

@Derive[Equatable]
public enum Tag <: ToString {
    | Thought
    | Action
    | Observation
    | Answer
    | Info
    | Summary
    | Plan
    | Fail

    public prop name: String {
        get() {
            match (this) {
                case Thought => "thinking"
                case Action => "action"
                case Observation => "observation"
                case Answer => "answer"
                case Info => "info"
                case Summary => "summary"
                case Plan => "plan"
                case Fail => "fail"
            }
        }
    }

    private func getOpenTag(): String {
        return "${OPEN_TAG_SYMBOL}${this.name}${CLOSE_TAG_SYMBOL}"
    }

    private func getCloseTag(): String {
        return "${OPEN_TAG_SYMBOL}/${this.name}${CLOSE_TAG_SYMBOL}"
    }

    override public func toString(): String {
        return this.getOpenTag()
    }

    public static func fromTagName(str: String): Tag {
        for (tag in Tag.allTags) {
            if (str == tag.name) {
                return tag
            }
        }
        throw IllegalArgumentException("No tag found for name: ${str}")
    }

    public prop open: String {
        get() {
            return this.getOpenTag()
        }
    }

    public prop close: String {
        get() {
            return this.getCloseTag()
        }
    }

    protected static prop longestTagSize: Int {
        get() {
            return Tag.Observation.toString().size
        }
    }

    protected static prop allTags: Array<Tag> {
        get() {
            return [
                Tag.Thought,
                Tag.Action,
                Tag.Observation,
                Tag.Answer,
                Tag.Info,
                Tag.Summary,
                Tag.Plan,
                Tag.Fail
            ]
        }
    }

    /**
     * Extract tagged content from a string which is generate by LLMs
     */
    protected static func extract(str: String, tag: Tag): Option<String> {
        if (let Some(start) <- str.lastIndexOf(tag.open)) {
            let contentStart = start + tag.open.size
            // Case 1: the tag is well-formed, i.e., it has both the open tag and close tag
            if (let Some(end) <- str.indexOf(tag.close, contentStart)) {
                return str[contentStart..end].trimAscii()
            }
            // Case 2: it only has the open tag and is followed by another tag
            for (anotherTag in Tag.allTags) {
                if (let Some(end) <- str.indexOf(anotherTag.close, contentStart)) {
                    return str[contentStart..end].trimAscii()
                }
            }
            // Case 3: it only has the open tag
            // LLMs are prone to generate output without a close tag
            return str[contentStart..str.size].trimAscii()
        }
        return None
    }
}
