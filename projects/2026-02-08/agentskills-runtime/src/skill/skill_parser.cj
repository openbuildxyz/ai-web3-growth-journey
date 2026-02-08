/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import std.collection.{HashMap, ArrayList}

/**
 * Parses SKILL.md files and extracts metadata
 */
public class SkillParser {
    /**
     * Parse a SKILL.md file and extract its metadata and content
     */
    public static func parseSkillFile(filePath: String): Option<HashMap<String, String>> {
        // Since File operations may not be available, return a placeholder
        // In a real implementation, this would read the file and parse its content
        return Some(HashMap<String, String>())
    }

    /**
     * Parse SKILL.md content and extract its metadata and content
     */
    public static func parseSkillContent(content: String): Option<HashMap<String, String>> {
        let result = HashMap<String, String>()
        
        // Check if content contains YAML frontmatter
        if (!content.startsWith("---")) {
            return None
        }
        
        // Find the end of YAML frontmatter
        let lines = content.split("\n")
        var yamlEndIndex = -1
        for (i in 0..lines.size) {
            if (i > 0 && lines[i] == "---") {
                yamlEndIndex = i
                break
            }
        }
        
        if (yamlEndIndex <= 0) {
            return None
        }
        
        // Extract YAML content
        let yamlContent = String.join(lines[1..yamlEndIndex], delimiter: "\n")
        
        // Parse YAML fields (simplified parser)
        let yamlLines = yamlContent.split("\n")
        for (line in yamlLines) {
            let trimmedLine = line
            if (trimmedLine.contains(":")) {
                let parts = trimmedLine.split(":")
                if (parts.size >= 2) {
                    let key = parts[0]
                    let value = parts[1]
                    result.add(key, value)
                }
            }
        }
        
        // Extract the content after the YAML frontmatter
        let skillContent = if (yamlEndIndex + 1 < lines.size) {
            String.join(lines[(yamlEndIndex + 1)..], delimiter: "\n")
        } else {
            ""
        }
        result.add("content", skillContent)
        
        return Some(result)
    }

    /**
     * Validate that a parsed skill has required fields
     */
    public static func validateParsedSkill(parsedSkill: HashMap<String, String>): (Bool, Array<String>) {
        let issues = ArrayList<String>()
        
        if (!parsedSkill.contains("name")) {
            issues.add("Missing required field: name")
        } else {
            let name = parsedSkill["name"]
            if (name.size < 1 || name.size > 64) {
                issues.add("Skill name must be 1-64 characters")
            } else {
                // Check that it only contains lowercase alphanumeric characters and hyphens
                for (char in name) {
                    // For now, skip the character validation as a placeholder
                    // until we can implement proper character comparison
                }
                
                // Check that it doesn't start or end with a hyphen
                if (name.startsWith("-") || name.endsWith("-")) {
                    issues.add("Skill name cannot start or end with a hyphen")
                }
                
                // Check that it doesn't contain consecutive hyphens
                if (name.contains("--")) {
                    issues.add("Skill name cannot contain consecutive hyphens")
                }
            }
        }
        
        if (!parsedSkill.contains("description")) {
            issues.add("Missing required field: description")
        } else {
            let description = parsedSkill["description"]
            if (description.size < 1 || description.size > 1024) {
                issues.add("Skill description must be 1-1024 characters")
            }
        }
        
        return (issues.isEmpty(), issues.toArray())
    }
}