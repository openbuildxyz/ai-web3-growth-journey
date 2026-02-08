/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.application

import std.collection.{HashMap, ArrayList}
import std.fs.{exists, Directory, FileInfo, Path}
import std.process.Process
import std.env.{getWorkingDirectory, getVariable}
import std.time.DateTime
import magic.core.skill.SkillManager
import magic.log.LogUtils
import magic.skill.domain.models.ValidationResult

/**
 * SkillPackageManager handles the installation, update, and uninstallation of skills
 * Implements uctoo-inspired features for Git repository integration and dependency management
 */
public class SkillPackageManager {
    private let _installationPath: String
    private let _dependencyResolver: DependencyResolver
    private let _skillRegistry: SkillRegistry
    private let _gitManager: GitManager

    public init(
        installationPath!: String,
        dependencyResolver!: DependencyResolver,
        skillRegistry!: SkillRegistry,
        gitManager!: GitManager
    ) {
        _installationPath = installationPath
        _dependencyResolver = dependencyResolver
        _skillRegistry = skillRegistry
        _gitManager = gitManager
    }

    /**
     * Install a skill from a local path
     */
    public func installFromPath(path: String, validate: Bool): SkillInstallResult {
        LogUtils.info("Installing skill from path: ${path}")
        
        // Validate skill format and dependencies
        if (validate) {
            let validationResult = _validateSkillAtPath(path)
            if (!validationResult.isValid) {
                return SkillInstallResult.failureResult(validationResult.errors)
            }
        }

        // Resolve and install dependencies
        let dependencies = _dependencyResolver.resolveFromPath(path)
        for (dependency in dependencies) {
            _installDependency(dependency)
        }

        // Copy skill to installation directory
        let skillName = _extractSkillName(path)
        let installPath = "${_installationPath}/skills/${skillName}"
        
        // Create installation directory if it doesn't exist
        if (!exists(Path(installPath).parent)) {
            Directory.create(Path(installPath).parent, recursive: true)
        }
        
        // In a real implementation, this would copy the skill files to the installation directory
        // For now, we'll just log the intended action
        LogUtils.info("Skill would be copied to: ${installPath}")

        // Register skill in the registry
        _skillRegistry.registerSkill(skillName, installPath)

        return SkillInstallResult.successResult(installPath)
    }

    /**
     * Install a skill from a Git repository with branch/tag/commit support
     */
    public func installFromGit(
        gitUrl: String,
        branch: Option<String>,
        tag: Option<String>,
        commit: Option<String>
    ): SkillInstallResult {
        LogUtils.info("Installing skill from Git repository: ${gitUrl}")
        
        // Determine Git reference priority: commit > branch > tag
        let gitRef: GitReference = if (commit.isSome()) {
            GitReferenceCommit(value: commit.getOrThrow())
        } else if (branch.isSome()) {
            GitReferenceBranch(value: branch.getOrThrow())
        } else if (tag.isSome()) {
            GitReferenceTag(value: tag.getOrThrow())
        } else {
            GitReferenceDefault()
        }

        // Clone repository to temporary location
        let tempPath = _gitManager.cloneRepository(gitUrl, gitRef)

        // Install from cloned path
        let result = installFromPath(tempPath, true)

        // Clean up temporary directory
        _cleanupTempDirectory(tempPath)

        return result
    }

    /**
     * Install a skill from a Git repository with default parameters
     */
    public func installFromGit(gitUrl: String): SkillInstallResult {
        return installFromGit(gitUrl, None, None, None)
    }

    /**
     * Update an installed skill
     */
    public func updateSkill(skillName: String): SkillInstallResult {
        LogUtils.info("Updating skill: ${skillName}")
        
        // Get current skill info from registry
        if (let Some(skillInfo) <- _skillRegistry.getSkillInfo(skillName)) {
            if (skillInfo.sourceType == "git") {
                // Re-clone and reinstall from Git source
                return installFromGit(
                    skillInfo.sourceUrl.getOrDefault({=>""}),
                    skillInfo.branch,
                    skillInfo.tag,
                    skillInfo.commit
                )
            } else {
                return SkillInstallResult.errorResult("Cannot update locally installed skill: ${skillName}")
            }
        }

        return SkillInstallResult.errorResult("Skill not found: ${skillName}")
    }

    /**
     * Uninstall a skill
     */
    public func uninstallSkill(skillName: String): Bool {
        LogUtils.info("Uninstalling skill: ${skillName}")
        
        // Remove skill from registry
        _skillRegistry.unregisterSkill(skillName)

        // Remove skill files from installation directory
        let skillPath = "${_installationPath}/skills/${skillName}"
        if (exists(skillPath)) {
            // In a real implementation, this would remove the skill directory
            // For now, we'll just log the intended action
            LogUtils.info("Skill directory would be removed: ${skillPath}")
            return true
        }
        
        return false
    }

    /**
     * List installed skills
     */
    public func listInstalledSkills(): Array<InstalledSkill> {
        LogUtils.info("Listing installed skills")

        // Get list of installed skills from registry
        let skillInfos = _skillRegistry.listSkills()
        let installedSkills = ArrayList<InstalledSkill>()

        for (skillInfo in skillInfos) {
            installedSkills.add(InstalledSkill(
                name: skillInfo.name,
                path: skillInfo.path,
                version: skillInfo.version,
                sourceType: skillInfo.sourceType,
                sourceUrl: skillInfo.sourceUrl,
                branch: skillInfo.branch,
                tag: skillInfo.tag,
                commit: skillInfo.commit
            ))
        }

        return installedSkills.toArray()
    }

    /**
     * Validate skill at path
     */
    private func _validateSkillAtPath(path: String): ValidationResult {
        // In a real implementation, this would validate the skill format and dependencies
        // For now, we'll return a successful validation
        return ValidationResult.success()
    }

    /**
     * Install a dependency
     */
    private func _installDependency(dependency: SkillDependency): Unit {
        LogUtils.info("Installing dependency: ${dependency.name}")
        // In a real implementation, this would install the dependency
    }

    /**
     * Extract skill name from path
     */
    private func _extractSkillName(path: String): String {
        // In a real implementation, this would extract the skill name from the skill definition
        // For now, we'll extract it from the directory name
        let pathParts = path.split("/")
        return pathParts[pathParts.size - 1]
    }

    /**
     * Clean up temporary directory
     */
    private func _cleanupTempDirectory(tempPath: String): Unit {
        LogUtils.info("Cleaning up temporary directory: ${tempPath}")
        // In a real implementation, this would remove the temporary directory
    }
}

/**
 * Result of skill installation
 */
public struct SkillInstallResult {
    public let success: Bool
    public let path: Option<String>
    public let error: Option<String>

    public init(
        success!: Bool,
        path!: Option<String>,
        error!: Option<String>
    ) {
        this.success = success
        this.path = path
        this.error = error
    }
    
    public static func successResult(path: String): SkillInstallResult {
        return SkillInstallResult(success: true, path: Some(path), error: None)
    }

    public static func failureResult(errors: Array<String>): SkillInstallResult {
        return SkillInstallResult(success: false, path: None, error: Some(String.join(errors, delimiter: ", ")))
    }

    public static func errorResult(errorMsg: String): SkillInstallResult {
        return SkillInstallResult(success: false, path: None, error: Some(errorMsg))
    }
}

/**
 * Information about an installed skill
 */
public struct InstalledSkill {
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

/**
 * Git reference type
 */
public interface GitReference {}

public class GitReferenceDefault <: GitReference {
    public init() {}
}

public class GitReferenceBranch <: GitReference {
    public let value: String

    public init(value!: String) {
        this.value = value
    }
}

public class GitReferenceTag <: GitReference {
    public let value: String

    public init(value!: String) {
        this.value = value
    }
}

public class GitReferenceCommit <: GitReference {
    public let value: String

    public init(value!: String) {
        this.value = value
    }
}

/**
 * Dependency resolver for skill dependencies
 */
public class DependencyResolver {
    public func resolveFromPath(path: String): Array<SkillDependency> {
        // In a real implementation, this would parse the skill definition and extract dependencies
        // For now, we'll return an empty array
        return []
    }
}

/**
 * Git manager for cloning repositories
 */
public class GitManager {
    public func cloneRepository(url: String, ref: GitReference): String {
        // In a real implementation, this would clone the Git repository
        // For now, we'll return a mock path
        let tempDir = "/tmp/cloned-skill-${(DateTime.now() - DateTime.UnixEpoch).toMilliseconds()}"
        LogUtils.info("Cloning repository ${url} to ${tempDir}")
        return tempDir
    }
}


/**
 * Skill dependency
 */
public struct SkillDependency {
    public let name: String
    public let version: String
    public let optional: Bool

    public init(
        name!: String,
        version!: String,
        optional!: Bool
    ) {
        this.name = name
        this.version = version
        this.optional = optional
    }
}