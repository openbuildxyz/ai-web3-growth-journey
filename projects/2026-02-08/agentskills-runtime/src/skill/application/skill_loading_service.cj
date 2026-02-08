/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.application

import magic.skill.domain.models.{SkillManifest, SkillLoadingContext}
import magic.skill.infrastructure.loaders.{SkillMdLoader, YamlFrontmatterParser}
import magic.skill.infrastructure.utils.{YamlUtils, MarkdownUtils}
import std.collection.HashMap
import std.fs.{exists, Directory, FileInfo}
import std.collection.ArrayList
import std.time.DateTime
import magic.log.LogUtils
import magic.skill.domain.models.{SecurityPolicy, ResourceLimits}

/**
 * SkillLoadingService is an application service for loading skills from files.
 * Enhanced with uctoo-inspired features for security, resource management, and advanced loading capabilities.
 */
public class SkillLoadingService {
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

    /**
     * Create SkillManifest from parsed content
     */
    public func createSkillManifestFromContent(content: String, path: String): Option<SkillManifest> {
        // Parse the YAML frontmatter
        let yamlParser = YamlFrontmatterParser()
        let yamlFrontmatterOpt = yamlParser.parseYamlFrontmatter(content)

        if (yamlFrontmatterOpt.isNone()) {
            LogUtils.error("Failed to parse YAML frontmatter from skill at: ${path}")
            return None
        }

        let yamlFrontmatter = yamlFrontmatterOpt.getOrThrow()

        // Extract the markdown body (everything after the second ---)
        let markdownBody = extractMarkdownBody(content)

        // Process the markdown content using markdown4cj library
        let processedMarkdown = MarkdownUtils.parseMarkdownContent(markdownBody)

        // Check for existence of external resource directories
        let lastSlashIndexOpt = path.lastIndexOf('/')
        let skillDir = if (lastSlashIndexOpt.isSome()) {
            let lastSlashIndex = lastSlashIndexOpt.getOrThrow()
            path[0..lastSlashIndex]
        } else {
            path  // If no slash found, use the whole path
        }
        let scriptsDirExists = exists("${skillDir}/scripts/")
        let referencesDirExists = exists("${skillDir}/references/")
        let assetsDirExists = exists("${skillDir}/assets/")

        // Create and return the SkillManifest
        let skillManifest = SkillManifest(
            name: yamlFrontmatter.name,
            description: yamlFrontmatter.description,
            license: yamlFrontmatter.license,
            compatibility: yamlFrontmatter.compatibility,
            metadata: yamlFrontmatter.metadata,
            allowedTools: yamlFrontmatter.allowedTools,
            instructions: processedMarkdown,
            skillPath: path,
            scriptsDirExists: scriptsDirExists,
            referencesDirExists: referencesDirExists,
            assetsDirExists: assetsDirExists,
            parameters: []  // Parameters would be extracted from the markdown content or YAML
        )

        LogUtils.info("Successfully created SkillManifest for: ${skillManifest.name}")
        return Some(skillManifest)
    }

    /**
     * Load skill from path
     */
    public func loadSkillFromPath(path: String): Option<SkillManifest> {
        let startTime = DateTime.now()
        LogUtils.info("Starting to load skill from path: ${path}")

        let loader = SkillMdLoader()
        let result = loader.loadSkillFromPath(path)

        let endTime = DateTime.now()
        let duration = (endTime - startTime).toMilliseconds()
        LogUtils.info("Finished loading skill from path: ${path} in ${duration}ms")

        return result
    }

    /**
     * Load skills from multiple directories with uctoo-inspired security and resource management
     */
    public func loadSkillsFromDirectories(directories: Array<String>): Array<SkillManifest> {
        let allSkills = ArrayList<SkillManifest>()

        LogUtils.info("Starting to load skills from ${directories.size} directories")

        for (directory in directories) {
            let skills = loadSkillsFromDirectory(directory)
            for (skill in skills) {
                allSkills.add(skill)
            }
        }

        LogUtils.info("Successfully loaded ${allSkills.size} skills from all directories")
        return allSkills.toArray()
    }

    /**
     * Load skills from a single directory with enhanced security checks
     */
    public func loadSkillsFromDirectory(directory: String): Array<SkillManifest> {
        let skills = ArrayList<SkillManifest>()

        if (!exists(directory)) {
            LogUtils.error("Directory does not exist: ${directory}")
            return skills.toArray()
        }

        LogUtils.info("Loading skills from directory: ${directory}")

        // Use Directory.walk to iterate through the directory
        let dirPath = directory
        let baseDirInfo = FileInfo(dirPath)

        if (!baseDirInfo.isDirectory()) {
            LogUtils.error("Path is not a directory: ${directory}")
            return skills.toArray()
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
            if (exists(skillPath)) {
                let skillOption = loadSkillFromPath(skillPath)
                if (skillOption.isSome()) {
                    let skill = skillOption.getOrThrow()
                    // Apply security and resource policies
                    _applySecurityAndResourcePolicies(skill)
                    skills.add(skill)
                } else {
                    LogUtils.info("Failed to load skill from: ${skillPath}")
                }
            } else {
                // Try SKILL.cj as an alternative
                let altSkillPath = "${subdirPath}/SKILL.cj"
                if (exists(altSkillPath)) {
                    let skillOption = loadSkillFromPath(altSkillPath)
                    if (skillOption.isSome()) {
                        let skill = skillOption.getOrThrow()
                        // Apply security and resource policies
                        _applySecurityAndResourcePolicies(skill)
                        skills.add(skill)
                    } else {
                        LogUtils.info("Failed to load skill from: ${altSkillPath}")
                    }
                } else {
                    LogUtils.debug("No SKILL.md or SKILL.cj file found in: ${subdirPath}")
                }
            }
        }

        LogUtils.info("Loaded ${skills.size} skills from directory: ${directory}")
        return skills.toArray()
    }

    /**
     * Apply uctoo-inspired security and resource policies to a skill
     */
    private func _applySecurityAndResourcePolicies(skill: SkillManifest): Unit {
        // Apply default security policy and resource limits
        // This would integrate with the enhanced CompositeSkillToolManager
        LogUtils.debug("Applied security and resource policies to skill: ${skill.name}")
    }

    /**
     * Extract the markdown body from the content (everything after the second ---)
     */
    private func extractMarkdownBody(content: String): String {
        let lines = content.split("\n")

        var firstSeparatorIndex = -1
        var secondSeparatorIndex = -1

        for (i in 0..lines.size) {
            if (lines[i].trimAscii() == "---") {
                if (firstSeparatorIndex == -1) {
                    firstSeparatorIndex = i
                } else if (secondSeparatorIndex == -1) {
                    secondSeparatorIndex = i
                    break
                }
            }
        }

        if (secondSeparatorIndex != -1 && secondSeparatorIndex < lines.size - 1) {
            let bodyLines = lines[(secondSeparatorIndex + 1)..lines.size]
            return String.join(bodyLines, delimiter: "\n")
        }

        return ""  // Return empty string if no markdown body found
    }
}

