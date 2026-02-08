/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src

import magic.skill.application.SkillFactory
import magic.core.skill.Skill
import magic.skill.domain.models.SkillManifest
import magic.skill.domain.models.{SecurityPolicy, ResourceLimits}
import std.collection.HashMap
import stdx.encoding.json.JsonValue

/**
 * Factory for creating UctooAPISkill instances.
 * This factory is registered with the SkillRegistry to enable
 * progressive loading of UctooAPISkill from SKILL.md files.
 */
public class UctooAPISkillFactory <: SkillFactory {
    /**
     * The skill name that this factory can create
     */
    private static let SKILL_NAME = "uctoo-api-skill"

    /**
     * Create a UctooAPISkill instance from the manifest
     */
    public func createSkill(manifest: SkillManifest): Option<Skill> {
        // Validate that this is the correct skill type
        if (manifest.name != SKILL_NAME) {
            return None
        }

        // Create and return the skill instance
        let skill = UctooAPISkill(manifest)
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
