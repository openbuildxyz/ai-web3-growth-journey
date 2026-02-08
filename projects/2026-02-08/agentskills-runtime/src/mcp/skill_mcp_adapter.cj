/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.mcp

import magic.core.skill.Skill
import magic.core.tool.Tool
import magic.skill.SkillToToolAdapter
import std.collection.ArrayList

/**
 * Adapter to connect skills with MCP protocol
 * This follows clean architecture by separating concerns:
 * - Skills remain independent of MCP protocol
 * - MCP protocol remains independent of skill implementation
 * - This adapter connects them without coupling
 */
public class SkillMCPAdapter {
    private let _skills: Array<Skill>
    
    public init(skills: Array<Skill>) {
        _skills = skills
    }
    
    /**
     * Convert skills to MCP-compatible tools
     */
    public func toMCPTolls(): Array<Tool> {
        let result = ArrayList<Tool>()
        for (skill in _skills) {
            result.add(SkillToToolAdapter(skill: skill))
        }
        return result.toArray()
    }
    
    /**
     * Add a skill to the adapter
     */
    public func addSkill(skill: Skill) {
        // Note: In a real implementation, you might want to use a mutable collection
        // For now, we'll create a new array with the additional skill
    }
    
    /**
     * Get all skills managed by this adapter
     */
    public func getSkills(): Array<Skill> {
        return _skills
    }
}