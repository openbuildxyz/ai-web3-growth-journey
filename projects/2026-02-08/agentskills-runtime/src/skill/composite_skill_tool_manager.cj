/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.{Skill, SkillManager}
import magic.core.tool.{Tool, ToolFilter, ToolManager}
import magic.tool.SimpleToolManager
import std.collection.{HashMap, ArrayList}
@When[cjc_version < "1.0.0"]
import std.time.Duration
import magic.skill.domain.models.Capability

/**
 * A composite manager that implements both SkillManager and ToolManager interfaces
 * This allows for managing both skills and tools in a unified way while maintaining separation of concerns
 * Enhanced with uctoo-inspired features for security, resource management, and advanced capabilities
 */
public class CompositeSkillToolManager <: SkillManager & ToolManager {
    private var _availableSkills: HashMap<String, Skill>
    private var _enabledSkills: ArrayList<String>
    private let _toolManager: ToolManager
    private let _skillSecurityPolicies: HashMap<String, SecurityPolicy>
    private let _skillResourceLimits: HashMap<String, ResourceLimits>
    private let _skillCapabilities: HashMap<String, ArrayList<Capability>>

    public init(skills: Collection<Skill>, toolManager: ToolManager) {
        _availableSkills = HashMap<String, Skill>()
        _enabledSkills = ArrayList<String>()
        _toolManager = toolManager
        _skillSecurityPolicies = HashMap<String, SecurityPolicy>()
        _skillResourceLimits = HashMap<String, ResourceLimits>()
        _skillCapabilities = HashMap<String, ArrayList<Capability>>()

        // Add initial skills to the available skills map
        for (skill in skills) {
            _availableSkills.add(skill.name, skill)
            _enabledSkills.add(skill.name)
            // Also register the skill as a tool using the adapter
            _toolManager.addTool(SkillToToolAdapter(skill: skill))

            // Initialize default security policy and resource limits
            _skillSecurityPolicies.add(skill.name, SecurityPolicy.default())
            _skillResourceLimits.add(skill.name, ResourceLimits.default())
            _skillCapabilities.add(skill.name, ArrayList<Capability>())
        }
    }

    public init(skills: Collection<Skill>) {
        this(skills, SimpleToolManager([]))
    }

    public init() {
        this([])
    }

    // SkillManager interface implementation
    public prop availableSkills: HashMap<String, Skill> {
        get() { _availableSkills }
    }

    public prop enabledSkills: Array<String> {
        get() { _enabledSkills.toArray() }
    }

    public func addSkill(skill: Skill): Unit {
        _availableSkills.add(skill.name, skill)
        _enabledSkills.add(skill.name)
        // Also register the skill as a tool using the adapter
        _toolManager.addTool(SkillToToolAdapter(skill: skill))

        // Initialize default security policy and resource limits
        _skillSecurityPolicies.add(skill.name, SecurityPolicy.default())
        _skillResourceLimits.add(skill.name, ResourceLimits.default())
        _skillCapabilities.add(skill.name, ArrayList<Capability>())
    }

    public func delSkill(skill: Skill): Unit {
        _availableSkills.remove(skill.name)
        _skillSecurityPolicies.remove(skill.name)
        _skillResourceLimits.remove(skill.name)
        _skillCapabilities.remove(skill.name)

        let newEnabledSkills = ArrayList<String>()
        for (name in _enabledSkills) {
            if (name != skill.name) {
                newEnabledSkills.add(name)
            }
        }
        _enabledSkills = newEnabledSkills
        // Also remove the skill as a tool using the adapter
        _toolManager.delTool(SkillToToolAdapter(skill: skill))
    }

    public func removeSkill(skillName: String): Unit {
        if (let Some(skill) <- _availableSkills.get(skillName)) {
            _availableSkills.remove(skillName)
            _skillSecurityPolicies.remove(skillName)
            _skillResourceLimits.remove(skillName)
            _skillCapabilities.remove(skillName)

            let newEnabledSkills = ArrayList<String>()
            for (name in _enabledSkills) {
                if (name != skillName) {
                    newEnabledSkills.add(name)
                }
            }
            _enabledSkills = newEnabledSkills
            // Also remove the skill as a tool using the adapter
            _toolManager.delTool(SkillToToolAdapter(skill: skill))
        }
    }

    public func enableSkill(skillName: String): Unit {
        if (!_enabledSkills.contains(skillName) && _availableSkills.contains(skillName)) {
            _enabledSkills.add(skillName)
        }
    }

    public func disableSkill(skillName: String): Unit {
        let newEnabledSkills = ArrayList<String>()
        for (name in _enabledSkills) {
            if (name != skillName) {
                newEnabledSkills.add(name)
            }
        }
        _enabledSkills = newEnabledSkills
    }

    public func getSkill(skillName: String): Option<Skill> {
        return _availableSkills.get(skillName)
    }

    public func isSkillEnabled(skillName: String): Bool {
        return _enabledSkills.contains(skillName)
    }

    // uctoo-inspired security and resource management features
    public func setSkillSecurityPolicy(skillName: String, policy: SecurityPolicy): Unit {
        _skillSecurityPolicies.add(skillName, policy)
    }

    public func getSkillSecurityPolicy(skillName: String): Option<SecurityPolicy> {
        return _skillSecurityPolicies.get(skillName)
    }

    public func setSkillResourceLimits(skillName: String, limits: ResourceLimits): Unit {
        _skillResourceLimits.add(skillName, limits)
    }

    public func getSkillResourceLimits(skillName: String): Option<ResourceLimits> {
        return _skillResourceLimits.get(skillName)
    }

    public func addSkillCapability(skillName: String, capability: Capability): Unit {
        if (let Some(capabilities) <- _skillCapabilities.get(skillName)) {
            capabilities.add(capability)
        } else {
            let capabilities = ArrayList<Capability>()
            capabilities.add(capability)
            _skillCapabilities.add(skillName, capabilities)
        }
    }

    public func getSkillCapabilities(skillName: String): Option<ArrayList<Capability>> {
        return _skillCapabilities.get(skillName)
    }

    // ToolManager interface implementation
    public func findTool(name: String): Option<Tool> {
        // First check if it's a skill that's enabled
        if (let Some(skill) <- _availableSkills.get(name)) {
            if (_enabledSkills.contains(name)) {
                // Check if the skill has the required capabilities
                if (_hasRequiredCapabilities(name)) {
                    return Some(SkillToToolAdapter(skill: skill))
                }
            }
        }
        // If not a skill or not enabled, delegate to the internal tool manager
        return _toolManager.findTool(name)
    }

    public func filterTool(question: String, filter: ToolFilter): Array<Tool> {
        let allTools = _toolManager.tools
        // Create a set of enabled skill names manually
        let enabledSkillNamesSet = HashMap<String, Bool>()
        for (name in _enabledSkills) {
            enabledSkillNamesSet.add(name, true)
        }

        // Get enabled skills that have required capabilities
        let enabledSkills = ArrayList<Tool>()
        for ((name, skill) in _availableSkills) {
            if (enabledSkillNamesSet.contains(name) && _hasRequiredCapabilities(name)) {
                enabledSkills.add(SkillToToolAdapter(skill: skill))
            }
        }

        // Combine both arrays
        let result = ArrayList<Tool>()
        for (tool in allTools) {
            // Add tools that are not skills or are skills that are enabled
            if (!_availableSkills.contains(tool.name) || (enabledSkillNamesSet.contains(tool.name) && _hasRequiredCapabilities(tool.name))) {
                result.add(tool)
            }
        }
        for (skill in enabledSkills) {
            result.add(skill)
        }

        return result.toArray()
    }

    public func addTool(tool: Tool): Unit {
        _toolManager.addTool(tool)
    }

    public func delTool(tool: Tool): Unit {
        _toolManager.delTool(tool)
    }

    public func addTools(tools: Collection<Tool>): Unit {
        _toolManager.addTools(tools)
    }

    public func clear(): Unit {
        _toolManager.clear()
        _availableSkills.clear()
        _enabledSkills.clear()
        _skillSecurityPolicies.clear()
        _skillResourceLimits.clear()
        _skillCapabilities.clear()
    }

    public prop tools: Array<Tool> {
        get() {
            // The internal tool manager already contains skill adapters (added via addSkill)
            // So we just return the internal tools directly to avoid duplicates
            return _toolManager.tools
        }
    }

    public prop enableFilter: Bool {
        get() { _toolManager.enableFilter }
    }

    // Helper method to check if a skill has required capabilities
    private func _hasRequiredCapabilities(skillName: String): Bool {
        // For now, just check if the skill has any capabilities defined
        // In a more advanced implementation, this could check against required capabilities
        return _skillCapabilities.contains(skillName) && _skillCapabilities[skillName].size > 0
    }
}

// uctoo-inspired security policy class
public class SecurityPolicy {
    private let _allowNetworkAccess: Bool
    private let _allowFileSystemAccess: Bool
    private let _allowCommandExecution: Bool
    private let _executionTimeout: Duration

    public init(
        allowNetworkAccess!: Bool,
        allowFileSystemAccess!: Bool,
        allowCommandExecution!: Bool,
        executionTimeout!: Duration
    ) {
        _allowNetworkAccess = allowNetworkAccess
        _allowFileSystemAccess = allowFileSystemAccess
        _allowCommandExecution = allowCommandExecution
        _executionTimeout = executionTimeout
    }

    public static func default(): SecurityPolicy {
        // Default policy: no network access, no file system access, no command execution, 30 second timeout
        return SecurityPolicy(
            allowNetworkAccess: false,
            allowFileSystemAccess: false,
            allowCommandExecution: false,
            executionTimeout: Duration.second * 30
        )
    }

    public prop allowNetworkAccess: Bool {
        get() { _allowNetworkAccess }
    }

    public prop allowFileSystemAccess: Bool {
        get() { _allowFileSystemAccess }
    }

    public prop allowCommandExecution: Bool {
        get() { _allowCommandExecution }
    }

    public prop executionTimeout: Duration {
        get() { _executionTimeout }
    }
}

// uctoo-inspired resource limits class
public class ResourceLimits {
    private let _maxMemory: Int64
    private let _maxCpuTime: Duration
    private let _maxNetworkBytes: Int64
    private let _maxFileOperations: Int32

    public init(
        maxMemory!: Int64,
        maxCpuTime!: Duration,
        maxNetworkBytes!: Int64,
        maxFileOperations!: Int32
    ) {
        _maxMemory = maxMemory
        _maxCpuTime = maxCpuTime
        _maxNetworkBytes = maxNetworkBytes
        _maxFileOperations = maxFileOperations
    }

    public static func default(): ResourceLimits {
        // Default limits: 100MB memory, 30 seconds CPU time, 10MB network, 100 file operations
        return ResourceLimits(
            maxMemory: 100 * 1024 * 1024,  // 100 MB
            maxCpuTime: Duration.second * 30,
            maxNetworkBytes: 10 * 1024 * 1024,  // 10 MB
            maxFileOperations: 100
        )
    }

    public prop maxMemory: Int64 {
        get() { _maxMemory }
    }

    public prop maxCpuTime: Duration {
        get() { _maxCpuTime }
    }

    public prop maxNetworkBytes: Int64 {
        get() { _maxNetworkBytes }
    }

    public prop maxFileOperations: Int32 {
        get() { _maxFileOperations }
    }
}

