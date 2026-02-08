/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.validators

import magic.skill.domain.interfaces.SkillValidator
import magic.skill.domain.models.{SkillManifest, ValidationResult}
import std.collection.ArrayList
import std.time.DateTime

/**
 * SkillValidatorImpl implements the SkillValidator interface for validating skills against the agentskills specification.
 */
public class SkillValidatorImpl <: SkillValidator {
    /**
     * Validate a skill manifest
     */
    public func validate(manifest: SkillManifest): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        // Validate name
        if (!isValidName(manifest.name)) {
            errors.add("Skill name '${manifest.name}' does not follow agentskills standard: must be 1-64 characters, lowercase, with hyphens only, not starting or ending with hyphen")
        }
        
        // Validate description
        if (!isValidDescription(manifest.description)) {
            errors.add("Skill description does not follow agentskills standard: must be 1-1024 characters and not empty")
        }
        
        // Validate compatibility field
        if (let Some(compatibilityValue) <- manifest.compatibility) {
            if (compatibilityValue.size > 500) {
                errors.add("Compatibility field exceeds 500 character limit")
            }
        }
        
        // Validate metadata keys
        for ((key, _) in manifest.metadata) {
            if (key.isEmpty()) {
                errors.add("Metadata keys should not be empty")
            }
        }
        
        // Check if validation passed
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }

    /**
     * Check if a skill name is valid according to agentskills standard
     */
    public func isValidName(name: String): Bool {
        // Check length (1-64 characters)
        if (name.size < 1 || name.size > 64) {
            return false
        }

        // Check that it only contains lowercase alphanumeric characters and hyphens
        for (i in 0..name.size) {
            let char = name[i]
            // Convert character to string for comparison using proper API
            let charStr = String.fromUtf8([char])

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
     * Check if a skill description is valid according to agentskills standard
     */
    public func isValidDescription(description: String): Bool {
        // Check length (1-1024 characters)
        if (description.size < 1 || description.size > 1024) {
            return false
        }

        return true
    }
}