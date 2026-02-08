/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.application

import std.collection.ArrayList
import magic.core.skill.{Skill, SkillManager}
import std.fs.{FileInfo, Directory, exists, Path}
import std.env.{getWorkingDirectory}

/**
 * Enhanced progressively loads skills from SKILL.md files in multiple directories
 * Implements automatic traversal of configurable directories to discover and load skills
 * Uses the existing SkillManagementService to handle the actual loading and validation
 * Supports both absolute and relative paths for skill directories
 */
public class EnhancedProgressiveSkillLoader {
    /**
     * Paths to the directories containing skill subdirectories
     */
    var skillBaseDirectories: Array<String>

    /**
     * Skills loaded from the directories
     */
    var loadedSkills: Array<Skill>

    /**
     * Service for managing skills throughout their lifecycle
     */
    private let skillManagementService: SkillManagementService

    public init(skillBaseDirectories!: Array<String>) {
        this.skillBaseDirectories = []
        this.loadedSkills = []
        this.skillManagementService = SkillManagementService()

        // Initialize after service is created
        this.skillBaseDirectories = _resolveAbsolutePaths(skillBaseDirectories)
    }

    /**
     * Load all skills progressively from multiple base directories
     */
    public func loadSkillsProgressively(): Array<Skill> {
        let skills = ArrayList<Skill>()

        for (baseDir in this.skillBaseDirectories) {
            // Convert relative path to absolute path if needed
            let absoluteBaseDir = _resolveAbsolutePath(baseDir)
            
            // Check if the base directory exists
            if (!exists(absoluteBaseDir)) {
          //      println("Warning: Directory does not exist: ${absoluteBaseDir}")
                continue
            }

            // Use Directory.walk to iterate through the directory
            let dirInfo = FileInfo(absoluteBaseDir)
            if (!dirInfo.isDirectory()) {
           //     println("Warning: Path is not a directory: ${absoluteBaseDir}")
                continue
            }

            // Get all subdirectories in the base directory
            let subdirs = ArrayList<String>()
            Directory.walk(absoluteBaseDir) { fileInfo =>
                if (fileInfo.isDirectory() && fileInfo.path.toString() != absoluteBaseDir) {
                    // This is a subdirectory, add it to the list
                    let startIdx = Int64(absoluteBaseDir.size) + 1
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
                    // Use the SkillManagementService to load the skill
                    let skillOption = this.skillManagementService.loadSkillFromPath(skillPath)

                    if (skillOption.isSome()) {
                        let skill = skillOption.getOrThrow()
                        skills.add(skill)
               //         println("Successfully loaded skill: ${skill.name} from ${skillPath}")
                    } else {
                //        println("Failed to load skill from: ${skillPath}")
                    }
                } else {
                    // Try SKILL.cj as an alternative
                    let altSkillPath = "${subdirPath}/SKILL.cj"
                    if (exists(altSkillPath)) {
                        let skillOption = this.skillManagementService.loadSkillFromPath(altSkillPath)
                        
                        if (skillOption.isSome()) {
                            let skill = skillOption.getOrThrow()
                            skills.add(skill)
                //            println("Successfully loaded skill: ${skill.name} from ${altSkillPath}")
                        } else {
                //            println("Failed to load skill from: ${altSkillPath}")
                        }
                    } else {
                //        println("No SKILL.md or SKILL.cj file found in: ${subdirPath}")
                    }
                }
            }
        }

        loadedSkills = skills.toArray()
        return loadedSkills
    }

    /**
     * Load skills from multiple directories and add them to a skill manager
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
        // Clear the existing skills from the manager
        for (skill in this.loadedSkills) {
            skillManager.removeSkill(skill.name)
        }

        // Load skills again
        return loadSkillsToManager(skillManager)
    }

    /**
     * Add a new skill directory to the loader
     */
    public func addSkillDirectory(directoryPath: String): Unit {
        let absolutePath = _resolveAbsolutePath(directoryPath)
        if (!exists(absolutePath)) {
        //    println("Warning: Directory does not exist: ${absolutePath}")
            return
        }
        
        // Create a new array with the additional directory
        let newDirs = ArrayList<String>()
        for (dir in this.skillBaseDirectories) {
            newDirs.add(dir)
        }
        newDirs.add(absolutePath)
        
        this.skillBaseDirectories = newDirs.toArray()
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
        }
        
        return removed
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

    /**
     * Get the skill registry for factory registration
     * This allows external code to register skill factories before loading skills
     */
    public func getSkillRegistry(): SkillRegistry {
        return this.skillManagementService.getSkillRegistry()
    }
}