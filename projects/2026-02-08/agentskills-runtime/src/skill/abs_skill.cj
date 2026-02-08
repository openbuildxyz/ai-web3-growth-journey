/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.Skill
import std.collection.HashMap
import stdx.encoding.json.{JsonValue, JsonObject, JsonNull, JsonString}

/**
 * Abstract base implementation of the Skill interface
 * Provides common functionality for all skills without inheriting from Tool
 */
open public class AbsSkill <: Skill {
    private let _name: String
    private let _description: String
    private let _license: Option<String>
    private let _compatibility: Option<String>
    private let _metadata: HashMap<String, String>
    private let _allowedTools: Option<String>
    private let _instructions: String
    private let _skillPath: String

    public init(
        name!: String,
        description!: String,
        license!: Option<String>,
        compatibility!: Option<String>,
        metadata!: HashMap<String, String>,
        allowedTools!: Option<String>,
        instructions!: String,
        skillPath!: String
    ) {
        _name = name
        _description = description
        _license = license
        _compatibility = compatibility
        _metadata = metadata
        _allowedTools = allowedTools
        _instructions = instructions
        _skillPath = skillPath
    }

    public prop name: String {
        get() { _name }
    }

    public prop description: String {
        get() { _description }
    }

    public prop license: Option<String> {
        get() { _license }
    }

    public prop compatibility: Option<String> {
        get() { _compatibility }
    }

    public prop metadata: HashMap<String, String> {
        get() { _metadata }
    }

    public prop allowedTools: Option<String> {
        get() { _allowedTools }
    }

    public prop instructions: String {
        get() { _instructions }
    }

    public prop skillPath: String {
        get() { _skillPath }
    }

    /**
     * Execute the skill with the given arguments
     */
    open public func execute(args: HashMap<String, JsonValue>): String {
        // Default implementation - should be overridden by specific skills
        return "Skill ${_name} executed with arguments: ${args.toString()}"
    }
}