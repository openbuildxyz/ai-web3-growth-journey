/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.{Skill, SkillManager}
import magic.core.tool.{Tool, ToolFilter, ToolManager}
import magic.tool.SimpleToolManager
import std.collection.{HashMap, ArrayList}

/**
 * Implementation of SkillManager that handles the lifecycle of skills
 * Implements the ToolManager interface to maintain compatibility with existing framework
 */
public class SimpleSkillManager {
    private var _availableSkills: HashMap<String, Skill>
    private var _enabledSkills: ArrayList<String>
    private let _toolManager: SimpleToolManager

    public init(skills: Collection<Skill>, enableFilter: Bool) {
        _availableSkills = HashMap<String, Skill>()
        _enabledSkills = ArrayList<String>()
        let skillTools = ArrayList<Tool>()
        for (currentSkill in skills) {
            // Use adapter to convert Skill to Tool
            skillTools.add(SkillToToolAdapter(skill: currentSkill))
        }
        _toolManager = SimpleToolManager(skillTools.toArray(), enableFilter: enableFilter)

        // Add initial skills to the available skills map
        for (skill in skills) {
            _availableSkills.add(skill.name, skill)
            _enabledSkills.add(skill.name)
        }
    }

    public init(skills: Collection<Skill>) {
        this(skills, false)  // default enableFilter to false
    }

    public init() {
        this([], false)  // default to empty skills list and false filter
    }

    public prop availableSkills: HashMap<String, Skill> {
        get() { _availableSkills }
    }

    public prop enabledSkills: Array<String> {
        get() { _enabledSkills.toArray() }
    }

    /**
     * Add a new skill to the manager
     */
    public func addSkill(skill: Skill): Unit {
        _availableSkills.add(skill.name, skill)
        _enabledSkills.add(skill.name)
        // Also add to the internal ToolManager using adapter
        _toolManager.addTool(SkillToToolAdapter(skill: skill))
    }

    /**
     * Remove a skill from the manager if it exists
     */
    public func delSkill(skill: Skill): Unit {
        _availableSkills.remove(skill.name)
        let newEnabledSkills = ArrayList<String>()
        for (name in _enabledSkills) {
            if (name != skill.name) {
                newEnabledSkills.add(name)
            }
        }
        _enabledSkills = newEnabledSkills
        // Also remove from the internal ToolManager using adapter
        _toolManager.delTool(SkillToToolAdapter(skill: skill))
    }

    /**
     * Remove a skill by name
     */
    public func removeSkill(skillName: String): Unit {
        if (let Some(skill) <- _availableSkills.get(skillName)) {
            _availableSkills.remove(skillName)
            let newEnabledSkills = ArrayList<String>()
            for (name in _enabledSkills) {
                if (name != skillName) {
                    newEnabledSkills.add(name)
                }
            }
            _enabledSkills = newEnabledSkills
            // Also remove from the internal ToolManager using adapter
            _toolManager.delTool(SkillToToolAdapter(skill: skill))
        }
    }

    /**
     * Enable a skill by name
     */
    public func enableSkill(skillName: String): Unit {
        if (!_enabledSkills.contains(skillName) && _availableSkills.contains(skillName)) {
            _enabledSkills.add(skillName)
        }
    }

    /**
     * Disable a skill by name
     */
    public func disableSkill(skillName: String): Unit {
        let newEnabledSkills = ArrayList<String>()
        for (name in _enabledSkills) {
            if (name != skillName) {
                newEnabledSkills.add(name)
            }
        }
        _enabledSkills = newEnabledSkills
    }

    /**
     * Get a skill by name
     */
    public func getSkill(skillName: String): Option<Skill> {
        return _availableSkills.get(skillName)
    }

    /**
     * Check if a skill is enabled
     */
    public func isSkillEnabled(skillName: String): Bool {
        return _enabledSkills.contains(skillName)
    }

    /**
     * Find a tool by name (from ToolManager interface)
     */
    public func findTool(name: String): Option<Tool> {
        // First check if it's a skill that's enabled
        if (let Some(skill) <- _availableSkills.get(name)) {
            if (_enabledSkills.contains(name)) {
                return Some(SkillToToolAdapter(skill: skill))
            }
        }
        // If not a skill or not enabled, delegate to the internal tool manager
        return _toolManager.findTool(name)
    }

    /**
     * Filter tools (from ToolManager interface)
     */
    public func filterTool(question: String, filter: ToolFilter): Array<Tool> {
        let allTools = _toolManager.tools
        // Create a set of enabled tool names manually
        let enabledToolNamesSet = HashMap<String, Bool>()
        for (name in _enabledSkills) {
            enabledToolNamesSet.add(name, true)
        }

        // Filter internal tools that are not skills (since skills are handled separately)
        let filteredInternalTools = ArrayList<Tool>()
        for (tool in allTools) {
            if (!enabledToolNamesSet.contains(tool.name)) {
                filteredInternalTools.add(tool)
            }
        }

        // Get enabled skills
        let enabledSkills = ArrayList<Tool>()
        for ((name, skill) in _availableSkills) {
            if (enabledToolNamesSet.contains(name)) {
                enabledSkills.add(SkillToToolAdapter(skill: skill))
            }
        }

        // Combine both arrays
        let result = ArrayList<Tool>()
        for (tool in filteredInternalTools) {
            result.add(tool)
        }
        for (skill in enabledSkills) {
            result.add(skill)
        }

        return result.toArray()
    }

    /**
     * Add a tool (from ToolManager interface)
     */
    public func addTool(tool: Tool): Unit {
        _toolManager.addTool(tool)
    }

    /**
     * Delete a tool (from ToolManager interface)
     */
    public func delTool(tool: Tool): Unit {
        _toolManager.delTool(tool)
    }

    /**
     * Add multiple tools (from ToolManager interface)
     */
    public func addTools(tools: Collection<Tool>): Unit {
        _toolManager.addTools(tools)
    }

    /**
     * Clear all tools (from ToolManager interface)
     */
    public func clear(): Unit {
        _toolManager.clear()
        _availableSkills.clear()
        _enabledSkills.clear()
    }

    /**
     * Get all tools (from ToolManager interface)
     */
    public prop tools: Array<Tool> {
        get() {
            let internalTools = _toolManager.tools
            let skillTools = ArrayList<Tool>()
            for ((_, skill) in _availableSkills) {
                skillTools.add(SkillToToolAdapter(skill: skill))
            }

            // Combine both arrays
            let result = ArrayList<Tool>()
            for (tool in internalTools) {
                result.add(tool)
            }
            for (tool in skillTools) {
                result.add(tool)
            }

            return result.toArray()
        }
    }

    /**
     * Check if filtering is enabled (from ToolManager interface)
     */
    public prop enableFilter: Bool {
        get() { _toolManager.enableFilter }
    }
}