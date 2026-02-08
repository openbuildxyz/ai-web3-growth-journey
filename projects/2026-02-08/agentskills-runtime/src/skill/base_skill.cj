/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.Skill
import magic.log.LogUtils
import std.collection.HashMap
import stdx.encoding.json.{JsonValue, JsonObject, JsonNull, JsonString}

/**
 * Concrete implementation of the Skill interface
 * Inherits from AbsSkill to maintain clear separation from Tool hierarchy
 */
open public class BaseSkill <: AbsSkill {
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
        super(
            name: name,
            description: description,
            license: license,
            compatibility: compatibility,
            metadata: metadata,
            allowedTools: allowedTools,
            instructions: instructions,
            skillPath: skillPath
        )
    }

    /**
     * Execute the skill with the given arguments
     */
    open public func execute(args: HashMap<String, JsonValue>): String {
        // Default implementation - should be overridden by specific skills
        let result = "Skill ${this.name} executed with arguments: ${args.toString()}"
        LogUtils.info("[BaseSkill.execute] Skill: ${this.name}, Result: ${result}")
        return result
    }
}