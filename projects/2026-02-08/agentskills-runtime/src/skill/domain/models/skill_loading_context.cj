/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.domain.models

/**
 * SkillLoadingContext contains context information for loading and instantiating a skill from a SKILL.md file.
 * Part of the application layer.
 */
public class SkillLoadingContext {
    public let manifest: SkillManifest  // The parsed skill manifest
    public let resourceLoader: SkillResourceLoader  // Resource loader for the skill
    public let validationResult: ValidationResult  // Result of validating the skill
    public let creationDate: Int64  // Timestamp of skill creation

    public init(
        manifest!: SkillManifest,
        resourceLoader!: SkillResourceLoader,
        validationResult!: ValidationResult,
        creationDate!: Int64
    ) {
        this.manifest = manifest
        this.resourceLoader = resourceLoader
        this.validationResult = validationResult
        this.creationDate = creationDate
    }
}