/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.core.skill

import std.collection.ArrayList

/**
 * Validates skills against the agentskills standard specification
 */
public class SkillValidator {
    /**
     * List of rules to validate against
     */
    let validationRules: ArrayList<ValidationRule>

    public init() {
        validationRules = ArrayList<ValidationRule>()
        // Initialize with standard validation rules
        initializeStandardRules()
    }

    /**
     * Initialize with standard validation rules based on agentskills specification
     */
    private func initializeStandardRules(): Unit {
        // Rule for skill name validation
        validationRules.add(ValidationRule(
            "skill-name-validation",
            "Validate that skill name follows agentskills standard (1-64 chars, lowercase, hyphens only)",
            "Skill name must be 1-64 characters, lowercase, with hyphens only, not starting or ending with hyphen"
        ))

        // Rule for skill description validation
        validationRules.add(ValidationRule(
            "skill-description-validation",
            "Validate that skill description follows agentskills standard (1-1024 chars)",
            "Skill description must be 1-1024 characters and not empty"
        ))

        // Rule for YAML frontmatter validation
        validationRules.add(ValidationRule(
            "yaml-frontmatter-validation",
            "Validate that SKILL.md contains proper YAML frontmatter",
            "SKILL.md must contain valid YAML frontmatter with at least name and description fields"
        ))
    }

    /**
     * Validate a skill against the agentskills standard
     */
    public func validateSkill(skill: Skill): (Bool, Array<String>) {
        let issues = ArrayList<String>()
        
        // Validate name
        if (!validateSkillName(skill.name)) {
            issues.add("Skill name '${skill.name}' does not follow agentskills standard")
        }

        // Validate description
        if (!validateSkillDescription(skill.description)) {
            issues.add("Skill description does not follow agentskills standard")
        }

        // Validate other fields as needed
        if (skill.license.isSome() && skill.license.getOrThrow().isEmpty()) {
            issues.add("License field should not be empty if provided")
        }

        if (skill.compatibility.isSome() && skill.compatibility.getOrThrow().size > 500) {
            issues.add("Compatibility field exceeds 500 character limit")
        }

        return (issues.isEmpty(), issues.toArray())
    }

    /**
     * Validate skill name according to agentskills standard
     */
    private func validateSkillName(name: String): Bool {
        // Check length (1-64 characters)
        if (name.size < 1 || name.size > 64) {
            return false
        }

        // Check that it only contains lowercase alphanumeric characters and hyphens
        for (char in name) {
            let charStr = char.toString()
            if (!((charStr >= "a" && charStr <= "z") ||
                  (charStr >= "0" && charStr <= "9") ||
                  charStr == "-")) {
                return false
            }
        }

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
    private func validateSkillDescription(description: String): Bool {
        // Check length (1-1024 characters)
        if (description.size < 1 || description.size > 1024) {
            return false
        }

        return true
    }
}