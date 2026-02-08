/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.loaders

import std.io.*
import std.fs.*
import std.collection.HashMap
import magic.skill.domain.models.{SkillManifest, SkillParameter}
import magic.skill.infrastructure.utils.YamlUtils
import magic.skill.infrastructure.utils.MarkdownUtils
import std.fs.{exists, Directory}

/**
 * SkillMdLoader loads skills from SKILL.md files.
 */
public class SkillMdLoader {
    /**
     * Load a skill from a file path
     */
    public func loadSkillFromPath(path: String): Option<SkillManifest> {
        try {
            // Read the content of the SKILL.md file
            let file = File(path, OpenMode.Read)  // Open for reading
            if (!file.canRead()) {
                return None
            }
            
            let reader = StringReader(file)
            let content = reader.readToEnd()
            reader.close()
            file.close()
            
            // Parse the YAML frontmatter
            let yamlParser = YamlFrontmatterParser()
            let yamlFrontmatterOpt = yamlParser.parseYamlFrontmatter(content)
            
            if (yamlFrontmatterOpt.isNone()) {
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
            
            // Create the SkillManifest
            return Some(
                SkillManifest(
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
            )
        } catch (ex: Exception) {
            // Log the exception or handle it appropriately
            return None
        }
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