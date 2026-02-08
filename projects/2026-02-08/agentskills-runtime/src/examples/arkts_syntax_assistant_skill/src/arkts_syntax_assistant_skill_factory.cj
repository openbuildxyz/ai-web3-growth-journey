/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.arkts_syntax_assistant_skill.src

import magic.skill.application.SkillFactory
import magic.core.skill.Skill
import magic.skill.domain.models.SkillManifest
import magic.skill.domain.models.{SecurityPolicy, ResourceLimits}
import std.collection.HashMap
import stdx.encoding.json.JsonValue

/**
 * Factory for creating ArkTSSyntaxAssistantSkill instances
 * This allows the skill to be loaded from SKILL.md files using the progressive loading mechanism
 */
public class ArkTSSyntaxAssistantSkillFactory <: SkillFactory {
    private static let SKILL_NAME = "arkts-syntax-assistant"

    /**
     * Create a skill instance from the manifest
     */
    public func createSkill(manifest: SkillManifest): Option<Skill> {
        // Check if this manifest is for our skill
        if (manifest.name != SKILL_NAME) {
            return None
        }

        // Create and return the skill instance
        let skill = ArkTSSyntaxAssistantSkill(manifest)
        return Some(skill)
    }

    /**
     * Check if this factory can create a skill with the given name
     */
    public func canCreate(skillName: String): Bool {
        return skillName == SKILL_NAME
    }

    /**
     * Get the security policy for the skill
     */
    public func getSecurityPolicy(skillName: String): Option<SecurityPolicy> {
        // Return default security policy
        return Some(SecurityPolicy.default())
    }

    /**
     * Get the resource limits for the skill
     */
    public func getResourceLimits(skillName: String): Option<ResourceLimits> {
        // Return default resource limits
        return Some(ResourceLimits.default())
    }
}