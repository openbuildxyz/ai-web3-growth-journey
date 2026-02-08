/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.{Skill, SkillValidator}
import std.collection.ArrayList
import magic.log.LogUtils

/**
 * Enhanced skill validator that checks compliance with agentskills standard
 * Enhanced with uctoo-inspired features for security, resource management, and advanced validation
 */
public class StandardSkillValidator {
    private let _baseValidator: SkillValidator
    private let _securityValidator: SecurityValidator
    private let _resourceValidator: ResourceValidator
    private let _formatValidator: FormatValidator

    public init() {
        _baseValidator = SkillValidator()
        _securityValidator = SecurityValidator()
        _resourceValidator = ResourceValidator()
        _formatValidator = FormatValidator()
    }

    /**
     * Validate a skill against the agentskills standard with uctoo-inspired enhancements
     */
    public func validateSkill(skill: Skill): (Bool, Array<String>) {
        let issues = ArrayList<String>()

        // Base validation
        let (baseValid, baseIssues) = _validateBaseSkill(skill)
        for (issue in baseIssues) {
            issues.add(issue)
        }

        // Security validation
        let (securityValid, securityIssues) = _securityValidator.validateSkillSecurity(skill)
        for (issue in securityIssues) {
            issues.add(issue)
        }

        // Resource validation
        let (resourceValid, resourceIssues) = _resourceValidator.validateSkillResources(skill)
        for (issue in resourceIssues) {
            issues.add(issue)
        }

        // Format validation
        let (formatValid, formatIssues) = _formatValidator.validateSkillFormat(skill)
        for (issue in formatIssues) {
            issues.add(issue)
        }

        return (issues.isEmpty(), issues.toArray())
    }

    /**
     * Validate base skill properties
     */
    private func _validateBaseSkill(skill: Skill): (Bool, Array<String>) {
        let issues = ArrayList<String>()

        // Validate name
        if (!validateSkillName(skill.name)) {
            issues.add("Skill name '${skill.name}' does not follow agentskills standard: must be 1-64 characters, lowercase, with hyphens only, not starting or ending with hyphen")
        }

        // Validate description
        if (!validateSkillDescription(skill.description)) {
            issues.add("Skill description does not follow agentskills standard: must be 1-1024 characters and not empty")
        }

        // Validate other fields as needed
        if (let Some(licenseValue) <- skill.license) {
            if (licenseValue.isEmpty()) {
                issues.add("License field should not be empty if provided")
            }
        }

        if (let Some(compatibilityValue) <- skill.compatibility) {
            if (compatibilityValue.size > 500) {
                issues.add("Compatibility field exceeds 500 character limit")
            }
        }

        // Validate metadata keys for uniqueness
        for ((key, _) in skill.metadata) {
            if (key.isEmpty()) {
                issues.add("Metadata keys should not be empty")
            }
        }

        return (issues.isEmpty(), issues.toArray())
    }

    /**
     * Validate skill name according to agentskills standard
     */
    public func validateSkillName(name: String): Bool {
        // Check length (1-64 characters)
        if (name.size < 1 || name.size > 64) {
            return false
        }

        // Check that it only contains lowercase alphanumeric characters and hyphens
        // For now, skip the character validation as a placeholder
        // until we can implement proper character comparison

        // Check that it doesn't start or end with a hyphen
        if (name.startsWith("-") || name.endsWith("-")) {
            return false
        }

        // Check that it doesn't contain consecutive hyphens
        if (name.contains("--")) {
            return false
        }

        return true
    }

    /**
     * Validate skill description according to agentskills standard
     */
    public func validateSkillDescription(description: String): Bool {
        // Check length (1-1024 characters)
        if (description.size < 1 || description.size > 1024) {
            return false
        }

        return true
    }

    /**
     * Validate a SKILL.md content string with uctoo-inspired enhancements
     */
    public func validateSkillMdContent(content: String): (Bool, Array<String>) {
        let issues = ArrayList<String>()

        // Check if content contains YAML frontmatter
        if (!content.startsWith("---")) {
            issues.add("SKILL.md must start with YAML frontmatter (---)")
        } else {
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
                issues.add("SKILL.md must have closing YAML frontmatter marker (---)")
            } else {
                // Extract YAML content and validate required fields
                let yamlContent = String.join(lines[1..yamlEndIndex], delimiter: "\n")
                if (!yamlContent.contains("name:") || !yamlContent.contains("description:")) {
                    issues.add("YAML frontmatter must contain 'name' and 'description' fields")
                }

                // Validate security-related fields
                if (yamlContent.contains("security:")) {
                    // Additional validation for security configuration
                    if (yamlContent.contains("security: high") && yamlContent.contains("network-access: true")) {
                        issues.add("High security level should not allow network access by default")
                    }
                }

                // Validate resource limits
                if (yamlContent.contains("resource-limits:")) {
                    // Validate resource limits configuration
                    if (yamlContent.contains("max-memory:")) {
                        // Check if memory limit is reasonable
                        let memoryPattern = "max-memory: ([0-9]+[MG])"
                        // For now, just add a placeholder check
                    }
                }
            }
        }

        return (issues.isEmpty(), issues.toArray())
    }

    /**
     * Validate skill with comprehensive security checks
     */
    public func validateSkillWithSecurityChecks(skill: Skill): (Bool, Array<String>) {
        let (isValid, issues) = validateSkill(skill)

        if (isValid) {
            LogUtils.info("Skill '${skill.name}' passed all validation checks")
        } else {
            LogUtils.info("Skill '${skill.name}' failed validation with ${issues.size} issues")
            for (issue in issues) {
                LogUtils.error("Validation issue: ${issue}")
            }
        }

        return (isValid, issues)
    }
}

/**
 * Security validator for uctoo-inspired security checks
 */
public class SecurityValidator {
    public func validateSkillSecurity(skill: Skill): (Bool, Array<String>) {
        let issues = ArrayList<String>()

        // Check for potentially dangerous capabilities
        if (let Some(allowedTools) <- skill.allowedTools) {
            if (allowedTools.contains("shell-execution") || allowedTools.contains("file-system-write")) {
                issues.add("Skill requests potentially dangerous capabilities: ${allowedTools}")
            }
        }

        // Check for security-sensitive metadata
        for ((key, value) in skill.metadata) {
            if (key.toAsciiLower().contains("secret") || key.toAsciiLower().contains("key") || key.toAsciiLower().contains("token")) {
                issues.add("Skill contains potentially sensitive information in metadata key: ${key}")
            }
        }

        return (issues.isEmpty(), issues.toArray())
    }
}

/**
 * Resource validator for uctoo-inspired resource management checks
 */
public class ResourceValidator {
    public func validateSkillResources(skill: Skill): (Bool, Array<String>) {
        let issues = ArrayList<String>()

        // In a real implementation, we would check for resource-related metadata
        // For now, we'll just validate that the skill doesn't claim excessive resources

        // Check for resource-related metadata
        for ((key, value) in skill.metadata) {
            if (key.toAsciiLower().contains("memory") && value.toAsciiLower().contains("unlimited")) {
                issues.add("Skill claims unlimited memory resources: ${key}=${value}")
            }
            if (key.toAsciiLower().contains("timeout") && value.toAsciiLower().contains("none")) {
                issues.add("Skill disables execution timeout: ${key}=${value}")
            }
        }

        return (issues.isEmpty(), issues.toArray())
    }
}

/**
 * Format validator for uctoo-inspired format compliance checks
 */
public class FormatValidator {
    public func validateSkillFormat(skill: Skill): (Bool, Array<String>) {
        let issues = ArrayList<String>()

        // Check if the skill name follows proper naming conventions
        if (skill.name.contains("_")) {
            issues.add("Skill name uses underscores instead of hyphens: ${skill.name}")
        }

        // Check if the description is meaningful
        if (skill.description.toAsciiLower().contains("tbd") ||
            skill.description.toAsciiLower().contains("to be defined") ||
            skill.description.toAsciiLower().contains("placeholder")) {
            issues.add("Skill description appears to be a placeholder: ${skill.description}")
        }

        // Check for proper instruction content
        if (skill.instructions.trimAscii().isEmpty()) {
            issues.add("Skill has empty instructions")
        }

        return (issues.isEmpty(), issues.toArray())
    }
}