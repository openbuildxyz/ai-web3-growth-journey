/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.api

import magic.core.skill.{Skill, SkillManager}
import std.collection.HashMap
import stdx.encoding.json.JsonValue

/**
 * Request object for skill registration
 */
public class SkillRegistrationRequest {
    let skillPath: String
    let enabled: Bool

    public init(skillPath: String, enabled: Bool) {
        this.skillPath = skillPath
        this.enabled = enabled
    }

    public init(skillPath: String) {
        this.skillPath = skillPath
        this.enabled = true  // default value
    }
}

/**
 * Service for handling skill registration API endpoint
 */
public class SkillRegistrationService {
    /**
     * Register a new skill from a SKILL.md file or skill directory
     */
    public func registerSkill(request: SkillRegistrationRequest, skill: Skill): Option<Skill> {
        // In a real implementation, we would register the skill
        // For now, we just return the skill
        return Some(skill)
    }

    /**
     * Register a new skill with skill manager
     */
    public func registerSkillWithManager(request: SkillRegistrationRequest, skill: Skill, skillManager: SkillManager): Option<Skill> {
        skillManager.addSkill(skill)
        return Some(skill)
    }
}