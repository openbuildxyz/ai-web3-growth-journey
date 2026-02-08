/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.core.skill

import std.collection.HashMap

/**
 * Manages the lifecycle of skills, similar to ToolManager
 * Independent interface to maintain clear separation from Tool management
 */
public interface SkillManager {
    /**
     * Map of skill names to skill objects
     */
    prop availableSkills: HashMap<String, Skill>

    /**
     * List of currently enabled skill names
     */
    prop enabledSkills: Array<String>

    /**
     * Add a new skill to the manager
     */
    func addSkill(skill: Skill): Unit

    /**
     * Remove a skill from the manager if it exists
     */
    func delSkill(skill: Skill): Unit

    /**
     * Remove a skill by name
     */
    func removeSkill(skillName: String): Unit

    /**
     * Enable a skill by name
     */
    func enableSkill(skillName: String): Unit

    /**
     * Disable a skill by name
     */
    func disableSkill(skillName: String): Unit

    /**
     * Get a skill by name
     */
    func getSkill(skillName: String): Option<Skill>

    /**
     * Check if a skill is enabled
     */
    func isSkillEnabled(skillName: String): Bool
}