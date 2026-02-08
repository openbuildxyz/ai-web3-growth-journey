/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.application

import magic.skill.domain.models.{SkillManifest, ValidationResult}
import magic.skill.infrastructure.validators.{SkillValidatorImpl, YamlValidator}
import std.collection.ArrayList

/**
 * SkillValidationService implements validation of skills against the agentskills specification.
 */
public class SkillValidationService {
    private let skillValidator: SkillValidatorImpl
    private let yamlValidator: YamlValidator

    public init() {
        this.skillValidator = SkillValidatorImpl()
        this.yamlValidator = YamlValidator()
    }

    /**
     * Validate a skill manifest against the agentskills specification
     */
    public func validateSkillManifest(manifest: SkillManifest): ValidationResult {
        // Use the skill validator to validate the manifest
        return this.skillValidator.validate(manifest)
    }

    /**
     * Validate a skill name per agentskills specification
     */
    public func validateSkillName(name: String): (Bool, String) {
        let isValid = this.skillValidator.isValidName(name)
        let message = if (isValid) {
            "Skill name is valid"
        } else {
            "Skill name '${name}' does not follow agentskills standard: must be 1-64 characters, lowercase, with hyphens only, not starting or ending with hyphen"
        }
        return (isValid, message)
    }

    /**
     * Validate a skill description per agentskills specification
     */
    public func validateSkillDescription(description: String): (Bool, String) {
        let isValid = this.skillValidator.isValidDescription(description)
        let message = if (isValid) {
            "Skill description is valid"
        } else {
            "Skill description does not follow agentskills standard: must be 1-1024 characters and not empty"
        }
        return (isValid, message)
    }

    /**
     * Validate skill content (YAML and markdown)
     */
    public func validateSkillContent(content: String): ValidationResult {
        // Validate YAML syntax
        let yamlValidation = this.yamlValidator.validateYamlSyntax(content)
        
        if (!yamlValidation.isValid) {
            return yamlValidation
        }
        
        // Validate YAML frontmatter structure
        let frontmatterValidation = this.yamlValidator.validateYamlFrontmatter(content)
        
        return frontmatterValidation
    }
}