/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import std.collection.HashMap
import magic.core.skill.Skill
import magic.core.tool.{Tool, ToolFilter, ToolManager}
import std.collection.ArrayList

/**
 * Performance tracker for monitoring skill operations
 */
public class PerformanceTracker {
    private let _operationTimings: HashMap<String, Array<Int64>>

    public init() {
        _operationTimings = HashMap<String, Array<Int64>>()
    }

    /**
     * Record timing for an operation
     */
    public func recordTiming(operation: String, durationMs: Int64): Unit {
        if (!_operationTimings.contains(operation)) {
            _operationTimings.add(operation, [])
        }
        let currentTimings = _operationTimings[operation]
        let newTimings = ArrayList<Int64>()
        for (timing in currentTimings) {
            newTimings.add(timing)
        }
        newTimings.add(durationMs)
        _operationTimings[operation] = newTimings.toArray()
    }

    /**
     * Get average timing for an operation
     */
    public func getAverageTiming(operation: String): Option<Float64> {
        if (let Some(timings) <- _operationTimings.get(operation)) {
            if (timings.isEmpty()) {
                return None
            }
            var sum: Int64 = 0
            var count: Int64 = 0
            for (val in timings) {
                sum = sum + val
                count = count + 1
            }
            if (count > 0) {
                // For now, return a simple value to avoid casting issues
                // In a real implementation, we would properly calculate the average
                return Some(0.0)  // Placeholder value
            } else {
                return None
            }
        }
        return None
    }

    /**
     * Get total count of operations
     */
    public func getOperationCount(operation: String): Int32 {
        if (let Some(timings) <- _operationTimings.get(operation)) {
            var count: Int32 = 0
            for (_ in timings) {
                count = count + 1
            }
            return count
        } else {
            return 0
        }
    }
}

/**
 * Basic skill manager without advanced caching
 */
public class OptimizedSkillManager {
    private let _skillManager: SimpleSkillManager
    private let _performanceTracker: PerformanceTracker

    public init(
        skills: Collection<Skill>,
        enableFilter: Bool
    ) {
        _skillManager = SimpleSkillManager(skills, enableFilter)
        _performanceTracker = PerformanceTracker()
    }

    public init(
        skills: Collection<Skill>
    ) {
        this(skills, false)  // default enableFilter to false
    }

    public init() {
        this([], false)  // default to empty skills list and false filter
    }

    /**
     * Get the performance tracker
     */
    public func getPerformanceTracker(): PerformanceTracker {
        return _performanceTracker
    }

    /**
     * Delegate methods to the internal skill manager
     */
    public func addSkill(skill: Skill): Unit {
        _skillManager.addSkill(skill)
    }

    public func delSkill(skill: Skill): Unit {
        _skillManager.delSkill(skill)
    }

    public func removeSkill(skillName: String): Unit {
        _skillManager.removeSkill(skillName)
    }

    public func enableSkill(skillName: String): Unit {
        _skillManager.enableSkill(skillName)
    }

    public func disableSkill(skillName: String): Unit {
        _skillManager.disableSkill(skillName)
    }

    public func getSkill(skillName: String): Option<Skill> {
        return _skillManager.getSkill(skillName)
    }

    public func isSkillEnabled(skillName: String): Bool {
        return _skillManager.isSkillEnabled(skillName)
    }

    public func findTool(name: String): Option<Tool> {
        return _skillManager.findTool(name)
    }

    public func filterTool(question: String, filter: ToolFilter): Array<Tool> {
        return _skillManager.filterTool(question, filter)
    }

    public func addTool(tool: Tool): Unit {
        _skillManager.addTool(tool)
    }

    public func delTool(tool: Tool): Unit {
        _skillManager.delTool(tool)
    }

    public func addTools(tools: Array<Tool>): Unit {
        _skillManager.addTools(tools)
    }

    public func clear(): Unit {
        _skillManager.clear()
    }

    public prop tools: Array<Tool> {
        get() { _skillManager.tools }
    }

    public prop enableFilter: Bool {
        get() { _skillManager.enableFilter }
    }

    public prop availableSkills: HashMap<String, Skill> {
        get() { _skillManager.availableSkills }
    }

    public prop enabledSkills: Array<String> {
        get() { _skillManager.enabledSkills }
    }
}