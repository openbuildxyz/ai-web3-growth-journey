/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.core.skill

import magic.core.tool.Toolset
import std.collection.ArrayList

/**
 * A collection of related skills, similar to the existing ToolSet concept
 * Implements the Toolset interface to maintain compatibility with existing framework
 */
public interface SkillSet <: Toolset {
    /**
     * Name of the skill set
     */
    prop name: String

    /**
     * Collection of skills in the set
     */
    prop skills: Array<Skill>

    /**
     * Description of the skill set
     */
    prop description: String

    /**
     * Add a skill to the set
     */
    func addSkill(skill: Skill): Unit

    /**
     * Remove a skill from the set
     */
    func removeSkill(skillName: String): Unit
}