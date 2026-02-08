/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.core.skill

import std.collection.HashMap

/**
 * Additional metadata extracted from skill definition
 */
public class SkillMetadata {
    /**
     * Author of the skill (from metadata)
     */
    let author: Option<String>

    /**
     * Version of the skill (from metadata)
     */
    let version: Option<String>

    /**
     * Tags associated with the skill
     */
    let tags: Array<String>

    /**
     * Categories the skill belongs to
     */
    let categories: Array<String>

    /**
     * Additional arbitrary metadata
     */
    let extra: HashMap<String, String>

    public init(
        author: Option<String>,
        version: Option<String>,
        tags: Array<String>,
        categories: Array<String>,
        extra: HashMap<String, String>
    ) {
        this.author = author
        this.version = version
        this.tags = tags
        this.categories = categories
        this.extra = extra
    }
}