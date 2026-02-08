/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.core.skill

import std.collection.HashMap
import stdx.encoding.json.JsonValue

/**
 * Represents an individual skill conforming to the agentskills standard
 * Independent of Tool interface to maintain clear separation of concerns
 */
public interface Skill {
    /**
     * Unique identifier for the skill (max 64 characters, lowercase, hyphens only)
     */
    prop name: String

    /**
     * Description of what the skill does and when to use it (max 1024 characters)
     */
    prop description: String

    /**
     * License information for the skill
     */
    prop license: Option<String>

    /**
     * Environment requirements for the skill
     */
    prop compatibility: Option<String>

    /**
     * Additional arbitrary metadata
     */
    prop metadata: HashMap<String, String>

    /**
     * Space-delimited list of pre-approved tools
     */
    prop allowedTools: Option<String>

    /**
     * Markdown content containing the skill instructions
     */
    prop instructions: String

    /**
     * File path to the skill's directory
     */
    prop skillPath: String

    /**
     * Execute the skill with the given arguments
     */
    func execute(args: HashMap<String, JsonValue>): String
}