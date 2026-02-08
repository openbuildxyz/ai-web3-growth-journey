/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.application

import magic.skill.domain.models.{SkillManifest, SkillLoadingContext}
import magic.skill.infrastructure.loaders.ResourceLoadingService
import magic.core.skill.{Skill, SkillManager}
import magic.skill.BaseSkill
import std.time.DateTime
import std.collection.ArrayList
import std.fs.{FileInfo, Directory, exists}

/**
 * SkillManagementService implements application service for managing skills throughout their lifecycle.
 */
public class SkillManagementService {
    private let skillLoadingService: SkillLoadingService
    private let skillValidationService: SkillValidationService
    private let resourceLoadingService: ResourceLoadingService
    private let skillRegistry: SkillRegistry

    public init() {
        this.skillLoadingService = SkillLoadingService()
        this.skillValidationService = SkillValidationService()
        this.resourceLoadingService = ResourceLoadingService()
        this.skillRegistry = SkillRegistry()
        // Note: Skill factories should be registered externally to avoid circular dependencies
        // Example: skillRegistry.registerFactory("uctoo-api-skill", UctooAPISkillFactory())
    }

    /**
     * Get the skill registry for external factory registration
     * This allows external code to register skill factories without causing circular dependencies
     */
    public func getSkillRegistry(): SkillRegistry {
        return this.skillRegistry
    }

    /**
     * Load skill from path
     */
    public func loadSkillFromPath(path: String): Option<Skill> {
        // Load the skill manifest from the path
        let manifestOpt = this.skillLoadingService.loadSkillFromPath(path)

        if (manifestOpt.isNone()) {
            return None
        }

        let manifest = manifestOpt.getOrThrow()

        // Validate the skill manifest
        let validationResult = this.skillValidationService.validateSkillManifest(manifest)

        // Check if validation failed
        if (!validationResult.isValid) {
            return None
        }

        // Load external resources for the skill
        let resourceLoader = this.resourceLoadingService.loadExternalResources(path)

        // Create the skill loading context
        let context = SkillLoadingContext(
            manifest: manifest,
            resourceLoader: resourceLoader,
            validationResult: validationResult,
            creationDate: (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        )

        // Use the skill registry to create the appropriate skill instance
        // This allows specific skill implementations to be instantiated
        // instead of generic BaseSkill instances
        let skillOpt = skillRegistry.createSkill(manifest)

        if (skillOpt.isSome()) {
            let skill = skillOpt.getOrThrow()
            return Some(skill)
        }

        // Fallback: Create a generic BaseSkill instance
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

    /**
     * Register skill with skill manager
     */
    public func registerSkill(skill: Skill, skillManager: SkillManager): Bool {
        try {
            skillManager.addSkill(skill)
            return true
        } catch (ex: Exception) {
            // Log the exception or handle it appropriately
            return false
        }
    }

    /**
     * Load skills from directory
     */
    public func loadSkillsFromDirectory(directoryPath: String): Array<Skill> {
        let skills = ArrayList<Skill>()

        // Check if the directory exists
        if (!exists(directoryPath)) {
         //   println("Directory does not exist: ${directoryPath}")
            return skills.toArray()
        }

        // Use Directory.walk to iterate through the directory
        let dirPath = directoryPath
        let baseDirInfo = FileInfo(dirPath)

        if (!baseDirInfo.isDirectory()) {
        //    println("Path is not a directory: ${directoryPath}")
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
            let skillPath = "${subdirPath}/SKILL.md"

            // Check if SKILL.md exists in the subdirectory
            if (exists(skillPath)) {
                let skillOption = loadSkillFromPath(skillPath)
                if (skillOption.isSome()) {
                    let skill = skillOption.getOrThrow()
                    skills.add(skill)
                //        println("Successfully loaded skill: ${skill.name}")
                } else {
                //        println("Failed to load skill from: ${skillPath}")
                }
            } else {
                //        println("No SKILL.md file found in: ${subdirPath}")
            }
        }

        return skills.toArray()
    }
}
