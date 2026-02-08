/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.repositories

import magic.skill.domain.interfaces.SkillRepository
import magic.skill.domain.models.SkillManifest
import magic.skill.application.SkillLoadingService
import std.collection.HashMap
import std.fs.*
import std.collection.ArrayList
import std.fs.{exists, removeIfExists, Directory as FsDirectory, File as FsFile, OpenMode}
import std.io.*

/**
 * FileBasedSkillRepository implements the SkillRepository interface using file-based persistence.
 */
public class FileBasedSkillRepository <: SkillRepository {
    /**
     * Save a skill manifest to a file
     */
    public func save(skillManifest: SkillManifest): Bool {
        try {
            // Create the directory if it doesn't exist
            let lastSlashIndexOpt = skillManifest.skillPath.lastIndexOf('/')
            let skillDir = if (let Some(lastSlashIndex) <- lastSlashIndexOpt) {
                if (lastSlashIndex > 0) {
                    skillManifest.skillPath[0..lastSlashIndex]
                } else {
                    skillManifest.skillPath
                }
            } else {
                skillManifest.skillPath  // If no slash found, use the whole path
            }
            if (!exists(skillDir)) {
                FsDirectory.create(skillDir)
            }
            
            // Create the SKILL.md content
            let yamlFrontmatter = buildYamlFrontmatter(skillManifest)
            let content = "${yamlFrontmatter}\n${skillManifest.instructions}"
            
            // Write the content to the file
            let file = FsFile(skillManifest.skillPath, OpenMode.Write)
            file.write(content.toArray())
            file.close()
            
            return true
        } catch (ex: Exception) {
            // Log the exception or handle it appropriately
            return false
        }
    }

    /**
     * Find a skill by its path
     */
    public func findByPath(path: String): Option<SkillManifest> {
        try {
            if (!exists(path)) {
                return None
            }

            let file = FsFile(path, OpenMode.Read)
            let reader = StringReader(file)
            let content = reader.readToEnd()
            reader.close()
            file.close()

            // Use the existing SkillLoadingService to parse the content
            let loadingService = SkillLoadingService()
            return loadingService.createSkillManifestFromContent(content, path)
        } catch (ex: Exception) {
            // Log the exception or handle it appropriately
            return None
        }
    }

    /**
     * Find all skills in a directory
     */
    public func findAll(): Array<SkillManifest> {
        // This is a simplified implementation that would need to scan directories
        // for SKILL.md files and load each one
        let manifests = ArrayList<SkillManifest>()
        
        // In a real implementation, we would scan for SKILL.md files in a configured directory
        // For now, return an empty array
        return manifests.toArray()
    }

    /**
     * Delete a skill by its path
     */
    public func deleteByPath(path: String): Bool {
        try {
            if (exists(path)) {
                removeIfExists(path)
                return true
            }
            return false
        } catch (ex: Exception) {
            // Log the exception or handle it appropriately
            return false
        }
    }

    /**
     * Build YAML frontmatter from a skill manifest
     */
    private func buildYamlFrontmatter(manifest: SkillManifest): String {
        var yaml = "---\n"
        yaml += "name: ${manifest.name}\n"
        yaml += "description: ${manifest.description}\n"
        
        if (let Some(license) <- manifest.license) {
            yaml += "license: ${license}\n"
        }
        
        if (let Some(compatibility) <- manifest.compatibility) {
            yaml += "compatibility: ${compatibility}\n"
        }
        
        if (!manifest.metadata.isEmpty()) {
            yaml += "metadata:\n"
            for ((key, value) in manifest.metadata) {
                yaml += "  ${key}: ${value}\n"
            }
        }
        
        if (let Some(allowedTools) <- manifest.allowedTools) {
            yaml += "allowed-tools: ${allowedTools}\n"
        }
        
        yaml += "---\n"
        
        return yaml
    }
}