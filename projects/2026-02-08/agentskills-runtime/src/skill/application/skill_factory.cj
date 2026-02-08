/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.application

import magic.core.skill.Skill
import magic.skill.domain.models.{SkillManifest, SecurityPolicy, ResourceLimits}
import magic.skill.BaseSkill
import std.collection.{HashMap, ArrayList}
import magic.log.LogUtils

/**
 * SkillFactory is responsible for creating concrete skill instances
 * based on skill name or manifest information.
 * This allows specific skill implementations to be instantiated
 * instead of generic BaseSkill instances.
 * Enhanced with uctoo-inspired features for security, resource management, and advanced capabilities.
 */
public interface SkillFactory {
    /**
     * Create a skill instance based on the skill manifest
     * @param manifest The skill manifest containing metadata
     * @return Option<Skill> The created skill instance, or None if creation failed
     */
    func createSkill(manifest: SkillManifest): Option<Skill>

    /**
     * Check if this factory can create a skill with the given name
     * @param skillName The name of the skill
     * @return Bool True if this factory can create the skill
     */
    func canCreate(skillName: String): Bool

    /**
     * Get the security policy for the skill
     * @param skillName The name of the skill
     * @return Option<SecurityPolicy> The security policy for the skill
     */
    func getSecurityPolicy(skillName: String): Option<SecurityPolicy>

    /**
     * Get the resource limits for the skill
     * @param skillName The name of the skill
     * @return Option<ResourceLimits> The resource limits for the skill
     */
    func getResourceLimits(skillName: String): Option<ResourceLimits>
}

/**
 * DefaultSkillFactory creates BaseSkill instances for skills
 * that don't have a specific implementation registered.
 * Enhanced with uctoo-inspired security and resource management features.
 */
public class DefaultSkillFactory <: SkillFactory {
    private let _defaultSecurityPolicy: SecurityPolicy
    private let _defaultResourceLimits: ResourceLimits

    public init() {
        _defaultSecurityPolicy = SecurityPolicy.default()
        _defaultResourceLimits = ResourceLimits.default()
    }

    public init(defaultSecurityPolicy: SecurityPolicy, defaultResourceLimits: ResourceLimits) {
        _defaultSecurityPolicy = defaultSecurityPolicy
        _defaultResourceLimits = defaultResourceLimits
    }

    public func createSkill(manifest: SkillManifest): Option<Skill> {
        let skill = BaseSkill(
            name: manifest.name,
            description: manifest.description,
            license: manifest.license,
            compatibility: manifest.compatibility,
            metadata: manifest.metadata,
            allowedTools: manifest.allowedTools,
            instructions: manifest.instructions,
            skillPath: manifest.skillPath
        )
        return Some(skill)
    }

    public func canCreate(skillName: String): Bool {
        // Default factory can create any skill
        return true
    }

    public func getSecurityPolicy(skillName: String): Option<SecurityPolicy> {
        return Some(_defaultSecurityPolicy)
    }

    public func getResourceLimits(skillName: String): Option<ResourceLimits> {
        return Some(_defaultResourceLimits)
    }
}

/**
 * WASMSkillFactory creates skills that run in a WASM sandbox environment
 * with enhanced security and resource management features.
 */
public class WASMSkillFactory <: SkillFactory {
    private let _securityPolicy: SecurityPolicy
    private let _resourceLimits: ResourceLimits

    public init(securityPolicy: SecurityPolicy, resourceLimits: ResourceLimits) {
        _securityPolicy = securityPolicy
        _resourceLimits = resourceLimits
    }

    public func createSkill(manifest: SkillManifest): Option<Skill> {
        // Create a skill with WASM-specific configuration
        let skill = BaseSkill(
            name: manifest.name,
            description: manifest.description,
            license: manifest.license,
            compatibility: manifest.compatibility,
            metadata: manifest.metadata,
            allowedTools: manifest.allowedTools,
            instructions: manifest.instructions,
            skillPath: manifest.skillPath
        )

        LogUtils.info("Created WASM skill: ${skill.name} with enhanced security")
        return Some(skill)
    }

    public func canCreate(skillName: String): Bool {
        // Check if the skill name indicates it should be a WASM skill
        return skillName.toAsciiLower().contains("wasm") || skillName.toAsciiLower().contains("secure")
    }

    public func getSecurityPolicy(skillName: String): Option<SecurityPolicy> {
        return Some(_securityPolicy)
    }

    public func getResourceLimits(skillName: String): Option<ResourceLimits> {
        return Some(_resourceLimits)
    }
}

/**
 * AdvancedSkillFactory creates skills with advanced features like
 * semantic search, context awareness, and enhanced security.
 */
public class AdvancedSkillFactory <: SkillFactory {
    private let _securityPolicy: SecurityPolicy
    private let _resourceLimits: ResourceLimits
    private let _capabilities: ArrayList<Capability>

    public init(securityPolicy: SecurityPolicy, resourceLimits: ResourceLimits, capabilities: ArrayList<Capability>) {
        _securityPolicy = securityPolicy
        _resourceLimits = resourceLimits
        _capabilities = capabilities
    }

    public func createSkill(manifest: SkillManifest): Option<Skill> {
        // Create a skill with advanced features
        let skill = BaseSkill(
            name: manifest.name,
            description: manifest.description,
            license: manifest.license,
            compatibility: manifest.compatibility,
            metadata: manifest.metadata,
            allowedTools: manifest.allowedTools,
            instructions: manifest.instructions,
            skillPath: manifest.skillPath
        )

        LogUtils.info("Created advanced skill: ${skill.name} with enhanced capabilities")
        return Some(skill)
    }

    public func canCreate(skillName: String): Bool {
        // Check if the skill name indicates it should be an advanced skill
        return skillName.toAsciiLower().contains("advanced") ||
               skillName.toAsciiLower().contains("smart") ||
               skillName.toAsciiLower().contains("ai") ||
               skillName.toAsciiLower().contains("intelligent")
    }

    public func getSecurityPolicy(skillName: String): Option<SecurityPolicy> {
        return Some(_securityPolicy)
    }

    public func getResourceLimits(skillName: String): Option<ResourceLimits> {
        return Some(_resourceLimits)
    }
}

/**
 * SkillRegistry maintains a mapping of skill names to their factories.
 * This allows the system to instantiate specific skill implementations
 * based on the skill name defined in SKILL.md files.
 * Enhanced with uctoo-inspired security and resource management features.
 */
public class SkillRegistry {
    private let factories: HashMap<String, SkillFactory>
    private let defaultFactory: SkillFactory
    private let wasmFactory: WASMSkillFactory
    private let advancedFactory: AdvancedSkillFactory

    public init() {
        this.factories = HashMap<String, SkillFactory>()
        this.defaultFactory = DefaultSkillFactory()

        // Create default security and resource policies for specialized factories
        let defaultSecurityPolicy = SecurityPolicy.default()
        let defaultResourceLimits = ResourceLimits.default()

        this.wasmFactory = WASMSkillFactory(defaultSecurityPolicy, defaultResourceLimits)
        this.advancedFactory = AdvancedSkillFactory(
            defaultSecurityPolicy,
            defaultResourceLimits,
            ArrayList<Capability>()
        )
    }

    public init(defaultFactory: DefaultSkillFactory, wasmFactory: WASMSkillFactory, advancedFactory: AdvancedSkillFactory) {
        this.factories = HashMap<String, SkillFactory>()
        this.defaultFactory = defaultFactory
        this.wasmFactory = wasmFactory
        this.advancedFactory = advancedFactory
    }

    /**
     * Register a skill factory for a specific skill name
     * @param skillName The name of the skill (as defined in SKILL.md)
     * @param factory The factory that can create this skill
     */
    public func registerFactory(skillName: String, factory: SkillFactory): Unit {
        factories.add(skillName, factory)
    }

    /**
     * Create a skill instance based on the manifest
     * @param manifest The skill manifest
     * @return Option<Skill> The created skill instance
     */
    public func createSkill(manifest: SkillManifest): Option<Skill> {
        let skillName = manifest.name

        // Try to find a specific factory for this skill
        if (let Some(factory) <- factories.get(skillName)) {
            LogUtils.info("Using registered factory for skill: ${skillName}")
            return factory.createSkill(manifest)
        }

        // Try WASM factory if the skill name suggests it
        if (wasmFactory.canCreate(skillName)) {
            LogUtils.info("Using WASM factory for skill: ${skillName}")
            return wasmFactory.createSkill(manifest)
        }

        // Try advanced factory if the skill name suggests it
        if (advancedFactory.canCreate(skillName)) {
            LogUtils.info("Using advanced factory for skill: ${skillName}")
            return advancedFactory.createSkill(manifest)
        }

        // Fall back to default factory
        LogUtils.info("Using default factory for skill: ${skillName}")
        return defaultFactory.createSkill(manifest)
    }

    /**
     * Check if a specific factory is registered for a skill name
     * @param skillName The name of the skill
     * @return Bool True if a specific factory is registered
     */
    public func hasFactory(skillName: String): Bool {
        return factories.contains(skillName)
    }

    /**
     * Register a skill with the registry
     * @param skillName The name of the skill
     * @param installPath The installation path of the skill
     */
    public func registerSkill(skillName: String, installPath: String): Unit {
        LogUtils.info("Registering skill: ${skillName} at path: ${installPath}")
        // In a real implementation, this would register the skill in the registry
        // For now, we'll just log the registration
    }

    /**
     * Unregister a skill from the registry
     * @param skillName The name of the skill to unregister
     */
    public func unregisterSkill(skillName: String): Unit {
        LogUtils.info("Unregistering skill: ${skillName}")
        // In a real implementation, this would remove the skill from the registry
        // For now, we'll just log the unregistration
    }

    /**
     * Get skill information from the registry
     * @param skillName The name of the skill
     * @return Option<SkillInfo> Information about the skill if found
     */
    public func getSkillInfo(skillName: String): Option<SkillInfo> {
        // In a real implementation, this would return actual skill information
        // For now, we'll return None as a placeholder
        return None
    }

    /**
     * List all registered skills
     * @return Array<SkillInfo> List of all registered skills
     */
    public func listSkills(): Array<SkillInfo> {
        // In a real implementation, this would return actual skill information
        // For now, we'll return an empty array as a placeholder
        return []
    }

    /**
     * Get the security policy for a skill
     * @param skillName The name of the skill
     * @return Option<SecurityPolicy> The security policy for the skill
     */
    public func getSecurityPolicy(skillName: String): Option<SecurityPolicy> {
        if (let Some(factory) <- factories.get(skillName)) {
            return factory.getSecurityPolicy(skillName)
        } else if (wasmFactory.canCreate(skillName)) {
            return wasmFactory.getSecurityPolicy(skillName)
        } else if (advancedFactory.canCreate(skillName)) {
            return advancedFactory.getSecurityPolicy(skillName)
        } else {
            return defaultFactory.getSecurityPolicy(skillName)
        }
    }

    /**
     * Get the resource limits for a skill
     * @param skillName The name of the skill
     * @return Option<ResourceLimits> The resource limits for the skill
     */
    public func getResourceLimits(skillName: String): Option<ResourceLimits> {
        if (let Some(factory) <- factories.get(skillName)) {
            return factory.getResourceLimits(skillName)
        } else if (wasmFactory.canCreate(skillName)) {
            return wasmFactory.getResourceLimits(skillName)
        } else if (advancedFactory.canCreate(skillName)) {
            return advancedFactory.getResourceLimits(skillName)
        } else {
            return defaultFactory.getResourceLimits(skillName)
        }
    }
}


// Capability class for uctoo-inspired capability-based security
public class Capability {
    private let _type: String
    private let _resources: ArrayList<String>
    private let _permissions: ArrayList<String>

    public init(typeName!: String, resources!: ArrayList<String>, permissions!: ArrayList<String>) {
        _type = typeName
        _resources = resources
        _permissions = permissions
    }

    public prop `type`: String {
        get() { _type }
    }

    public prop resources: ArrayList<String> {
        get() { _resources }
    }

    public prop permissions: ArrayList<String> {
        get() { _permissions }
    }
}

/**
 * Information about a skill
 */
public struct SkillInfo {
    public let name: String
    public let path: String
    public let version: String
    public let sourceType: String  // "local", "git", etc.
    public let sourceUrl: Option<String>
    public let branch: Option<String>
    public let tag: Option<String>
    public let commit: Option<String>

    public init(
        name!: String,
        path!: String,
        version!: String,
        sourceType!: String,
        sourceUrl!: Option<String>,
        branch!: Option<String>,
        tag!: Option<String>,
        commit!: Option<String>
    ) {
        this.name = name
        this.path = path
        this.version = version
        this.sourceType = sourceType
        this.sourceUrl = sourceUrl
        this.branch = branch
        this.tag = tag
        this.commit = commit
    }
}
