/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.validators

import magic.skill.domain.models.ValidationResult
import std.collection.{ArrayList, HashMap}
import magic.skill.infrastructure.utils.YamlUtils

/**
 * YamlValidator implements validation for YAML content using the yaml4cj library.
 */
public class YamlValidator {
    /**
     * Validate YAML content syntax
     */
    public func validateYamlSyntax(content: String): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        if (!YamlUtils.validateYamlSyntax(content)) {
            errors.add("YAML syntax is invalid")
        }
        
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }

    /**
     * Validate YAML frontmatter structure
     */
    public func validateYamlFrontmatter(content: String): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        // Extract YAML frontmatter
        let frontmatterOpt = YamlUtils.extractYamlFrontmatter(content)
        
        if (frontmatterOpt.isNone()) {
            errors.add("No YAML frontmatter found in content")
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
        
        let frontmatter = frontmatterOpt.getOrThrow()
        
        // Parse the frontmatter to check for required fields
        let parsedYamlOpt = YamlUtils.parseYamlContent(frontmatter)
        
        if (parsedYamlOpt.isNone()) {
            errors.add("Could not parse YAML frontmatter")
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
        
        let parsedYaml = parsedYamlOpt.getOrThrow()
        
        // Check for required fields: name and description
        if (!parsedYaml.contains("name")) {
            errors.add("YAML frontmatter missing required 'name' field")
        }

        if (!parsedYaml.contains("description")) {
            errors.add("YAML frontmatter missing required 'description' field")
        }
        
        // Validate name field if present
        if (let Some(nameValue) <- parsedYaml.get("name")) {
            if (nameValue.isEmpty()) {
                errors.add("YAML frontmatter 'name' field cannot be empty")
            } else if (nameValue.size > 64) {
                errors.add("YAML frontmatter 'name' field exceeds 64 character limit")
            }
        }
        
        // Validate description field if present
        if (let Some(descriptionValue) <- parsedYaml.get("description")) {
            if (descriptionValue.isEmpty()) {
                errors.add("YAML frontmatter 'description' field cannot be empty")
            } else if (descriptionValue.size > 1024) {
                errors.add("YAML frontmatter 'description' field exceeds 1024 character limit")
            }
        }
        
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }
}