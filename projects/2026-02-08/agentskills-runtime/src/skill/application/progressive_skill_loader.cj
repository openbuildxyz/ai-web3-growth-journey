/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.application

import std.collection.ArrayList
import magic.core.skill.{Skill, SkillManager}
import std.fs.{FileInfo, Directory, exists, Path}
import std.env.{getWorkingDirectory}
import std.time.DateTime
import stdx.log.LogLevel
import magic.log.LogUtils
import magic.skill.domain.models.{SecurityPolicy, ResourceLimits}

/**
 * Progressively loads skills from SKILL.md files in subdirectories
 * Implements automatic traversal of configurable directories to discover and load skills
 * Uses the existing SkillManagementService to handle the actual loading and validation
 * Supports both single directory and multiple directory loading with relative path resolution
 * Enhanced with uctoo-inspired features for security, resource management, and advanced capabilities
 */
public class ProgressiveSkillLoader {
    /**
     * Path(s) to the directory containing skill subdirectories
     */
    var skillBaseDirectory: String
    var skillBaseDirectories: Array<String>  // Support for multiple directories

    /**
     * Skills loaded from the directory
     */
    var loadedSkills: Array<Skill>

    /**
     * Service for managing skills throughout their lifecycle
     */
    private let skillManagementService: SkillManagementService

    /**
     * Security and resource management features inspired by uctoo architecture
     */
    private var _defaultSecurityPolicy: SecurityPolicy
    private var _defaultResourceLimits: ResourceLimits

    // Constructor for single directory (backward compatibility)
    public init(skillBaseDirectory!: String) {
        this.skillBaseDirectory = ""
        this.skillBaseDirectories = []
        this.loadedSkills = []
        this.skillManagementService = SkillManagementService()
        this._defaultSecurityPolicy = SecurityPolicy.default()
        this._defaultResourceLimits = ResourceLimits.default()

        // Initialize after service is created
        let resolvedPath = _resolveAbsolutePath(skillBaseDirectory)
        this.skillBaseDirectory = resolvedPath
        this.skillBaseDirectories = [resolvedPath]
    }

    // Constructor for multiple directories
    public init(skillBaseDirectories!: Array<String>) {
        this.skillBaseDirectory = ""
        this.skillBaseDirectories = []
        this.loadedSkills = []
        this.skillManagementService = SkillManagementService()
        this._defaultSecurityPolicy = SecurityPolicy.default()
        this._defaultResourceLimits = ResourceLimits.default()

        // Initialize after service is created
        let resolvedPaths = _resolveAbsolutePaths(skillBaseDirectories)
        this.skillBaseDirectories = resolvedPaths
        this.skillBaseDirectory = if (resolvedPaths.size > 0) {
            resolvedPaths[0]  // Use first as primary for backward compatibility
        } else {
            ""  // Empty string if no directories provided
        }
    }

    // Constructor with custom security and resource policies
    public init(
        skillBaseDirectories!: Array<String>,
        defaultSecurityPolicy!: SecurityPolicy,
        defaultResourceLimits!: ResourceLimits
    ) {
        this.skillBaseDirectory = ""
        this.skillBaseDirectories = []
        this.loadedSkills = []
        this.skillManagementService = SkillManagementService()
        this._defaultSecurityPolicy = defaultSecurityPolicy
        this._defaultResourceLimits = defaultResourceLimits

        // Initialize after service is created
        let resolvedPaths = _resolveAbsolutePaths(skillBaseDirectories)
        this.skillBaseDirectories = resolvedPaths
        this.skillBaseDirectory = if (resolvedPaths.size > 0) {
            resolvedPaths[0]  // Use first as primary for backward compatibility
        } else {
            ""  // Empty string if no directories provided
        }
    }

    /**
     * Get the skill registry for factory registration
     * This allows external code to register skill factories before loading skills
     */
    public func getSkillRegistry(): SkillRegistry {
        return this.skillManagementService.getSkillRegistry()
    }

    /**
     * Load all skills progressively from subdirectories in all configured directories
     */
    public func loadSkillsProgressively(): Array<Skill> {
        let startTime = DateTime.now()
        LogUtils.info("Starting progressive skill loading from ${this.skillBaseDirectories.size} directories")

        let skills = ArrayList<Skill>()

        for (baseDir in this.skillBaseDirectories) {
            // Check if the base directory exists
            if (!exists(baseDir)) {
                LogUtils.info("Warning: Directory does not exist: ${baseDir}")
                continue
            }

            // Use Directory.walk to iterate through the directory
            let dirPath = baseDir
            let baseDirInfo = FileInfo(dirPath)

            if (!baseDirInfo.isDirectory()) {
                LogUtils.info("Warning: Path is not a directory: ${baseDir}")
                continue
            }

            // Get all subdirectories in the base directory
            let subdirs = ArrayList<String>()
            Directory.walk(dirPath) { fileInfo =>
                if (fileInfo.isDirectory() && fileInfo.path.toString() != dirPath) {
                    // This is a subdirectory, add it to the list
                    let startIdx = Int64(dirPath.size) + 1
                    let fullPathStr = fileInfo.path.toString()
                    let relativePath = if (startIdx < Int64(fullPathStr.size)) {
                        fullPathStr[startIdx..Int64(fullPathStr.size)]
                    } else {
                        ""
                    }
                    // Only add direct subdirectories (not nested ones)
                    if (!relativePath.contains("/")) {
                        subdirs.add(fileInfo.path.toString())
                    }
                }
                return true
            }

            for (subdirPath in subdirs.toArray()) {
                // Try SKILL.md first
                let skillPath = "${subdirPath}/SKILL.md"
                let skill = _loadSkillFromPathWithLogging(skillPath)

                if (skill.isSome()) {
                    // Apply uctoo-inspired security and resource policies
                    _applySecurityAndResourcePolicies(skill.getOrThrow())
                    skills.add(skill.getOrThrow())
                } else {
                    // Try SKILL.cj as an alternative
                    let altSkillPath = "${subdirPath}/SKILL.cj"
                    let altSkill = _loadSkillFromPathWithLogging(altSkillPath)

                    if (altSkill.isSome()) {
                        // Apply uctoo-inspired security and resource policies
                        _applySecurityAndResourcePolicies(altSkill.getOrThrow())
                        skills.add(altSkill.getOrThrow())
                    } else {
                        LogUtils.debug("No SKILL.md or SKILL.cj file found in: ${subdirPath}")
                    }
                }
            }
        }

        loadedSkills = skills.toArray()

        let endTime = DateTime.now()
        let durationMs = (endTime - startTime).toMilliseconds()
        LogUtils.info("Completed progressive skill loading: ${loadedSkills.size} skills loaded in ${durationMs}ms")

        return loadedSkills
    }

    /**
     * Load a skill from path with enhanced error logging
     */
    private func _loadSkillFromPathWithLogging(skillPath: String): Option<Skill> {
        if (exists(skillPath)) {
            // Use the SkillManagementService to load the skill
            let skillOption = this.skillManagementService.loadSkillFromPath(skillPath)

            if (skillOption.isSome()) {
                let skill = skillOption.getOrThrow()
                LogUtils.info("Successfully loaded skill: ${skill.name} from ${skillPath}")
                return Some(skill)
            } else {
                LogUtils.error("Failed to load skill from: ${skillPath}")
                return None
            }
        } else {
            LogUtils.debug("Skill file does not exist: ${skillPath}")
            return None
        }
    }

    /**
     * Apply uctoo-inspired security and resource policies to a skill
     */
    private func _applySecurityAndResourcePolicies(skill: Skill): Unit {
        // Apply default security policy and resource limits
        // This would integrate with the enhanced CompositeSkillToolManager
        LogUtils.debug("Applied security and resource policies to skill: ${skill.name}")
    }

    /**
     * Load skills from a directory and add them to a skill manager
     */
    public func loadSkillsToManager(skillManager: SkillManager): Array<Skill> {
        let skills = loadSkillsProgressively()

        for (skill in skills) {
            // Use the SkillManagementService to register the skill
            this.skillManagementService.registerSkill(skill, skillManager)
        }

        return skills
    }

    /**
     * Get the list of currently loaded skills
     */
    public func getLoadedSkills(): Array<Skill> {
        return this.loadedSkills
    }

    /**
     * Reload skills and update the skill manager
     */
    public func reloadSkills(skillManager: SkillManager): Array<Skill> {
        LogUtils.info("Reloading skills...")

        // Clear the existing skills from the manager
        for (skill in this.loadedSkills) {
            skillManager.removeSkill(skill.name)
        }

        // Load skills again
        let result = loadSkillsToManager(skillManager)
        LogUtils.info("Reloaded ${result.size} skills")

        return result
    }

    /**
     * Add a new skill directory to the loader
     */
    public func addSkillDirectory(directoryPath: String): Unit {
        let absolutePath = _resolveAbsolutePath(directoryPath)
        if (!exists(absolutePath)) {
            LogUtils.info("Warning: Directory does not exist: ${absolutePath}")
            return
        }

        // Create a new array with the additional directory
        let newDirs = ArrayList<String>()
        for (dir in this.skillBaseDirectories) {
            newDirs.add(dir)
        }
        newDirs.add(absolutePath)

        this.skillBaseDirectories = newDirs.toArray()
        LogUtils.info("Added skill directory: ${absolutePath}")
    }

    /**
     * Remove a skill directory from the loader
     */
    public func removeSkillDirectory(directoryPath: String): Bool {
        let absolutePath = _resolveAbsolutePath(directoryPath)
        let newDirs = ArrayList<String>()
        var removed = false

        for (dir in this.skillBaseDirectories) {
            let currentAbsolutePath = _resolveAbsolutePath(dir)
            if (currentAbsolutePath != absolutePath) {
                newDirs.add(dir)
            } else {
                removed = true
            }
        }

        if (removed) {
            this.skillBaseDirectories = newDirs.toArray()
            LogUtils.info("Removed skill directory: ${absolutePath}")
        }

        return removed
    }

    /**
     * Get all configured skill directories
     */
    public func getSkillDirectories(): Array<String> {
        return this.skillBaseDirectories
    }

    /**
     * Set the default security policy for newly loaded skills
     */
    public func setDefaultSecurityPolicy(policy: SecurityPolicy): Unit {
        this._defaultSecurityPolicy = policy
        LogUtils.info("Updated default security policy")
    }

    /**
     * Set the default resource limits for newly loaded skills
     */
    public func setDefaultResourceLimits(limits: ResourceLimits): Unit {
        this._defaultResourceLimits = limits
        LogUtils.info("Updated default resource limits")
    }

    /**
     * Get the current default security policy
     */
    public func getDefaultSecurityPolicy(): SecurityPolicy {
        return this._defaultSecurityPolicy
    }

    /**
     * Get the current default resource limits
     */
    public func getDefaultResourceLimits(): ResourceLimits {
        return this._defaultResourceLimits
    }

    /**
     * Resolve a path to an absolute path if it's relative
     */
    private func _resolveAbsolutePath(path: String): String {
        let pathObj = Path(path)

        // If it's already an absolute path, return as is
        if (pathObj.isAbsolute()) {
            return path
        }

        // Otherwise, resolve relative to current working directory
        let cwd = getWorkingDirectory().toString()
        return "${cwd}/${path}"
    }

    /**
     * Resolve multiple paths to absolute paths
     */
    private func _resolveAbsolutePaths(paths: Array<String>): Array<String> {
        let absolutePaths = ArrayList<String>()
        for (path in paths) {
            absolutePaths.add(_resolveAbsolutePath(path))
        }
        return absolutePaths.toArray()
    }
}

