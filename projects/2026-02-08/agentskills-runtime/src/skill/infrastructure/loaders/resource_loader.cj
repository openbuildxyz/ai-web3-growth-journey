/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.loaders

import magic.skill.domain.models.SkillResourceLoader
import std.collection.HashMap
import std.io.*
import std.fs.*
import std.fs.{OpenMode, Directory, File}
import std.fs.{exists as fsExists, removeIfExists}

/**
 * ResourceLoadingService implements loading of external resources for skills (scripts, references, assets).
 */
public class ResourceLoadingService {
    /**
     * Load external resources for a skill
     */
    public func loadExternalResources(skillPath: String): SkillResourceLoader {
        // Determine the skill directory from the skill path
        let lastSlashIndex = skillPath.lastIndexOf('/')
        let skillDir = if (lastSlashIndex.isSome()) {
            let index = lastSlashIndex.getOrThrow()
            skillPath[0..index]
        } else {
            skillPath  // If no slash found, use the whole path
        }
        
        // Initialize paths
        var scriptsPath: Option<String> = None
        var referencesPath: Option<String> = None
        var assetsPath: Option<String> = None
        
        // Check for and load scripts
        let scriptsDir = "${skillDir}/scripts/"
        var loadedScripts = HashMap<String, String>()
        if (fsExists(scriptsDir)) {
            scriptsPath = Some(scriptsDir)
            loadedScripts = loadDirectoryContents(scriptsDir)
        }

        // Check for and load references
        let referencesDir = "${skillDir}/references/"
        var loadedReferences = HashMap<String, String>()
        if (fsExists(referencesDir)) {
            referencesPath = Some(referencesDir)
            loadedReferences = loadDirectoryContents(referencesDir)
        }

        // Check for and load assets
        let assetsDir = "${skillDir}/assets/"
        var loadedAssets = HashMap<String, String>()
        if (fsExists(assetsDir)) {
            assetsPath = Some(assetsDir)
            loadedAssets = loadDirectoryContents(assetsDir)
        }
        
        // Create and return the SkillResourceLoader
        return SkillResourceLoader(
            skillPath: skillPath,
            scriptsPath: scriptsPath,
            referencesPath: referencesPath,
            assetsPath: assetsPath,
            loadedScripts: loadedScripts,
            loadedReferences: loadedReferences,
            loadedAssets: loadedAssets
        )
    }

    /**
     * Load script content by name
     */
    public func loadScript(skillPath: String, scriptName: String): Option<String> {
        let lastSlashIndexOpt = skillPath.lastIndexOf('/')
        let skillDir = if (lastSlashIndexOpt.isSome()) {
            let lastSlashIndex = lastSlashIndexOpt.getOrThrow()
            skillPath[0..lastSlashIndex]
        } else {
            skillPath  // If no slash found, use the whole path
        }
        let scriptPath = "${skillDir}/scripts/${scriptName}"

        if (exists(scriptPath)) {
            let file = File(scriptPath, OpenMode.Read)  // Open for reading
            if (file.canRead()) {
                let reader = StringReader(file)
                let content = reader.readToEnd()
                reader.close()
                file.close()
                return Some(content)
            }
        }
        
        return None
    }

    /**
     * Load reference content by name
     */
    public func loadReference(skillPath: String, referenceName: String): Option<String> {
        let lastSlashIndexOpt = skillPath.lastIndexOf('/')
        let skillDir = if (lastSlashIndexOpt.isSome()) {
            let lastSlashIndex = lastSlashIndexOpt.getOrThrow()
            skillPath[0..lastSlashIndex]
        } else {
            skillPath  // If no slash found, use the whole path
        }
        let referencePath = "${skillDir}/references/${referenceName}"

        if (exists(referencePath)) {
            let file = File(referencePath, OpenMode.Read)  // Open for reading
            if (file.canRead()) {
                let reader = StringReader(file)
                let content = reader.readToEnd()
                reader.close()
                file.close()
                return Some(content)
            }
        }

        return None
    }

    /**
     * Load asset content by name
     */
    public func loadAsset(skillPath: String, assetName: String): Option<String> {
        let lastSlashIndexOpt = skillPath.lastIndexOf('/')
        let skillDir = if (lastSlashIndexOpt.isSome()) {
            let lastSlashIndex = lastSlashIndexOpt.getOrThrow()
            skillPath[0..lastSlashIndex]
        } else {
            skillPath  // If no slash found, use the whole path
        }
        let assetPath = "${skillDir}/assets/${assetName}"

        if (exists(assetPath)) {
            let file = File(assetPath, OpenMode.Read)  // Open for reading
            if (file.canRead()) {
                let reader = StringReader(file)
                let content = reader.readToEnd()
                reader.close()
                file.close()
                return Some(content)
            }
        }

        return None
    }

    /**
     * Load all contents of a directory
     */
    private func loadDirectoryContents(dirPath: String): HashMap<String, String> {
        let contents = HashMap<String, String>()

        if (fsExists(dirPath)) {
            // Use a different approach to list directory contents
            // In Cangjie, we may need to use a different API or approach
            // For now, return an empty HashMap as a placeholder
            // The actual implementation would scan the directory for files
        }

        return contents
    }
}